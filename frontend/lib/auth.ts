export const TOKEN_KEY = "travel_planner_token";

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function fetchCurrentUser() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = getToken();

  if (!token) {
    throw new Error("No token available");
  }

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Unable to fetch user");
  }

  return data.user as { id: string; name: string; email: string };
}
