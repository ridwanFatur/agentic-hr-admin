"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { companiesApi } from "@/lib/api/companies";
import { CompanyListResponse } from "@/lib/types/hr";
import CompanyCard from "@/components/companies/CompanyCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyListResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    companiesApi
      .list(0, 6)
      .then(setCompanies)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  const totalCompanies = companies?.total ?? 0;
  const activeCompanies = companies?.items.filter((c) => c.status === "active").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-md">
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold">
            Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-blue-200 text-sm">
            Manage your companies, employees, and HR records from one place.
          </p>
          <Link
            href="/companies/new"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Company
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 h-56 w-56 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      {!loadingData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Total Companies"
            value={totalCompanies}
            href="/companies"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Active Companies"
            value={activeCompanies}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
        </div>
      )}

      {/* Recent Companies */}
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Companies</h2>
          <Link
            href="/companies"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : companies && companies.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.items.slice(0, 6).map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            {companies.total > 6 && (
              <div className="mt-6 text-center">
                <Link
                  href="/companies"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all {companies.total} companies →
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No companies yet"
            description="Create your first company to start managing employees and HR data."
            action={
              <Link
                href="/companies/new"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Company
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────── //

interface StatCardProps {
  label: string;
  value: number;
  href?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
};

function StatCard({ label, value, href, icon, color }: StatCardProps) {
  const inner = (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition hover:scale-[1.01] active:scale-[0.99]">
        {inner}
      </Link>
    );
  }
  return inner;
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
