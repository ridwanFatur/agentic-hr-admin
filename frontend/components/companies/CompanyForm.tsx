"use client";

import { useState } from "react";
import { Company, CompanyCreate, CompanyUpdate } from "@/lib/types/hr";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Non-profit",
  "Cooperative",
  "Other",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Transportation",
  "Hospitality",
  "Agriculture",
  "Energy",
  "Media & Entertainment",
  "Professional Services",
  "Other",
];

const EMPLOYEE_RANGES = ["1-10", "10-50", "50-100", ">100"];
const STATUS_OPTIONS = ["active", "inactive"];

interface CompanyFormProps {
  initial?: Company;
  onSubmit: (data: CompanyCreate | CompanyUpdate) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

type FormState = {
  name: string;
  legal_name: string;
  company_code: string;
  description: string;
  business_type: string;
  industry: string;
  email: string;
  phone_number: string;
  website: string;
  tax_number: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  employee_range: string;
  founded_at: string;
  status: string;
};

function toFormState(company?: Company): FormState {
  return {
    name: company?.name ?? "",
    legal_name: company?.legal_name ?? "",
    company_code: company?.company_code ?? "",
    description: company?.description ?? "",
    business_type: company?.business_type ?? "",
    industry: company?.industry ?? "",
    email: company?.email ?? "",
    phone_number: company?.phone_number ?? "",
    website: company?.website ?? "",
    tax_number: company?.tax_number ?? "",
    address: company?.address ?? "",
    city: company?.city ?? "",
    state: company?.state ?? "",
    postal_code: company?.postal_code ?? "",
    country: company?.country ?? "",
    employee_range: company?.employee_range ?? "",
    founded_at: company?.founded_at ?? "",
    status: company?.status ?? "active",
  };
}

export default function CompanyForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: CompanyFormProps) {
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload: CompanyCreate = {
        name: form.name.trim(),
        legal_name: form.legal_name || undefined,
        company_code: form.company_code || undefined,
        description: form.description || undefined,
        business_type: form.business_type || undefined,
        industry: form.industry || undefined,
        email: form.email || undefined,
        phone_number: form.phone_number || undefined,
        website: form.website || undefined,
        tax_number: form.tax_number || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        postal_code: form.postal_code || undefined,
        country: form.country || undefined,
        employee_range: form.employee_range || undefined,
        founded_at: form.founded_at || undefined,
        status: form.status,
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

      {/* Basic Info */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Acme Corp"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Legal Name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Acme Corporation Ltd."
              value={form.legal_name}
              onChange={set("legal_name")}
            />
          </div>
          <div>
            <label className={labelCls}>Company Code</label>
            <input
              type="text"
              className={inputCls}
              placeholder="ACME-001"
              value={form.company_code}
              onChange={set("company_code")}
            />
          </div>
          <div>
            <label className={labelCls}>Business Type</label>
            <select
              className={inputCls}
              value={form.business_type}
              onChange={set("business_type")}
            >
              <option value="">Select type</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Industry</label>
            <select
              className={inputCls}
              value={form.industry}
              onChange={set("industry")}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Founded Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.founded_at}
              onChange={set("founded_at")}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={set("status")}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              className={inputCls}
              rows={3}
              placeholder="What does this company do?"
              value={form.description}
              onChange={set("description")}
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Contact
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              className={inputCls}
              placeholder="hello@acme.com"
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
            <label className={labelCls}>Website</label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://acme.com"
              value={form.website}
              onChange={set("website")}
            />
          </div>
          <div>
            <label className={labelCls}>Tax Number</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Tax ID / VAT Number"
              value={form.tax_number}
              onChange={set("tax_number")}
            />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Address
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="123 Main Street"
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              className={inputCls}
              placeholder="San Francisco"
              value={form.city}
              onChange={set("city")}
            />
          </div>
          <div>
            <label className={labelCls}>State / Province</label>
            <input
              type="text"
              className={inputCls}
              placeholder="California"
              value={form.state}
              onChange={set("state")}
            />
          </div>
          <div>
            <label className={labelCls}>Postal Code</label>
            <input
              type="text"
              className={inputCls}
              placeholder="94102"
              value={form.postal_code}
              onChange={set("postal_code")}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text"
              className={inputCls}
              placeholder="United States"
              value={form.country}
              onChange={set("country")}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Additional Info
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Employee Range</label>
            <select
              className={inputCls}
              value={form.employee_range}
              onChange={set("employee_range")}
            >
              <option value="">Select range</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>{r} employees</option>
              ))}
            </select>
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
