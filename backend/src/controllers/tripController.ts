import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import Trip from "../models/Trip";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  generateItinerary,
  generateBudgetEstimate,
  generateHotelSuggestions,
  regenerateDay as regenerateTripDay,
  optimizeTripMood,
  addTripActivity,
  updateTripActivity,
  deleteTripActivityById,
} from "../services/aiService";

const createTripSchema = z.object({
  destination: z.string().min(2),
  numberOfDays: z.number().int().min(1).max(14),
  budgetType: z.enum(["Low", "Medium", "High"]),
  interests: z.array(z.string()).min(1),
});

const updateTripSchema = z.object({
  destination: z.string().min(2).optional(),
  numberOfDays: z.number().int().min(1).max(14).optional(),
  budgetType: z.enum(["Low", "Medium", "High"]).optional(),
  interests: z.array(z.string()).optional(),
});

function invalidObjectId(res: Response) {
  return res.status(400).json({ success: false, message: "Invalid trip ID" });
}

async function findTrip(req: AuthRequest, res: Response) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return null;
  }

  const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
  if (!trip) {
    res.status(404).json({ success: false, message: "Trip not found" });
    return null;
  }
  return trip;
}

export async function getTrips(req: AuthRequest, res: Response) {
  try {
    const trips = await Trip.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch trips" });
  }
}

export async function createTrip(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { destination, numberOfDays, budgetType, interests } = createTripSchema.parse(req.body);

    const [itinerary, budgetEstimate, hotelSuggestions] = await Promise.all([
      generateItinerary({ destination, numberOfDays, interests }),
      generateBudgetEstimate({ destination, numberOfDays, budgetType }),
      generateHotelSuggestions({ destination, budgetType }),
    ]);

    const trip = await Trip.create({
      userId,
      destination,
      numberOfDays,
      budgetType,
      interests,
      itinerary,
      budgetEstimate,
      hotelSuggestions,
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", issues: error.errors });
    }
    console.error("Create trip failed", error);
    res.status(500).json({ success: false, message: "Unable to create trip" });
  }
}

export async function getTripById(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const trip = await findTrip(req, res);
    if (!trip) return;

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch trip" });
  }
}

export async function updateTrip(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const updates = updateTripSchema.parse(req.body);
    const trip = await findTrip(req, res);
    if (!trip) return;

    Object.assign(trip, updates);
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid update data", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to update trip" });
  }
}

export async function deleteTrip(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const trip = await findTrip(req, res);
    if (!trip) return;
    await trip.deleteOne();
    res.json({ success: true, message: "Trip deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to delete trip" });
  }
}

export async function regenerateDay(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const { dayNumber, prompt } = z.object({
      dayNumber: z.number().int().min(1),
      prompt: z.string().min(10),
    }).parse(req.body);

    const trip = await findTrip(req, res);
    if (!trip) return;

    trip.itinerary = await regenerateTripDay({
      itinerary: trip.itinerary,
      dayNumber,
      prompt,
      destination: trip.destination,
      interests: trip.interests,
    });
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to regenerate day" });
  }
}

export async function optimizeMood(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const { mood } = z.object({
      mood: z.enum(["Relaxed", "Packed", "Romantic", "Family Friendly", "Adventure Heavy", "Cultural"]),
    }).parse(req.body);

    const trip = await findTrip(req, res);
    if (!trip) return;

    trip.mood = mood;
    trip.itinerary = await optimizeTripMood({
      itinerary: trip.itinerary,
      mood,
      destination: trip.destination,
      numberOfDays: trip.numberOfDays,
      budgetType: trip.budgetType,
      interests: trip.interests,
    });
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid mood selection", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to optimize mood" });
  }
}

export async function addActivity(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const { dayNumber, section, activity } = z.object({
      dayNumber: z.number().int().min(1),
      section: z.enum(["morning", "afternoon", "evening", "foodSuggestion", "travelTip"]),
      activity: z.string().min(3),
    }).parse(req.body);

    const trip = await findTrip(req, res);
    if (!trip) return;

    trip.itinerary = await addTripActivity(trip.itinerary, dayNumber, section, activity);
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to add activity" });
  }
}

export async function updateActivity(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const { dayNumber, section, activity } = z.object({
      dayNumber: z.number().int().min(1),
      section: z.enum(["morning", "afternoon", "evening", "foodSuggestion", "travelTip"]),
      activity: z.string().min(3),
    }).parse(req.body);

    const trip = await findTrip(req, res);
    if (!trip) return;

    trip.itinerary = await updateTripActivity(trip.itinerary, dayNumber, section, activity);
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to update activity" });
  }
}

export async function deleteActivity(req: AuthRequest, res: Response) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return invalidObjectId(res);
    }

    const { dayNumber, section } = z.object({
      dayNumber: z.number().int().min(1),
      section: z.enum(["morning", "afternoon", "evening", "foodSuggestion", "travelTip"]),
    }).parse(req.body);

    const trip = await findTrip(req, res);
    if (!trip) return;

    trip.itinerary = await deleteTripActivityById(trip.itinerary, dayNumber, section);
    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", issues: error.errors });
    }
    res.status(500).json({ success: false, message: "Unable to delete activity" });
  }
}
