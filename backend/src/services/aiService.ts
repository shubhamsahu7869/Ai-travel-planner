import OpenAI from "openai";
import { ItineraryDay, BudgetEstimate, HotelSuggestion } from "../models/Trip";

const aiProvider = process.env.AI_PROVIDER || (process.env.OPENROUTER_API_KEY ? "openrouter" : "openai");
const apiKey = aiProvider === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY;
const aiModel = aiProvider === "openrouter" ? process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free" : "gpt-4o-mini";
const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: aiProvider === "openrouter" ? "https://openrouter.ai/api/v1" : undefined,
      defaultHeaders:
        aiProvider === "openrouter"
          ? {
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "AI Travel Planner",
            }
          : undefined,
    })
  : null;

console.log(client ? `AI provider configured: ${aiProvider} (${aiModel})` : "AI provider not configured; using local fallback");

function safeNumber(value: number) {
  return Number(value.toFixed(2));
}

function parseAiJson<T>(rawText: string): T {
  const output = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(output) as T;
  } catch {
    // Try extracting JSON from a response that contains extra text.
  }

  const firstBracket = output.indexOf("[");
  const lastBracket = output.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1) {
    try {
      return JSON.parse(output.slice(firstBracket, lastBracket + 1));
    } catch {
      // Try object extraction below.
    }
  }

  const firstBrace = output.indexOf("{");
  const lastBrace = output.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(output.slice(firstBrace, lastBrace + 1)) as T;
  }

  return JSON.parse(output) as T;
}

function extractText(response: any): string {
  if (!response) return "";
  if (typeof response.choices?.[0]?.message?.content === "string") {
    return response.choices[0].message.content;
  }
  if (typeof response.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }
  if (Array.isArray(response.output)) {
    return response.output
      .flatMap((item: any) => item?.content?.map((content: any) => content?.text || "") || [])
      .join(" ");
  }
  return "";
}

interface ItineraryInput {
  destination: string;
  numberOfDays: number;
  interests: string[];
}

interface BudgetInput {
  destination: string;
  numberOfDays: number;
  budgetType: string;
}

interface HotelInput {
  destination: string;
  budgetType: string;
}

interface RegenerateInput {
  itinerary: ItineraryDay[];
  dayNumber: number;
  prompt: string;
  destination: string;
  interests: string[];
}

interface MoodInput {
  itinerary: ItineraryDay[];
  mood: string;
  destination: string;
  numberOfDays: number;
  budgetType: string;
  interests: string[];
}

function exactPlaceInstruction(destination: string) {
  return `Return only exact, real, destination-specific place names for ${destination}. Do not invent fake places. Do not use generic phrases like "local highlight", "best spots", "recommended restaurant", "popular street food item", "relaxing evening stroll", "local specialty", "main attraction", or "popular market". Every field must include at least one specific attraction, temple, market, cafe, viewpoint, ghat, restaurant, street, museum, neighborhood, beach, park, palace, fort, or activity location. Make every day unique and avoid repeated text.`;
}

const indianDestinations = new Set([
  "agra",
  "ahmedabad",
  "amritsar",
  "aurangabad",
  "bengaluru",
  "bangalore",
  "bhopal",
  "chandigarh",
  "chennai",
  "coimbatore",
  "darjeeling",
  "delhi",
  "gangtok",
  "goa",
  "gwalior",
  "hyderabad",
  "indore",
  "jaipur",
  "jaisalmer",
  "jodhpur",
  "kanpur",
  "kochi",
  "kolkata",
  "leh",
  "lucknow",
  "madurai",
  "manali",
  "mumbai",
  "mysore",
  "ooty",
  "pune",
  "rishikesh",
  "shimla",
  "surat",
  "udaipur",
  "varanasi",
  "vrindavan",
]);

function fallbackCurrency(destination: string) {
  return indianDestinations.has(destination.trim().toLowerCase()) ? "INR" : "USD";
}

