import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">AI Travel Planner</p>
          <h1 className="text-4xl font-semibold sm:text-6xl">Create unforgettable trips with intelligent planning.</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            Register, login, generate a complete itinerary, estimate your budget, and tune the mood of every day.
          </p>
          <div className="mx-auto flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Register
            </Link>
            <Link href="/login" className="rounded-full border border-slate-700 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
