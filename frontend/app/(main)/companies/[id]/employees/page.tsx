"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge, { employmentStatusVariant } from "@/components/ui/Badge";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, Employee } from "@/lib/types/hr";

export default function EmployeesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      companiesApi.get(params.id),
      employeesApi.list(params.id, 0, 200),
    ])
      .then(([comp, emp]) => {
        setCompany(comp);
        setEmployees(emp.items);
        setTotal(emp.total);
      })
      .catch(() => router.replace("/companies"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filtered = employees.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.position?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/companies" className="hover:text-gray-600 transition-colors">Companies</Link>
        <span>/</span>
        <Link href={`/companies/${params.id}`} className="hover:text-gray-600 transition-colors">{company?.name}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Employees</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} {total === 1 ? "employee" : "employees"} in {company?.name}
          </p>
        </div>
        <Link
          href={`/companies/${params.id}/employees/new`}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </Link>
      </div>

      {employees.length > 0 ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Search */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="relative max-w-xs">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search employees…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Employee</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Position</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Department</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="py-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      No employees match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => <EmployeeRow key={emp.id} employee={emp} companyId={params.id} />)
                )}
              </tbody>
            </table>
          </div>
          {search && filtered.length !== employees.length && (
            <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
              Showing {filtered.length} of {employees.length} employees
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-medium text-gray-900">No employees yet</p>
          <p className="mt-1 text-sm text-gray-500">Add the first employee to this company.</p>
          <Link
            href={`/companies/${params.id}/employees/new`}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>
      )}
    </>
  );
}

function EmployeeRow({ employee, companyId }: { employee: Employee; companyId: string }) {
  const initials = employee.name.split(" ").slice(0, 2).map(n => n.charAt(0).toUpperCase()).join("");

  return (
    <tr className="group hover:bg-gray-50/60 transition-colors">
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden text-sm font-semibold text-blue-600">
            {employee.photo_url ? (
              <img src={employee.photo_url} alt={employee.name} className="h-full w-full object-cover" />
            ) : initials}
          </div>
          <div>
            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{employee.name}</p>
            {employee.email && <p className="text-xs text-gray-400">{employee.email}</p>}
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4 text-gray-600">{employee.position ?? <span className="text-gray-300">—</span>}</td>
      <td className="py-3.5 pr-4 text-gray-600">{employee.department ?? <span className="text-gray-300">—</span>}</td>
      <td className="py-3.5 pr-4">
        <Badge label={employee.employment_status.replace(/_/g, " ")} variant={employmentStatusVariant(employee.employment_status)} />
      </td>
      <td className="py-3.5 pr-6 text-right">
        <Link
          href={`/companies/${companyId}/employees/${employee.id}`}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          View
        </Link>
        <Link
          href={`/companies/${companyId}/employees/${employee.id}/edit`}
          className="ml-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}