const destinationGuides: Record<string, Omit<ItineraryDay, "dayNumber">[]> = {
  vrindavan: [
    {
      title: "Banke Bihari Temple, ISKCON, and Prem Mandir",
      morning: "Visit Shri Banke Bihari Temple and Radha Vallabh Temple",
      afternoon: "Explore ISKCON Vrindavan and the temples around Raman Reti Road",
      evening: "Visit Prem Mandir for the evening light show",
      foodSuggestion: "Try kachori, peda, and lassi near Loi Bazaar",
      travelTip: "Reach Shri Banke Bihari Temple early because the lanes get crowded after morning darshan",
    },
    {
      title: "Nidhivan, Seva Kunj, and Yamuna Aarti",
      morning: "Visit Nidhivan and Seva Kunj",
      afternoon: "Explore Radha Raman Temple and Govind Dev Ji Temple",
      evening: "Attend Yamuna Aarti at Keshi Ghat",
      foodSuggestion: "Try aloo tikki and rabri near Keshi Ghat",
      travelTip: "Nidhivan has fixed visiting hours, so check timings before leaving",
    },
    {
      title: "Heritage Temples and Loi Bazaar",
      morning: "Visit Madan Mohan Temple and Shahji Temple",
      afternoon: "Shop for devotional items and sweets at Loi Bazaar",
      evening: "Visit Rangji Temple and walk near Parikrama Marg",
      foodSuggestion: "Try Vrindavan peda and thandai at Brijwasi Sweets",
      travelTip: "Use e-rickshaws inside Vrindavan because many temple lanes are narrow",
    },
  ],
  manali: [
    {
      title: "Hadimba Temple, Old Manali, and Mall Road",
      morning: "Visit Hadimba Devi Temple and walk through the surrounding cedar forest",
      afternoon: "Explore Manu Temple and cafes in Old Manali",
      evening: "Walk along Mall Road Manali and visit the Tibetan Monastery",
      foodSuggestion: "Try trout, siddu, or thukpa at a cafe in Old Manali",
      travelTip: "Start early for Hadimba Devi Temple because parking and crowds build up by late morning",
    },
    {
      title: "Solang Valley Adventure Day",
      morning: "Travel to Solang Valley for paragliding, ziplining, or ropeway views",
      afternoon: "Visit Anjani Mahadev Temple near Solang Valley if weather allows",
      evening: "Return to Manali and relax beside the Beas River",
      foodSuggestion: "Try momos and hot chocolate near Solang Valley market stalls",
      travelTip: "Confirm adventure activity prices at Solang Valley before booking",
    },
    {
      title: "Vashisht, Jogini Waterfall, and Local Markets",
      morning: "Visit Vashisht Hot Springs and Vashisht Temple",
      afternoon: "Hike to Jogini Waterfall from Vashisht village",
      evening: "Shop for woollens and Himachali handicrafts at Manu Market",
      foodSuggestion: "Try Himachali dham or siddu near Vashisht village",
      travelTip: "Wear good walking shoes for the Jogini Waterfall trail",
    },
    {
      title: "Atal Tunnel and Sissu Excursion",
      morning: "Drive through Atal Tunnel towards Sissu",
      afternoon: "Visit Sissu Waterfall and enjoy views of the Chandra River valley",
      evening: "Return to Manali through Atal Tunnel before dark",
      foodSuggestion: "Try rajma chawal or Maggi at Sissu cafes",
      travelTip: "Check road and weather updates before planning Atal Tunnel or Rohtang Pass routes",
    },
  ],
};

function buildFallbackItinerary(destination: string, numberOfDays: number): ItineraryDay[] {
  const key = destination.trim().toLowerCase();
  const guide = destinationGuides[key];

  if (guide) {
    return Array.from({ length: numberOfDays }, (_, index) => ({
      dayNumber: index + 1,
      ...guide[index % guide.length],
    }));
  }

  return Array.from({ length: numberOfDays }, (_, index) => ({
    dayNumber: index + 1,
    title: `OpenAI setup required for exact ${destination} places`,
    morning: `Add a valid OPENAI_API_KEY with billing enabled to generate exact morning places in ${destination}`,
    afternoon: `The local fallback only has curated exact places for Vrindavan and Manali; OpenAI is required for exact ${destination} attractions`,
    evening: `Restart the backend after updating backend/.env so ${destination} plans use live AI generation`,
    foodSuggestion: `OpenAI will return specific ${destination} restaurants or food streets when the API call succeeds`,
    travelTip: `Check the backend terminal for the OpenAI error if exact ${destination} places are not generated`,
  }));
}

