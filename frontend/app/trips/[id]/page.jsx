"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { LoadingSpinner, SkeletonBlock } from "../../../components/LoadingSpinner";

const sections = ["morning", "afternoon", "evening", "foodSuggestion", "travelTip"];
const moodOptions = ["Relaxed", "Packed", "Romantic", "Family Friendly", "Adventure Heavy", "Cultural"];
const inrRates = {
  USD: 83,
  EUR: 90,
  GBP: 105,
  AED: 22.6,
  JPY: 0.56,
  SGD: 62,
  THB: 2.3,
  AUD: 55,
  CAD: 61,
};

function getBestFor(interests = []) {
  const normalized = interests.map((interest) => interest.toLowerCase());

  if (normalized.some((interest) => ["relaxation", "nature"].includes(interest))) return "Relaxation";
  if (normalized.some((interest) => ["adventure", "nightlife"].includes(interest))) return "Adventure";
  if (normalized.some((interest) => ["culture", "history"].includes(interest))) return "Cultural";
  if (normalized.some((interest) => ["food", "shopping"].includes(interest))) return "Family";

  return "Flexible";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth(true);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [addDay, setAddDay] = useState(1);
  const [addSection, setAddSection] = useState("morning");
  const [addText, setAddText] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [regenerateDay, setRegenerateDay] = useState(1);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [mood, setMood] = useState("Relaxed");
  const [moodLoading, setMoodLoading] = useState(false);
  const [inrRate, setInrRate] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState("");

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
        const response = await apiGet(`/api/trips/${tripId}`);
        setTrip(response.trip);
        const currency = response.trip?.budgetEstimate?.currency;
        setInrRate(currency === "INR" ? "1" : "");
      } catch (err) {
        setError(err.message || "Unable to load trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [user, isLoading, params.id, router]);

  useEffect(() => {
    const currency = trip?.budgetEstimate?.currency;
    if (!currency || currency === "INR") return;

    const fetchRate = async () => {
      setRateLoading(true);
      setRateError("");

      try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${currency}&to=INR`);
        const data = await response.json();
        const rate = data?.rates?.INR;

        if (!response.ok || !rate) {
          throw new Error("Rate unavailable");
        }

        setInrRate(String(rate));
      } catch {
        const fallbackRate = inrRates[currency];
        setInrRate(fallbackRate ? String(fallbackRate) : "");
        setRateError("Live rate unavailable, showing an approximate conversion.");
      } finally {
        setRateLoading(false);
      }
    };

    fetchRate();
  }, [trip?.budgetEstimate?.currency]);

  const beginEdit = (dayNumber, section, value) => {
    setEditingKey(`${dayNumber}-${section}`);
    setEditValue(value);
  };

  const handleSaveEdit = async (dayNumber, section) => {
    if (!trip) return;
    setSavingActivity(true);
    setError("");

    try {
      const response = await apiPost(`/api/trips/${params.id}/update-activity`, {
        dayNumber,
        section,
        activity: editValue,
      });
      setTrip(response.trip);
      setEditingKey(null);
      setEditValue("");
    } catch (err) {
      setError(err.message || "Unable to save activity");
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async (dayNumber, section) => {
    if (!trip) return;
    setSavingActivity(true);
    setError("");

    try {
      const response = await apiPost(`/api/trips/${params.id}/delete-activity`, {
        dayNumber,
        section,
      });
      setTrip(response.trip);
    } catch (err) {
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
      const response = await apiPost(`/api/trips/${params.id}/add-activity`, {
        dayNumber: addDay,
        section: addSection,
        activity: addText,
      });
      setTrip(response.trip);
      setAddText("");
    } catch (err) {
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
      const response = await apiPost(`/api/trips/${params.id}/regenerate-day`, {
        dayNumber: regenerateDay,
        prompt: regeneratePrompt,
      });
      setTrip(response.trip);
      setRegeneratePrompt("");
    } catch (err) {
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
      const response = await apiPost(`/api/trips/${params.id}/optimize-mood`, { mood });
      setTrip(response.trip);
    } catch (err) {
      setError(err.message || "Unable to optimize mood");
    } finally {
      setMoodLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!trip) return;

    const printableWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printableWindow) {
      window.print();
      return;
    }

    const budget = trip.budgetEstimate || {};
    const itineraryHtml = trip.itinerary
      .map(
        (day) => `
          <section class="day">
            <p class="eyebrow">Day ${escapeHtml(day.dayNumber)}</p>
            <h2>${escapeHtml(day.title)}</h2>
            <div class="grid">
              ${sections
                .map(
                  (section) => `
                    <article>
                      <h3>${escapeHtml(section === "foodSuggestion" ? "Food suggestion" : section === "travelTip" ? "Local travel tip" : section)}</h3>
                      <p>${escapeHtml(day[section])}</p>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    const hotelHtml = (trip.hotelSuggestions || [])
      .map(
        (hotel) => `
          <article class="hotel">
            <h3>${escapeHtml(hotel.name)}</h3>
            <p>${escapeHtml(hotel.category)} | Rating ${escapeHtml(hotel.rating)} | ${escapeHtml(budget.currency)} ${escapeHtml(hotel.pricePerNight)}/night</p>
            <p>${escapeHtml(hotel.reason)}</p>
          </article>
        `
      )
      .join("");

    printableWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(trip.destination)} itinerary</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #102433; font-family: Arial, sans-serif; line-height: 1.5; }
            .cover { border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 28px; }
            .brand { color: #0f766e; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
            h1 { margin: 10px 0; font-size: 34px; }
            h2 { margin: 8px 0 14px; font-size: 22px; }
            h3 { margin: 0 0 6px; font-size: 15px; }
            .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 20px; }
            .summary div, article { border: 1px solid #cbd5e1; border-radius: 14px; padding: 12px; }
            .label, .eyebrow { margin: 0; color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
            .value { margin: 5px 0 0; font-size: 16px; font-weight: 700; }
            .day { break-inside: avoid; margin: 26px 0; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .hotel { margin-bottom: 10px; }
            @media print { body { padding: 20px; } .summary { grid-template-columns: repeat(2, 1fr); } .grid { grid-template-columns: 1fr; } }
          </style>
        </head>
        <body>
          <section class="cover">
            <p class="brand">PlanMyYatra itinerary</p>
            <h1>${escapeHtml(trip.destination)}</h1>
            <p>${escapeHtml(trip.numberOfDays)} day${trip.numberOfDays > 1 ? "s" : ""} | ${escapeHtml(trip.budgetType)} budget | Best for ${escapeHtml(getBestFor(trip.interests))}</p>
            <div class="summary">
              <div><p class="label">Destination</p><p class="value">${escapeHtml(trip.destination)}</p></div>
              <div><p class="label">Days</p><p class="value">${escapeHtml(trip.numberOfDays)}</p></div>
              <div><p class="label">Budget</p><p class="value">${escapeHtml(trip.budgetType)}</p></div>
              <div><p class="label">Total</p><p class="value">${escapeHtml(budget.currency)} ${escapeHtml(budget.total)}</p></div>
              <div><p class="label">Best for</p><p class="value">${escapeHtml(getBestFor(trip.interests))}</p></div>
            </div>
          </section>
          ${itineraryHtml}
          <section class="day">
            <p class="eyebrow">Stay options</p>
            <h2>Hotel suggestions</h2>
            ${hotelHtml}
          </section>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printableWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-[#061322] text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-300">AI itinerary workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">{trip?.destination || "Trip details"}</h1>
            <p className="mt-2 text-slate-400">Review your plan, tune each day, compare costs, and refine the trip mood.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {trip && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400"
              >
                Download Itinerary PDF
              </button>
            )}
            <Link
              href="/dashboard"
              className="rounded-full border border-teal-800/70 px-5 py-3 text-sm text-slate-200 transition hover:border-teal-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 xl:grid-cols-[1.7fr,0.95fr]">
            <div className="space-y-6">
              {[1, 2].map((item) => (
                <div key={item} className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="mt-4 h-8 w-72" />
                  <div className="mt-6 space-y-4">
                    <SkeletonBlock className="h-24 w-full" />
                    <SkeletonBlock className="h-24 w-full" />
                    <SkeletonBlock className="h-24 w-full" />
                  </div>
                </div>
              ))}
            </div>
            <aside className="space-y-6">
              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <SkeletonBlock className="h-6 w-40" />
                <SkeletonBlock className="mt-5 h-28 w-full" />
              </div>
              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <SkeletonBlock className="h-6 w-44" />
                <SkeletonBlock className="mt-5 h-40 w-full" />
              </div>
            </aside>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500 bg-rose-950/10 p-8 text-rose-200">{error}</div>
        ) : !trip ? (
          <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-10 text-center text-slate-400">Trip not found.</div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.7fr,0.95fr]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Trip summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Quick overview</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Destination</p>
                    <p className="mt-2 text-lg font-semibold text-white">{trip.destination}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Days</p>
                    <p className="mt-2 text-lg font-semibold text-white">{trip.numberOfDays}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Budget type</p>
                    <p className="mt-2 text-lg font-semibold text-white">{trip.budgetType}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total budget</p>
                    <p className="mt-2 text-lg font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.total}</p>
                  </div>
                  <div className="rounded-2xl border border-orange-400/30 bg-orange-400/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Best for</p>
                    <p className="mt-2 text-lg font-semibold text-white">{getBestFor(trip.interests)}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-teal-800/70 bg-[#061322]/80 px-3 py-1 text-xs text-slate-300">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {trip.itinerary.map((day) => (
                  <div key={day.dayNumber} className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Day {day.dayNumber}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{day.title}</h2>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {sections.map((section) => {
                        const key = `${day.dayNumber}-${section}`;
                        const value = day[section];
                        const isEditing = editingKey === key;

                        return (
                          <div key={section} className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                                {section === "foodSuggestion" ? "Food suggestion" : section === "travelTip" ? "Local travel tip" : section}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => beginEdit(day.dayNumber, section, value)}
                                  className="rounded-full border border-teal-800/70 px-3 py-1 text-xs text-slate-200 transition hover:border-teal-400"
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
                                  className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                                />
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(day.dayNumber, section)}
                                    disabled={savingActivity}
                                    className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingKey(null);
                                      setEditValue("");
                                    }}
                                    className="rounded-full border border-teal-800/70 px-4 py-2 text-sm text-slate-200 transition hover:border-teal-500"
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

              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <h2 className="text-xl font-semibold text-white">Editable itinerary</h2>
                <p className="mt-2 text-slate-400">Add a new activity to any day or section without affecting another user&apos;s trip.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2 text-sm">
                    <span>Day</span>
                    <select
                      className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
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
                      className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                      value={addSection}
                      onChange={(event) => setAddSection(event.target.value)}
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
                    className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                    placeholder="Add a new activity or note to this section"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddActivity}
                  disabled={addLoading || !addText.trim()}
                  className="mt-4 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addLoading ? <LoadingSpinner label="Adding activity" /> : "Add activity"}
                </button>
              </div>

              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <h2 className="text-xl font-semibold text-white">Regenerate a specific day</h2>
                <p className="mt-2 text-slate-400">Ask the AI to rebuild one day, for example with more outdoor activities or fewer markets.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span>Day</span>
                    <select
                      className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
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
                    className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                    placeholder="Regenerate Day 3 with more outdoor activities and less shopping."
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateDay}
                  disabled={regenerateLoading || !regeneratePrompt.trim()}
                  className="mt-4 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {regenerateLoading ? <LoadingSpinner label="Regenerating" /> : "Regenerate Day"}
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Creative feature</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Trip Mood Optimizer</h2>
                    <p className="mt-2 text-sm text-slate-400">Personalize the itinerary by the feeling of the trip, not only by budget and interests.</p>
                  </div>
                </div>
                <label className="mt-5 block space-y-2 text-sm">
                  <span>Trip mood</span>
                  <select
                    value={mood}
                    onChange={(event) => setMood(event.target.value)}
                    className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
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
                  className="mt-4 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {moodLoading ? <LoadingSpinner label="Optimizing" /> : "Optimize Trip"}
                </button>
              </div>

              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <h2 className="text-xl font-semibold text-white">Budget estimate</h2>
                <p className="mt-2 text-sm text-slate-400">Estimated by destination, number of days, and budget preference.</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Flights</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.flights}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Accommodation</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.accommodation}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Food</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.food}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Transport</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.transport}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Activities</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.activities}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                    <p className="text-slate-400">Miscellaneous</p>
                    <p className="mt-2 font-semibold text-white">{trip.budgetEstimate.currency} {trip.budgetEstimate.miscellaneous}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-teal-500/30 bg-[#061322]/90 p-4 text-white">
                  <p className="text-sm text-slate-400">Total estimate</p>
                  <p className="mt-1 text-2xl font-semibold">{trip.budgetEstimate.currency} {trip.budgetEstimate.total}</p>
                </div>
                {trip.budgetEstimate.currency !== "INR" && (
                  <div className="mt-4 rounded-2xl border border-orange-400/30 bg-orange-400/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">Converted total in INR</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {rateLoading
                            ? "Fetching latest exchange rate..."
                            : inrRate
                              ? `1 ${trip.budgetEstimate.currency} = INR ${Number(inrRate).toFixed(2)}`
                              : "Exchange rate unavailable"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-orange-400/20 bg-[#061322]/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Indian rupees</p>
                        <p className="mt-1 text-xl font-semibold text-white">
                          INR {inrRate ? Math.round(Number(inrRate) * Number(trip.budgetEstimate.total)).toLocaleString("en-IN") : "--"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      {rateError || "This conversion uses the latest available exchange rate and is only for quick reference."}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <h2 className="text-xl font-semibold text-white">Hotel suggestions</h2>
                <p className="mt-2 text-sm text-slate-400">Recommended options based on destination, budget, and traveler fit.</p>
                <div className="mt-5 space-y-4">
                  {trip.hotelSuggestions.map((hotel) => (
                    <div key={hotel.name} className="rounded-2xl border border-teal-800/70 bg-[#061322]/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{hotel.name}</p>
                          <p className="text-sm text-slate-400">{hotel.category}</p>
                        </div>
                        <p className="text-sm font-semibold text-teal-300">{trip.budgetEstimate.currency} {hotel.pricePerNight}/night</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-400">
                        <span className="rounded-full border border-teal-800/70 px-3 py-1">Rating {hotel.rating}</span>
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

