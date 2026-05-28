import Link from "next/link";
import { Company } from "@/lib/types/hr";
import Badge, { companyStatusVariant } from "@/components/ui/Badge";

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="group flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {company.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="truncate font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {company.name}
            </h3>
            <Badge
              label={company.status}
              variant={companyStatusVariant(company.status)}
            />
          </div>
          {company.industry && (
            <p className="mt-0.5 text-sm text-gray-500">{company.industry}</p>
          )}
          {(company.city || company.country) && (
            <p className="text-sm text-gray-400">
              {[company.city, company.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 border-t border-gray-50 pt-3 text-xs text-gray-500">
        {company.email && (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {company.email}
          </span>
        )}
        {company.employee_range && (
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {company.employee_range} employees
          </span>
        )}
      </div>
    </Link>
  );
}
