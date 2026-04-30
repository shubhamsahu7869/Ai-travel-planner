"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? getToken() : null;

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="text-xl font-semibold text-white">
          AI Travel Planner
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-200">
          {token ? (
            <>
              <Link href="/dashboard" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                Dashboard
              </Link>
              <Link href="/create-trip" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                Create Trip
              </Link>
              <button onClick={handleLogout} className="rounded-full bg-sky-500 px-4 py-2 text-slate-950 transition hover:bg-sky-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 transition hover:bg-slate-800/80">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-sky-500 px-4 py-2 text-slate-950 transition hover:bg-sky-400">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
