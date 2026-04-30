"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

type ItinerarySection = "morning" | "afternoon" | "evening" | "foodSuggestion" | "travelTip";

interface ItineraryDay {
  dayNumber: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  foodSuggestion: string;
  travelTip: string;
}

interface BudgetEstimate {
  currency: string;
  flights: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

interface HotelSuggestion {
  name: string;
  category: string;
  pricePerNight: number;
  rating: number;
  reason: string;
}

interface TripDetails {
  _id: string;
  destination: string;
  numberOfDays: number;
  budgetType: string;
  interests: string[];
  itinerary: ItineraryDay[];
  budgetEstimate: BudgetEstimate;
  hotelSuggestions: HotelSuggestion[];
  mood?: string;
}

const sections: ItinerarySection[] = ["morning", "afternoon", "evening", "foodSuggestion", "travelTip"];
const moodOptions = ["Relaxed", "Packed", "Romantic", "Family Friendly", "Adventure Heavy", "Cultural"] as const;

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth(true);
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [addDay, setAddDay] = useState(1);
  const [addSection, setAddSection] = useState<keyof ItineraryDay>("morning");
  const [addText, setAddText] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [regenerateDay, setRegenerateDay] = useState(1);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [mood, setMood] = useState<typeof moodOptions[number]>("Relaxed");
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
      return;
    }

    const tripId = params.id;
    if (!tripId) {
      setError("Missing trip ID.");
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      setError("");
      setLoading(true);
      try {
        const response = await apiGet<{ trip: TripDetails }>(`/api/trips/${tripId}`);
        setTrip(response.trip);
      } catch (err: any) {
        setError(err.message || "Unable to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [user, isLoading, params.id, router]);

  const beginEdit = (dayNumber: number, section: ItinerarySection, value: string) => {
    setEditingKey(`${dayNumber}-${section}`);
    setEditValue(value);
  };

  const handleSaveEdit = async (dayNumber: number, section: ItinerarySection) => {
    if (!trip) return;
    setSavingActivity(true);
    setError("");

    try {
      const response = await apiPost<{ trip: TripDetails }>(`/api/trips/${params.id}/update-activity`, {
        dayNumber,
        section,
        activity: editValue,
      });
      setTrip(response.trip);
      setEditingKey(null);
      setEditValue("");
    } catch (err: any) {
      setError(err.message || "Unable to save activity");
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (dayNumber: number, section: ItinerarySection) => {
    if (!trip) return;
    setSavingActivity(true);
    setError("");

    try {
      const response = await apiPost<{ trip: TripDetails }>(`/api/trips/${params.id}/delete-activity`, {
        dayNumber,
        section,
      });
      setTrip(response.trip);
    } catch (err: any) {
      setError(err.message || "Unable to delete activity");
    } finally {
      setSavingActivity(false);
    }
  };

  const handleAddActivity = async () => {
    if (!trip || !addText.trim()) return;
    setAddLoading(true);
    setError("");

    try {
      const response = await apiPost<{ trip: TripDetails }>(`/api/trips/${params.id}/add-activity`, {
        dayNumber: addDay,
        section: addSection,
        activity: addText,
      });
      setTrip(response.trip);
      setAddText("");
    } catch (err: any) {
      setError(err.message || "Unable to add activity");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRegenerateDay = async () => {
    if (!trip || !regeneratePrompt.trim()) {
      setError("Add a prompt to regenerate the day.");
      return;
    }
    setRegenerateLoading(true);
    setError("");

    try {
      const response = await apiPost<{ trip: TripDetails }>(`/api/trips/${params.id}/regenerate-day`, {
        dayNumber: regenerateDay,
        prompt: regeneratePrompt,
      });
      setTrip(response.trip);
      setRegeneratePrompt("");
    } catch (err: any) {
      setError(err.message || "Unable to regenerate day");
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleOptimizeMood = async () => {
    if (!trip) return;
    setMoodLoading(true);
    setError("");

    try {
      const response = await apiPost<{ trip: TripDetails }>(`/api/trips/${params.id}/optimize-mood`, { mood });
      setTrip(response.trip);
    } catch (err: any) {
      setError(err.message || "Unable to optimize mood");
    } finally {
      setMoodLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Trip details</p>
            <h1 className="mt-2 text-3xl font-semibold">{trip?.destination || "Trip details"}</h1>
            <p className="mt-2 text-slate-400">Review your itinerary, budget, hotels, and mood settings.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Loading trip...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500 bg-rose-950/10 p-8 text-rose-200">{error}</div>
        ) : !trip ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Trip not found.</div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.7fr,0.95fr]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Destination</p>
                    <p className="mt-2 text-xl font-semibold text-white">{trip.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Days</p>
                    <p className="mt-2 text-xl font-semibold text-white">{trip.numberOfDays}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Budget</p>
                    <p className="mt-2 text-xl font-semibold text-white">{trip.budgetType}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs text-slate-300">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {trip.itinerary.map((day) => (
                  <div key={day.dayNumber} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Day {day.dayNumber}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{day.title}</h2>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {sections.map((section) => {
                        const key = `${day.dayNumber}-${section}`;
                        const value = day[section];
                        const isEditing = editingKey === key;

                        return (
                          <div key={section} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{section}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => beginEdit(day.dayNumber, section, value)}
                                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-sky-400"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteActivity(day.dayNumber, section)}
                                  disabled={savingActivity}
                                  className="rounded-full border border-rose-500 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="mt-3 space-y-3">
                                <textarea
                                  value={editValue}
                                  onChange={(event) => setEditValue(event.target.value)}
                                  rows={3}
                                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(day.dayNumber, section)}
                                    disabled={savingActivity}
                                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingKey(null);
                                      setEditValue("");
                                    }}
                                    className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-3 text-slate-300">{value}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <h2 className="text-xl font-semibold text-white">Add activity</h2>
                <p className="mt-2 text-slate-400">Select a day and section, then add a custom activity to your itinerary.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2 text-sm">
                    <span>Day</span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                      value={addDay}
                      onChange={(event) => setAddDay(Number(event.target.value))}
                    >
                      {trip.itinerary.map((day) => (
                        <option key={day.dayNumber} value={day.dayNumber}>
                          Day {day.dayNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Section</span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                      value={addSection}
                      onChange={(event) => setAddSection(event.target.value as keyof ItineraryDay)}
                    >
                      {sections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-4 block space-y-2 text-sm">
                  <span>Activity details</span>
                  <textarea
                    rows={3}
                    value={addText}
                    onChange={(event) => setAddText(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    placeholder="Add a new activity or note to this section"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  disabled={addLoading || !addText.trim()}
                  className="mt-4 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addLoading ? "Adding activity..." : "Add activity"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <h2 className="text-xl font-semibold text-white">Regenerate a day</h2>
                <p className="mt-2 text-slate-400">Refresh one day with a custom prompt to match your plans.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span>Day</span>
                    <select
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                      value={regenerateDay}
                      onChange={(event) => setRegenerateDay(Number(event.target.value))}
                    >
                      {trip.itinerary.map((day) => (
                        <option key={day.dayNumber} value={day.dayNumber}>
                          Day {day.dayNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-4 block space-y-2 text-sm">
                  <span>Prompt</span>
                  <textarea
                    rows={3}
                    value={regeneratePrompt}
                    onChange={(event) => setRegeneratePrompt(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                    placeholder="Regenerate Day 3 with more outdoor activities and less shopping."
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateDay}
                  disabled={regenerateLoading || !regeneratePrompt.trim()}
                  className="mt-4 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {regenerateLoading ? "Regenerating..." : "Regenerate Day"}
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Mood Optimizer</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Customize your trip mood</h2>
                  </div>
                </div>
                <label className="mt-5 block space-y-2 text-sm">
                  <span>Trip mood</span>
                  <select
                    value={mood}
                    onChange={(event) => setMood(event.target.value as typeof moodOptions[number])}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  >
                    {moodOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleOptimizeMood}
                  disabled={moodLoading}
                  className="mt-4 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {moodLoading ? "Optimizing..." : "Optimize Trip"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <h2 className="text-xl font-semibold text-white">Budget estimate</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Flights</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.flights}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Accommodation</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.accommodation}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Food</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.food}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Transport</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.transport}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Activities</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.activities}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-slate-400">Miscellaneous</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.miscellaneous}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-sky-500/30 bg-slate-950/90 p-4 text-white">
                  <p className="text-sm text-slate-400">Total estimate</p>
                  <p className="mt-1 text-2xl font-semibold">{trip.budgetEstimate.currency} {trip.budgetEstimate.total}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <h2 className="text-xl font-semibold text-white">Hotel suggestions</h2>
                <div className="mt-5 space-y-4">
                  {trip.hotelSuggestions.map((hotel) => (
                    <div key={hotel.name} className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{hotel.name}</p>
                          <p className="text-sm text-slate-400">{hotel.category}</p>
                        </div>
                        <p className="text-sm font-semibold text-sky-300">{trip.budgetEstimate.currency} {hotel.pricePerNight}/night</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-400">
                        <span className="rounded-full border border-slate-700 px-3 py-1">Rating {hotel.rating}</span>
                      </div>
                      <p className="mt-3 text-slate-300">{hotel.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
