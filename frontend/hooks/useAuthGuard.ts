"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";

/**
 * useAuthGuard
 *
 * Returns `true` once the auth check is complete and the user IS authenticated.
 * Redirects to /login and keeps returning `false` if not authenticated.
 *
 * Usage:
 *   const ready = useAuthGuard();
 *   if (!ready) return <LoadingSpinner />;
 */
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      // keep ready=false so the page shows nothing while redirecting
    } else {
      setReady(true);
    }
  }, [router]);

  return ready;
}
