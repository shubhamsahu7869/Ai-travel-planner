import Link from "next/link";
import BrandLogo from "../components/BrandLogo";

const steps = [
  {
    title: "Tell us your route",
    text: "Add the destination, trip length, budget style, and the interests that matter most.",
  },
  {
    title: "Get a complete plan",
    text: "Receive places to visit, daily activities, budget estimates, and stay suggestions in one view.",
  },
  {
    title: "Shape the journey",
    text: "Edit activities, regenerate a specific day, or tune the trip with a mood like relaxed or adventure-heavy.",
  },
];

const highlights = [
  "Exact places to visit",
  "Budget estimate with INR conversion",
  "Hotel and stay suggestions",
  "Editable daily schedule",
  "Mood-based personalization",
  "Private user dashboard",
];

const routePreview = [
  { label: "Destination", code: "PIN" },
  { label: "Daily itinerary", code: "DAY" },
  { label: "Budget", code: "INR" },
  { label: "Stays", code: "BED" },
  { label: "Mood tuning", code: "AI" },
];
const travelStickers = [
  { label: "Flight", code: "AIR", className: "left-5 top-6 rotate-[-8deg]" },
  { label: "Train", code: "RAIL", className: "right-6 top-20 rotate-[7deg]" },
  { label: "Stay", code: "STAY", className: "left-8 bottom-40 rotate-[5deg]" },
  { label: "Route", code: "MAP", className: "right-8 bottom-28 rotate-[-6deg]" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#061322] text-slate-100">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
            Smart travel planning
          </div>
          <div className="space-y-5">
            <BrandLogo />
            <h1 className="max-w-3xl text-3xl font-semibold leading-snug text-white sm:text-5xl">
              PlanMyYatra crafts complete trip itineraries.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Turn a destination into a polished plan with places to visit, local costs, stays, and flexible day edits.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex justify-center rounded-full bg-teal-500 px-7 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400">
              Start planning
            </Link>
            <Link href="/login" className="inline-flex justify-center rounded-full border border-teal-800/70 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-teal-500">
              Login
            </Link>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-teal-900/60 bg-[#0b1b2b] shadow-2xl shadow-black/30">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
            alt="Scenic mountain road for travel planning"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061322] via-[#061322]/55 to-[#0f766e]/10" />
          {travelStickers.map((sticker) => (
            <div
              key={sticker.label}
              className={`absolute ${sticker.className} rounded-2xl border border-white/15 bg-[#061322]/75 px-4 py-3 text-sm text-white shadow-xl shadow-black/30 backdrop-blur`}
            >
              <span className="mr-3 rounded-full bg-orange-400/15 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-orange-300">
                {sticker.code}
              </span>
              <span className="font-medium">{sticker.label}</span>
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-md rounded-3xl border border-white/10 bg-[#061322]/75 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">Plan smarter</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">From idea to itinerary in one workspace.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Generate day plans, estimate budgets, compare hotel options, and refine each day around the way you want the trip to feel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-teal-900/50 bg-[#0b1b2b]/70 px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">How it works</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-teal-900/60 bg-[#061322]/80 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-[#061322]">
                  {index + 1}
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Structured planning</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">A clear flow from idea to ready itinerary.</h2>
              <p className="mt-4 leading-7 text-slate-300">
                PlanMyYatra keeps the page calm and organized while still giving every trip the practical details it needs.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px bg-teal-800/70 sm:block" />
              <div className="space-y-4">
                {routePreview.map((item, index) => (
                  <div key={item.label} className="relative flex gap-4 rounded-2xl border border-teal-900/60 bg-[#061322]/80 p-4">
                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-[#061322]">
                      {item.code}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      <p className="mt-1 text-sm text-slate-400">Step {index + 1} in the trip-building workspace.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 sm:px-10 lg:grid-cols-[0.9fr,1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Trip workspace</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Everything your plan needs, organized in one place.</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            PlanMyYatra keeps the trip practical: where to go, what it may cost, where to stay, and how each day should feel.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-5 text-slate-200">
              <div className="mb-4 h-1.5 w-12 rounded-full bg-orange-400" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 sm:px-10 lg:grid-cols-2">
        <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Mood optimizer</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Tune the same trip for a different feeling.</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Choose Relaxed, Packed, Romantic, Family Friendly, Adventure Heavy, or Cultural and reshape the itinerary without starting over.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Relaxed", "Packed", "Cultural", "Adventure Heavy"].map((mood) => (
              <span key={mood} className="rounded-full border border-teal-800/70 bg-[#061322]/80 px-4 py-2 text-sm text-teal-100">
                {mood}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-teal-900/60 bg-[#0b1b2b]/80 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Budget clarity</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">See the cost and compare it in INR.</h2>
          <p className="mt-4 leading-7 text-slate-300">
            The budget panel breaks down flights, stays, food, transport, activities, and gives a quick INR conversion for foreign currencies.
          </p>
          <div className="mt-6 rounded-2xl border border-orange-400/30 bg-orange-400/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-300">Quick reference</p>
            <p className="mt-2 text-2xl font-semibold text-white">USD 650 = INR 53,950</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 rounded-3xl border border-teal-900/60 bg-[#0b1b2b] p-8 text-center shadow-2xl shadow-black/20 md:flex-row md:text-left">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Ready to plan?</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Create your next yatra in minutes.</h2>
          </div>
          <Link href="/register" className="inline-flex justify-center rounded-full bg-teal-500 px-7 py-3 text-sm font-semibold text-[#061322] transition hover:bg-orange-400">
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
