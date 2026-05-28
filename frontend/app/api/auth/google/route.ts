import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/google
 *
 * Fetches the Google OAuth authorization URL from the FastAPI backend, stores
 * the CSRF state in an httpOnly cookie, then redirects the browser to Google.
 *
 * The frontend holds zero Google credentials — all OAuth config lives in the
 * backend environment. The only frontend env variable needed is NEXT_PUBLIC_API_URL.
 */
export async function GET(): Promise<NextResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API URL is not configured." },
      { status: 500 }
    );
  }

  // Ask the backend to generate the auth URL + CSRF state
  let url: string;
  let state: string;

  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/google/auth-url`);
    if (!res.ok) {
      throw new Error(`Backend responded with ${res.status}`);
    }
    ({ url, state } = await res.json());
  } catch (err) {
    console.error("Failed to fetch Google auth URL from backend:", err);
    return NextResponse.json(
      { error: "Failed to initiate Google sign-in. Please try again." },
      { status: 502 }
    );
  }

  // Store the CSRF state in an httpOnly cookie (10-minute window)
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(url);
}
