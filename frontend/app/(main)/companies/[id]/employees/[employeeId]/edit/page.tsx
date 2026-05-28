"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, Employee, EmployeeCreate, EmployeeUpdate } from "@/lib/types/hr";

export default function EditEmployeePage() {
  const params = useParams<{ id: string; employeeId: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      companiesApi.get(params.id),
      employeesApi.get(params.id, params.employeeId),
    ])
      .then(([comp, emp]) => {
        setCompany(comp);
        setEmployee(emp);
      })
      .catch(() => router.replace(`/companies/${params.id}`))
      .finally(() => setLoading(false));
  }, [params.id, params.employeeId, router]);

  const handleSubmit = async (data: EmployeeCreate | EmployeeUpdate) => {
    const updated = await employeesApi.update(params.id, params.employeeId, data as EmployeeUpdate);
    router.push(`/companies/${params.id}/employees/${updated.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/companies" className="hover:text-gray-700">Companies</Link>
        <span>/</span>
        <Link href={`/companies/${params.id}`} className="hover:text-gray-700">
          {company?.name}
        </Link>
        <span>/</span>
        <Link href={`/companies/${params.id}/employees`} className="hover:text-gray-700">
          Employees
        </Link>
        <span>/</span>
        <Link href={`/companies/${params.id}/employees/${employee.id}`} className="hover:text-gray-700">
          {employee.name}
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">Edit</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Employee</h1>
          <p className="mt-1 text-sm text-gray-500">Update {employee.name}&apos;s details.</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <EmployeeForm
            initial={employee}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/companies/${params.id}/employees/${employee.id}`)}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </>
  );
}
