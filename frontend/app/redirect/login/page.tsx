"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { saveSession } from "@/lib/auth/session";
import { AuthTokens } from "@/lib/auth/types";

// Inner component reads search params — must live inside a Suspense boundary
function RedirectLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    // Guard against double invocation in React Strict Mode
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    // Google returned an error (e.g. user denied consent)
    if (oauthError || !code || !state) {
      router.replace("/login?error=auth_failed");
      return;
    }

    const exchange = async () => {
      try {
        // POST to our server-side route handler — credentials never touch the browser
        const res = await fetch("/api/auth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });

        if (!res.ok) {
          throw new Error("Exchange failed");
        }

        const data: AuthTokens = await res.json();

        // Persist JWT tokens and user profile
        saveSession(data);

        // Navigate to the protected home page
        router.replace("/");
      } catch {
        router.replace("/login?error=auth_failed");
      }
    };

    exchange();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}

// Suspense is required by Next.js whenever useSearchParams is used in a page
export default function RedirectLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <RedirectLoginContent />
    </Suspense>
  );
}
