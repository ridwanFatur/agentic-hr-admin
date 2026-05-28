import { AuthTokens, AuthUser } from "./types";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "auth_user",
} as const;

/**
 * Persist tokens and user profile from a login/refresh response.
 */
export function saveSession(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(KEYS.REFRESH_TOKEN, tokens.refresh_token);
  localStorage.setItem(KEYS.USER, JSON.stringify(tokens.user));
}

/**
 * Remove all auth data (logout).
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.USER);
}

/**
 * Return the stored access token, or null if missing.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.ACCESS_TOKEN);
}

/**
 * Return the stored refresh token, or null if missing.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.REFRESH_TOKEN);
}

/**
 * Return the stored user profile, or null if not logged in.
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Returns true if the user is authenticated (access token present).
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Update the stored user profile (e.g. after avatar upload).
 */
export function updateUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}
