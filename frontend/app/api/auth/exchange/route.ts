import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface ExchangeRequest {
  code: string;
  state: string;
}

/**
 * POST /api/auth/exchange
 *
 * Thin proxy between the OAuth callback page and the FastAPI backend.
 *
 * Responsibilities:
 *  1. Verify the CSRF state against the httpOnly cookie set in /api/auth/google.
 *  2. Forward the authorization code to the FastAPI backend.
 *  3. Return the backend's JWT response (access_token, refresh_token, user).
 *
 * The code exchange with Google (requiring GOOGLE_CLIENT_SECRET) happens
 * entirely inside FastAPI — this handler never touches any Google credential.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse request body
  let body: Partial<ExchangeRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { code, state } = body;

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing required parameters: code and state." },
      { status: 400 }
    );
  }

  // Verify CSRF state against the httpOnly cookie (one-time use)
  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.json(
      { error: "Invalid OAuth state. The request may have been tampered with." },
      { status: 400 }
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API URL is not configured." },
      { status: 500 }
    );
  }

  // Forward the authorization code to the FastAPI backend.
  // The backend handles the Google code↔token exchange using its own credentials.
  const backendRes = await fetch(`${apiUrl}/api/v1/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const authData = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: authData.detail ?? "Authentication failed." },
      { status: backendRes.status }
    );
  }

  return NextResponse.json(authData);
}
