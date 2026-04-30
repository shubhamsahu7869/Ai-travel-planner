"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const interestsOptions = ["Food", "Culture", "Adventure", "Shopping", "Nature", "History", "Relaxation", "Nightlife"];

export default function CreateTripPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth(true);
  const [destination, setDestination] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budgetType, setBudgetType] = useState("Medium");
  const [interests, setInterests] = useState<string[]>(["Food", "Culture"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const response = await apiPost<{ trip: { _id: string } }>("/api/trips", {
        destination,
        numberOfDays,
        budgetType,
        interests,
      });
      router.push(`/trips/${response.trip._id}`);
    } catch (err: any) {
      setError(err.message || "Unable to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Start planning</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Create your next trip</h1>
              <p className="mt-2 text-slate-400">Enter your destination, budget, and travel interests to generate a complete plan.</p>
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  placeholder="e.g. Lisbon"
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  required
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span>Budget type</span>
              <select
                value={budgetType}
                onChange={(event) => setBudgetType(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
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
                        ? "border-sky-500 bg-sky-500/10 text-sky-100"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
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
              className="w-full rounded-2xl bg-sky-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating your AI itinerary..." : "Generate Trip"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
