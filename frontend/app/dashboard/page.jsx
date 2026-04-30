"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiDelete, apiGet } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner, SkeletonBlock } from "../../components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth(true);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user && !isLoading) return;

    const fetchTrips = async () => {
      setError("");
      setLoading(true);
      try {
        const result = await apiGet("/api/trips");
        setTrips(result.trips);
      } catch (err) {
        setError(err.message || "Unable to load trips");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user, isLoading]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this trip?")) return;
    setDeletingId(id);

    try {
      await apiDelete(`/api/trips/${id}`);
      setTrips((current) => current.filter((trip) => trip._id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete trip");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#061322] text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-8 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your trips</h1>
            <p className="mt-2 text-slate-400">Manage your current plans, review AI itinerary details, or create a new trip.</p>
          </div>
          <button
            onClick={() => router.push("/create-trip")}
            className="inline-flex items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400"
          >
            Create Trip
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              <p className="text-sm text-slate-400">
                <span className="mr-2 rounded-full bg-orange-400/15 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-orange-300">MAP</span>
                Saved trips
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{trips.length}</p>
            </div>
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              <p className="text-sm text-slate-400">
                <span className="mr-2 rounded-full bg-orange-400/15 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-orange-300">AIR</span>
                Planner mode
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">AI assisted</p>
            </div>
            <div className="rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
              <p className="text-sm text-slate-400">
                <span className="mr-2 rounded-full bg-orange-400/15 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-orange-300">GO</span>
                Next action
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">Create trip</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="mt-4 h-8 w-52" />
                <SkeletonBlock className="mt-3 h-4 w-40" />
                <div className="mt-6 flex gap-3">
                  <SkeletonBlock className="h-10 w-20 rounded-full" />
                  <SkeletonBlock className="h-10 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500 bg-rose-950/10 p-8 text-rose-200">{error}</div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-10 text-center text-slate-400">
            <p className="text-lg font-semibold text-white">No trips yet</p>
            <p className="mt-2">Start a new AI-generated trip plan to see your itinerary here.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {trips.map((trip) => (
              <div key={trip._id} className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6 shadow-xl shadow-black/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-teal-300">{trip.budgetType} Budget</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{trip.destination}</h2>
                    <p className="mt-2 text-slate-400">{trip.numberOfDays} day{trip.numberOfDays > 1 ? "s" : ""} trip</p>
                  </div>
                  <div className="text-right text-sm text-slate-400">{trip.interests.join(" - ")}</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/trips/${trip._id}`)}
                    className="rounded-full bg-[#123044] px-4 py-2 text-sm font-medium text-teal-100 transition hover:bg-teal-900/70"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    disabled={deletingId === trip._id}
                    className="rounded-full border border-rose-500 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === trip._id ? <LoadingSpinner label="Deleting" /> : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


