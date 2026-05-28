import Link from "next/link";
import { Employee } from "@/lib/types/hr";
import Badge, { employmentStatusVariant } from "@/components/ui/Badge";

interface EmployeeCardProps {
  employee: Employee;
  companyId: string;
}

export default function EmployeeCard({ employee, companyId }: EmployeeCardProps) {
  const initials = employee.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  return (
    <Link
      href={`/companies/${companyId}/employees/${employee.id}`}
      className="group flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-gray-300"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 overflow-hidden">
        {employee.photo_url ? (
          <img
            src={employee.photo_url}
            alt={employee.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-blue-600">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {employee.name}
          </p>
          <Badge
            label={employee.employment_status}
            variant={employmentStatusVariant(employee.employment_status)}
          />
        </div>
        <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-500">
          {employee.position && <span>{employee.position}</span>}
          {employee.department && (
            <>
              {employee.position && <span>·</span>}
              <span>{employee.department}</span>
            </>
          )}
          {employee.email && (
            <>
              {(employee.position || employee.department) && <span>·</span>}
              <span>{employee.email}</span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}
