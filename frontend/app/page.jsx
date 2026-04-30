import Link from "next/link";
import BrandLogo from "../components/BrandLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
            Smart travel planning
          </div>
          <div className="space-y-5">
            <BrandLogo />
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              PlanMyYatra crafts complete, editable trip itineraries.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Turn a destination into a polished plan with places to visit, local costs, stays, and flexible day edits.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/register" className="inline-flex justify-center rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Start planning
            </Link>
            <Link href="/login" className="inline-flex justify-center rounded-full border border-slate-700 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
              Login
            </Link>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/30">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
            alt="Scenic mountain road for travel planning"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-md rounded-3xl border border-white/10 bg-slate-950/75 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Plan smarter</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">From idea to itinerary in one workspace.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Generate day plans, estimate budgets, compare hotel options, and refine each day around the way you want the trip to feel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
