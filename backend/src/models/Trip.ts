import { Schema, model, Document, Types } from "mongoose";

export type BudgetType = "Low" | "Medium" | "High";
export type TripMood = "Relaxed" | "Packed" | "Romantic" | "Family Friendly" | "Adventure Heavy" | "Cultural";

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  foodSuggestion: string;
  travelTip: string;
}

export interface BudgetEstimate {
  currency: string;
  flights: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface HotelSuggestion {
  name: string;
  category: string;
  pricePerNight: number;
  rating: number;
  reason: string;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  numberOfDays: number;
  budgetType: BudgetType;
  interests: string[];
  itinerary: ItineraryDay[];
  budgetEstimate: BudgetEstimate;
  hotelSuggestions: HotelSuggestion[];
  mood?: TripMood;
  createdAt: Date;
  updatedAt: Date;
}

const itineraryDaySchema = new Schema<ItineraryDay>(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    morning: { type: String, required: true },
    afternoon: { type: String, required: true },
    evening: { type: String, required: true },
    foodSuggestion: { type: String, required: true },
    travelTip: { type: String, required: true },
  },
  { _id: false }
);

const hotelSuggestionSchema = new Schema<HotelSuggestion>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    destination: { type: String, required: true, trim: true },
    numberOfDays: { type: Number, required: true, min: 1 },
    budgetType: { type: String, required: true, enum: ["Low", "Medium", "High"] },
    interests: [{ type: String, required: true }],
    itinerary: { type: [itineraryDaySchema], default: [] },
    budgetEstimate: {
      currency: { type: String, default: "USD" },
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      miscellaneous: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    hotelSuggestions: { type: [hotelSuggestionSchema], default: [] },
    mood: { type: String, enum: ["Relaxed", "Packed", "Romantic", "Family Friendly", "Adventure Heavy", "Cultural"] },
  },
  { timestamps: true }
);

const Trip = model<ITrip>("Trip", tripSchema);
export default Trip;
