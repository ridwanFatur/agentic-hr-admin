"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmployeeCard from "@/components/employees/EmployeeCard";
import Badge, { companyStatusVariant } from "@/components/ui/Badge";
import Dialog from "@/components/ui/Dialog";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, Employee } from "@/lib/types/hr";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comp, emp] = await Promise.all([
          companiesApi.get(params.id),
          employeesApi.list(params.id, 0, 10),
        ]);
        setCompany(comp);
        setEmployees(emp.items);
        setTotalEmployees(emp.total);
      } catch {
        router.replace("/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleDeleteConfirm = async () => {
    if (!company) return;
    setDeleting(true);
    try {
      await companiesApi.delete(company.id);
      router.push("/companies");
    } catch {
      setDeleting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    setLogoUploading(true);
    try {
      const updated = await companiesApi.uploadLogo(company.id, file);
      setCompany(updated);
    } catch {
      // silently fail; could show a toast
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/companies" className="hover:text-gray-700">
          Companies
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{company.name}</span>
      </nav>

      <div className="flex flex-col gap-6">
        {/* Company Header Card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Logo */}
            <div className="relative">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 overflow-hidden ring-1 ring-gray-200">
                {logoUploading ? (
                  <LoadingSpinner size="sm" />
                ) : company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                title="Upload logo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
                <Badge label={company.status} variant={companyStatusVariant(company.status)} />
              </div>
              {company.legal_name && (
                <p className="mt-0.5 text-sm text-gray-500">{company.legal_name}</p>
              )}
              {company.industry && (
                <p className="mt-0.5 text-sm text-gray-400">{company.industry}</p>
              )}
              {company.description && (
                <p className="mt-3 text-sm text-gray-600">{company.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/companies/${company.id}/edit`}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {company.email && (
              <DetailItem label="Email" value={company.email} />
            )}
            {company.phone_number && (
              <DetailItem label="Phone" value={company.phone_number} />
            )}
            {company.website && (
              <DetailItem
                label="Website"
                value={
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                }
              />
            )}
            {company.tax_number && (
              <DetailItem label="Tax Number" value={company.tax_number} />
            )}
            {company.business_type && (
              <DetailItem label="Business Type" value={company.business_type} />
            )}
            {company.founded_at && (
              <DetailItem label="Founded" value={new Date(company.founded_at).toLocaleDateString()} />
            )}
            {company.company_code && (
              <DetailItem label="Company Code" value={company.company_code} />
            )}
            {(company.city || company.country) && (
              <DetailItem
                label="Location"
                value={[company.city, company.state, company.country]
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
            {company.employee_range && (
              <DetailItem label="Employee Range" value={`${company.employee_range} employees`} />
            )}
          </div>
        </div>

        {/* Employees Section */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Employees</h2>
              <p className="text-sm text-gray-500">{totalEmployees} total</p>
            </div>
            <div className="flex gap-2">
              {totalEmployees > 10 && (
                <Link
                  href={`/companies/${company.id}/employees`}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  View All
                </Link>
              )}
              <Link
                href={`/companies/${company.id}/employees/new`}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Employee
              </Link>
            </div>
          </div>

          {employees.length > 0 ? (
            <div className="flex flex-col gap-2">
              {employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} companyId={company.id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900">No employees yet</p>
              <p className="mt-1 text-sm text-gray-500">Add the first employee to this company.</p>
              <Link
                href={`/companies/${company.id}/employees/new`}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Add Employee
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { if (!deleting) setDeleteDialogOpen(false); }}
        title="Delete Company"
        description={`Are you sure you want to delete "${company.name}"? This will also remove all associated employees. This action cannot be undone.`}
        closeOnBackdrop={!deleting}
        actions={
          <>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      />
    </>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
