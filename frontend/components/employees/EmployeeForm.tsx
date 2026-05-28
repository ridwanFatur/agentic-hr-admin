"use client";

import { useState } from "react";
import { Employee, EmployeeCreate, EmployeeUpdate } from "@/lib/types/hr";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const IDENTITY_TYPES = ["KTP", "Passport", "Driver License", "SIM", "Other"];
const GENDERS = ["male", "female"];
const EMPLOYMENT_STATUSES = ["active", "inactive", "on_leave", "terminated"];
const CURRENCIES = ["USD", "IDR", "EUR", "GBP", "SGD", "MYR", "JPY", "AUD"];

interface EmployeeFormProps {
  initial?: Employee;
  onSubmit: (data: EmployeeCreate | EmployeeUpdate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

type FormState = {
  name: string;
  identity_number: string;
  identity_type: string;
  email: string;
  phone_number: string;
  gender: string;
  birth_date: string;
  address: string;
  position: string;
  department: string;
  join_date: string;
  end_date: string;
  employment_status: string;
  salary: string;
  salary_currency: string;
  emergency_contact: string;
  emergency_contact_phone: string;
};

function toFormState(employee?: Employee): FormState {
  return {
    name: employee?.name ?? "",
    identity_number: employee?.identity_number ?? "",
    identity_type: employee?.identity_type ?? "",
    email: employee?.email ?? "",
    phone_number: employee?.phone_number ?? "",
    gender: employee?.gender ?? "",
    birth_date: employee?.birth_date ?? "",
    address: employee?.address ?? "",
    position: employee?.position ?? "",
    department: employee?.department ?? "",
    join_date: employee?.join_date ?? "",
    end_date: employee?.end_date ?? "",
    employment_status: employee?.employment_status ?? "active",
    salary: employee?.salary?.toString() ?? "",
    salary_currency: employee?.salary_currency ?? "USD",
    emergency_contact: employee?.emergency_contact ?? "",
    emergency_contact_phone: employee?.emergency_contact_phone ?? "",
  };
}

export default function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: EmployeeFormProps) {
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Employee name is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: EmployeeCreate = {
        name: form.name.trim(),
        identity_number: form.identity_number || undefined,
        identity_type: form.identity_type || undefined,
        email: form.email || undefined,
        phone_number: form.phone_number || undefined,
        gender: form.gender || undefined,
        birth_date: form.birth_date || undefined,
        address: form.address || undefined,
        position: form.position || undefined,
        department: form.department || undefined,
        join_date: form.join_date || undefined,
        end_date: form.end_date || undefined,
        employment_status: form.employment_status,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        salary_currency: form.salary_currency,
        emergency_contact: form.emergency_contact || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
      };
      await onSubmit(payload);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Personal Info */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Jane Smith"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Identity Type</label>
            <select
              className={inputCls}
              value={form.identity_type}
              onChange={set("identity_type")}
            >
              <option value="">Select type</option>
              {IDENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Identity Number</label>
            <input
              type="text"
              className={inputCls}
              placeholder="ID number"
              value={form.identity_number}
              onChange={set("identity_number")}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              className={inputCls}
              placeholder="jane@example.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              type="tel"
              className={inputCls}
              placeholder="+1 (555) 000-0000"
              value={form.phone_number}
              onChange={set("phone_number")}
            />
          </div>
          <div>
            <label className={labelCls}>Gender</label>
            <select
              className={inputCls}
              value={form.gender}
              onChange={set("gender")}
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date of Birth</label>
            <input
              type="date"
              className={inputCls}
              value={form.birth_date}
              onChange={set("birth_date")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Home address"
              value={form.address}
              onChange={set("address")}
            />
          </div>
        </div>
      </section>

      {/* Job Info */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Employment
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Position / Title</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Software Engineer"
              value={form.position}
              onChange={set("position")}
            />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Engineering"
              value={form.department}
              onChange={set("department")}
            />
          </div>
          <div>
            <label className={labelCls}>Join Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.join_date}
              onChange={set("join_date")}
            />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.end_date}
              onChange={set("end_date")}
            />
          </div>
          <div>
            <label className={labelCls}>Employment Status</label>
            <select
              className={inputCls}
              value={form.employment_status}
              onChange={set("employment_status")}
            >
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Salary */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Compensation
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Base Salary</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              placeholder="5000"
              value={form.salary}
              onChange={set("salary")}
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              className={inputCls}
              value={form.salary_currency}
              onChange={set("salary_currency")}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Contact Name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="John Smith"
              value={form.emergency_contact}
              onChange={set("emergency_contact")}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input
              type="tel"
              className={inputCls}
              placeholder="+1 (555) 000-0000"
              value={form.emergency_contact_phone}
              onChange={set("emergency_contact_phone")}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <LoadingSpinner size="sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
