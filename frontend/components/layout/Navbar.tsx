"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AuthUser } from "@/lib/auth/types";
import { clearSession, getRefreshToken } from "@/lib/auth/session";
import api from "@/lib/api/axios";
import Dialog from "@/components/ui/Dialog";
import { cn } from "@/lib/utils/cn";

interface NavbarProps {
  user: AuthUser | null;
}

const NAV_LINKS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/companies",
    label: "Companies",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
];

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openLogoutDialog = () => setDialogOpen(true);
  const closeLogoutDialog = () => {
    if (!loggingOut) setDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // Proceed with local logout even if the API call fails
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return (
    <>
      <nav className="border-b border-gray-200 bg-white px-6 py-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Left: logo + nav links */}
          <div className="flex items-center">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 py-4 pr-8 text-base font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              HR Manager
            </Link>

            {/* Nav links */}
            {user && (
              <div className="flex items-center">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1.5 border-b-2 px-3 py-4 text-sm font-medium transition-colors",
                        active
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-900"
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: user info + sign out */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 overflow-hidden">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-blue-600">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                {user.full_name}
              </span>
              <button
                onClick={openLogoutDialog}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeLogoutDialog}
        title="Sign out"
        description="Are you sure you want to sign out of your account?"
        closeOnBackdrop={!loggingOut}
        actions={
          <>
            <button
              onClick={closeLogoutDialog}
              disabled={loggingOut}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              disabled={loggingOut}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </>
        }
      />
    </>
  );
}