export async function generateItinerary(input: ItineraryInput) {
  if (client) {
    console.log("Using OpenAI itinerary generation");
    const prompt = `You are an expert global travel planner with knowledge of real places worldwide.

Create a ${input.numberOfDays}-day itinerary for ${input.destination}.
Traveler interests: ${input.interests.join(", ") || "general sightseeing"}.

Return JSON in this exact shape:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Short theme using real place names",
      "morning": "Exact real place names, max 18 words",
      "afternoon": "Exact real place names, max 18 words",
      "evening": "Exact real place names, max 18 words",
      "foodSuggestion": "Exact restaurant, food street, market, cafe, or famous local food area, max 18 words",
      "travelTip": "Practical tip with exact area, attraction, ticket, timing, or transit detail, max 18 words"
    }
  ]
}

The itinerary array must contain exactly ${input.numberOfDays} items.
${exactPlaceInstruction(input.destination)}

Only output JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: Math.max(500, input.numberOfDays * 170),
        temperature: 0.2,
        ...(aiProvider === "openrouter" ? {} : { response_format: { type: "json_object" as const } }),
      });

      const rawText = extractText(response);
      const parsed = parseAiJson<{ itinerary?: ItineraryDay[] } | ItineraryDay[]>(rawText);
      const itinerary = Array.isArray(parsed) ? parsed : parsed.itinerary;
      if (Array.isArray(itinerary) && itinerary.length === input.numberOfDays) {
        return itinerary;
      }
      console.error("OpenAI itinerary response had an unexpected shape", rawText);
    } catch (error) {
      console.error("OpenAI itinerary generation failed, using fallback", error);
    }
  }

  console.log("Using mock itinerary generation");
  return buildFallbackItinerary(input.destination, input.numberOfDays);
}

export async function generateBudgetEstimate(input: BudgetInput) {
  if (client) {
    const prompt = `Provide a JSON budget estimate for a ${input.numberOfDays}-day trip to ${input.destination} with a ${input.budgetType} budget.

Important currency rule:
- If ${input.destination} is in India, use INR.
- Otherwise identify the destination country and use that country's local currency code, such as USD, EUR, GBP, AED, JPY, SGD, THB, AUD, CAD, etc.
- The currency field must be a 3-letter ISO currency code.

Use keys: currency, flights, accommodation, food, transport, activities, miscellaneous, total.
All amounts must be realistic numbers in the selected local currency.
Only output JSON.`;
    try {
      const response = await client.chat.completions.create({
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.2,
        ...(aiProvider === "openrouter" ? {} : { response_format: { type: "json_object" as const } }),
      });

      const rawText = extractText(response);
      return parseAiJson<BudgetEstimate>(rawText);
    } catch (error) {
      console.error("OpenAI budget generation failed, using fallback", error);
    }
  }

  const multiplier = input.budgetType === "Low" ? 0.7 : input.budgetType === "High" ? 1.6 : 1.0;
  const currency = fallbackCurrency(input.destination);
  const base = currency === "INR"
    ? { flights: 8000, accommodation: 2500, food: 900, transport: 600, activities: 900, miscellaneous: 500 }
    : { flights: 250, accommodation: 90, food: 45, transport: 25, activities: 35, miscellaneous: 20 };
  return {
    currency,
    flights: safeNumber(base.flights * multiplier),
    accommodation: safeNumber(base.accommodation * input.numberOfDays * multiplier),
    food: safeNumber(base.food * input.numberOfDays * multiplier),
    transport: safeNumber(base.transport * input.numberOfDays * multiplier),
    activities: safeNumber(base.activities * input.numberOfDays * multiplier),
    miscellaneous: safeNumber(base.miscellaneous * input.numberOfDays * multiplier),
    total: safeNumber(
      base.flights * multiplier +
        (base.accommodation + base.food + base.transport + base.activities + base.miscellaneous) * input.numberOfDays * multiplier,
    ),
  };
}

export async function generateHotelSuggestions(input: HotelInput) {
  if (client) {
    const prompt = `Return JSON in this exact shape for travel to ${input.destination} with a ${input.budgetType} budget:
{
  "hotels": [
    {
      "name": "real hotel name",
      "category": "Budget, Mid Range, Luxury, Boutique, Hostel, Guesthouse, or Resort",
      "pricePerNight": number,
      "rating": number,
      "reason": "why it matches the trip"
    }
  ]
}
Return exactly 3 real hotel suggestions. Only output JSON.`;
    try {
      const response = await client.chat.completions.create({
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
        ...(aiProvider === "openrouter" ? {} : { response_format: { type: "json_object" as const } }),
      });

      const rawText = extractText(response);
      const parsed = parseAiJson<{ hotels?: HotelSuggestion[] } | HotelSuggestion[]>(rawText);
      const hotels = Array.isArray(parsed) ? parsed : parsed.hotels;
      if (Array.isArray(hotels)) {
        return hotels;
      }
      console.error("OpenAI hotel response had an unexpected shape", rawText);
    } catch (error) {
      console.error("OpenAI hotel generation failed, using fallback", error);
    }
  }

  const ratingBase = input.budgetType === "High" ? 4.7 : input.budgetType === "Low" ? 3.8 : 4.2;
  const priceBase = input.budgetType === "Low" ? 70 : input.budgetType === "High" ? 190 : 125;
  return [
    {
      name: `${input.destination} Central Stay`,
      category: input.budgetType === "Low" ? "Budget" : input.budgetType === "High" ? "Luxury" : "Comfort",
      pricePerNight: safeNumber(priceBase),
      rating: safeNumber(ratingBase),
      reason: `OpenAI is required for verified hotel names; this is a local fallback suggestion.`,
    },
    {
      name: `${input.destination} Heritage Inn`,
      category: input.budgetType === "Low" ? "Guesthouse" : input.budgetType === "High" ? "Boutique" : "Standard",
      pricePerNight: safeNumber(priceBase + 35),
      rating: safeNumber(ratingBase - 0.2),
      reason: `Use live AI mode to generate real hotel recommendations for ${input.destination}.`,
    },
    {
      name: `${input.destination} Traveler Retreat`,
      category: input.budgetType === "Low" ? "Hostel" : input.budgetType === "High" ? "Resort" : "Business",
      pricePerNight: safeNumber(priceBase + 55),
      rating: safeNumber(ratingBase - 0.1),
      reason: `Fallback hotel placeholder shown because live AI hotel generation was unavailable.`,
    },
  ];
}

export async function regenerateDay(input: RegenerateInput) {
  const currentDay = input.itinerary.find((day) => day.dayNumber === input.dayNumber);
  if (!currentDay) {
    throw new Error("Day not found");
  }

  if (client) {
    const prompt = `Regenerate day ${input.dayNumber} of a ${input.destination} itinerary. User request: ${input.prompt}. Interests: ${input.interests.join(", ")}.
Return JSON in this exact shape:
{
  "day": {
    "dayNumber": ${input.dayNumber},
    "title": string,
    "morning": string,
    "afternoon": string,
    "evening": string,
    "foodSuggestion": string,
    "travelTip": string
  }
}
${exactPlaceInstruction(input.destination)}
Only output JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.4,
        ...(aiProvider === "openrouter" ? {} : { response_format: { type: "json_object" as const } }),
      });

      const rawText = extractText(response);
      const parsed = parseAiJson<any>(rawText);
      const regenerated: ItineraryDay = parsed.day ?? parsed;
      return input.itinerary.map((day) => (day.dayNumber === input.dayNumber ? regenerated : day));
    } catch (error) {
      console.error("OpenAI day regeneration failed, using fallback", error);
    }
  }

  const regeneratedDay: ItineraryDay = {
    ...buildFallbackItinerary(input.destination, input.dayNumber)[input.dayNumber - 1],
    dayNumber: input.dayNumber,
  };

  return input.itinerary.map((day) => (day.dayNumber === input.dayNumber ? regeneratedDay : day));
}

