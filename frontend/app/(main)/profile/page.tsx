"use client";

import { useRef, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/auth/session";
import { usersApi } from "@/lib/api/users";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const initials = user.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      const updated = await usersApi.uploadAvatar(file);
      updateUser(updated);
      setUser(updated);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload photo. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and profile picture.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Accent */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400" />

        <div className="p-8">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-md shadow-blue-200 ring-4 ring-white">
                {uploading ? (
                  <LoadingSpinner size="sm" />
                ) : user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Change photo"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-2 ring-gray-100 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Name + upload CTA */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 cursor-pointer rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Change photo"}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {uploadSuccess && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profile picture updated successfully.
            </div>
          )}
          {uploadError && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {uploadError}
            </div>
          )}

          {/* Divider */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Account Information
            </h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow label="Full Name" value={user.full_name} />
              <InfoRow label="Email Address" value={user.email} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3.5">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
