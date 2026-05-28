"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, EmployeeCreate, EmployeeUpdate } from "@/lib/types/hr";

export default function NewEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companiesApi
      .get(params.id)
      .then(setCompany)
      .catch(() => router.replace("/companies"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleSubmit = async (data: EmployeeCreate | EmployeeUpdate) => {
    const emp = await employeesApi.create(params.id, data as EmployeeCreate);
    router.push(`/companies/${params.id}/employees/${emp.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/companies" className="hover:text-gray-700">
          Companies
        </Link>
        <span>/</span>
        <Link href={`/companies/${params.id}`} className="hover:text-gray-700">
          {company?.name}
        </Link>
        <span>/</span>
        <Link href={`/companies/${params.id}/employees`} className="hover:text-gray-700">
          Employees
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">New Employee</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">New Employee</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new employee to {company?.name}.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/companies/${params.id}`)}
            submitLabel="Add Employee"
          />
        </div>
      </div>
    </>
  );
}
