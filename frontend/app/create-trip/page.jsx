"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const interestsOptions = ["Food", "Culture", "Adventure", "Shopping", "Nature", "History", "Relaxation", "Nightlife"];

export default function CreateTripPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth(true);
  const [destination, setDestination] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budgetType, setBudgetType] = useState("Medium");
  const [interests, setInterests] = useState(["Food", "Culture"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const toggleInterest = (interest) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!destination.trim()) {
      setError("Add a destination for your trip.");
      setLoading(false);
      return;
    }

    if (interests.length === 0) {
      setError("Select at least one interest.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiPost("/api/trips", {
        destination,
        numberOfDays,
        budgetType,
        interests,
      });
      router.push(`/trips/${response.trip._id}`);
    } catch (err) {
      setError(err.message || "Unable to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061322] text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-8 shadow-2xl shadow-black/20">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Trip input form</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Generate a structured AI travel plan</h1>
              <p className="mt-2 max-w-3xl text-slate-400">
                Tell us where you want to go, how long you are staying, and what kind of trip you enjoy.
              </p>
            </div>
          </div>

          <div className="mb-7 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              Discover exact places, activities, and local food stops.
            </div>
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              See a practical cost breakdown in the right currency.
            </div>
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              Get stay options that match your travel style.
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span>Destination</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                  placeholder="e.g. Gwalior, Tokyo, Dubai"
                  required
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span>Number of days</span>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={numberOfDays}
                  onChange={(event) => setNumberOfDays(Number(event.target.value))}
                  className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
                  required
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span>Budget type</span>
              <select
                value={budgetType}
                onChange={(event) => setBudgetType(event.target.value)}
                className="w-full rounded-2xl border border-teal-800/70 bg-[#061322] px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-200">Interests</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {interestsOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      interests.includes(interest)
                        ? "border-teal-500 bg-teal-500/10 text-teal-100"
                        : "border-teal-800/70 bg-[#061322] text-slate-300 hover:border-teal-500"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-teal-500 px-6 py-4 text-sm font-semibold text-[#061322] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoadingSpinner label="Generating itinerary, budget, and hotels" /> : "Generate Trip"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

