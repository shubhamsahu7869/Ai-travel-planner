"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser, getToken } from "../lib/auth";

export function useAuth(redirectToLogin = true) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      if (redirectToLogin) router.push("/login");
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Please login to continue.");
        setIsLoading(false);
        if (redirectToLogin) router.push("/login");
      });
  }, [router, redirectToLogin]);

  return { user, isLoading, error };
}
