import { cn } from "@/lib/utils/cn";

type Variant = "green" | "yellow" | "red" | "blue" | "gray";

const variantClasses: Record<Variant, string> = {
  green: "bg-green-100 text-green-700 ring-green-200",
  yellow: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  red: "bg-red-100 text-red-700 ring-red-200",
  blue: "bg-blue-100 text-blue-700 ring-blue-200",
  gray: "bg-gray-100 text-gray-600 ring-gray-200",
};

interface BadgeProps {
  label: string;
  variant?: Variant;
  className?: string;
}

export default function Badge({
  label,
  variant = "gray",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

// Helpers for status → variant mapping
export function companyStatusVariant(status: string): Variant {
  return status === "active" ? "green" : "gray";
}

export function employmentStatusVariant(status: string): Variant {
  switch (status) {
    case "active":
      return "green";
    case "on_leave":
      return "yellow";
    case "terminated":
      return "red";
    default:
      return "gray";
  }
}