export async function optimizeTripMood(input: MoodInput) {
  if (client) {
    const prompt = `Optimize this itinerary for a ${input.mood} mood on a ${input.numberOfDays}-day ${input.destination} trip with a ${input.budgetType} budget. Interests: ${input.interests.join(", ")}.
Current itinerary: ${JSON.stringify(input.itinerary)}
Return JSON in this exact shape:
{
  "itinerary": [
    {
      "dayNumber": number,
      "title": string,
      "morning": string,
      "afternoon": string,
      "evening": string,
      "foodSuggestion": string,
      "travelTip": string
    }
  ]
}
${exactPlaceInstruction(input.destination)}
Only output JSON.`;

    try {
      const response = await client.chat.completions.create({
        model: aiModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: Math.max(900, input.numberOfDays * 260),
        temperature: 0.4,
        ...(aiProvider === "openrouter" ? {} : { response_format: { type: "json_object" as const } }),
      });

      const rawText = extractText(response);
      const parsed = parseAiJson<{ itinerary?: ItineraryDay[] } | ItineraryDay[]>(rawText);
      const optimized = Array.isArray(parsed) ? parsed : parsed.itinerary;
      if (Array.isArray(optimized) && optimized.length === input.itinerary.length) {
        return optimized;
      }
    } catch (error) {
      console.error("OpenAI mood optimization failed, using fallback", error);
    }
  }

  return input.itinerary.map((day) => ({
    ...day,
    title: `${day.title} - ${input.mood}`,
    morning: `${day.morning} for a ${input.mood.toLowerCase()} start`,
    afternoon: `${day.afternoon} with a ${input.mood.toLowerCase()} rhythm`,
    evening: `${day.evening} shaped for a ${input.mood.toLowerCase()} evening`,
  }));
}

export async function addTripActivity(itinerary: ItineraryDay[], dayNumber: number, section: keyof ItineraryDay, activity: string) {
  return itinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    return { ...day, [section]: `${day[section]} ${activity}` };
  });
}

export async function updateTripActivity(itinerary: ItineraryDay[], dayNumber: number, section: keyof ItineraryDay, activity: string) {
  return itinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    return { ...day, [section]: activity };
  });
}

export async function deleteTripActivityById(itinerary: ItineraryDay[], dayNumber: number, section: keyof ItineraryDay) {
  return itinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    return { ...day, [section]: "Removed activity" };
  });
}
