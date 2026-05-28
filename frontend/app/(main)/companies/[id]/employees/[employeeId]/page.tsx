"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge, { employmentStatusVariant } from "@/components/ui/Badge";
import Dialog from "@/components/ui/Dialog";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { attendanceApi, leaveApi, payrollApi, performanceApi } from "@/lib/api/hr";
import {
  Company,
  Employee,
  Attendance,
  AttendanceCreate,
  AttendanceUpdate,
  Leave,
  LeaveCreate,
  LeaveUpdate,
  Payroll,
  PayrollCreate,
  PayrollUpdate,
  Performance,
  PerformanceCreate,
  PerformanceUpdate,
} from "@/lib/types/hr";

// ─────────────────────────────────────────────────────────────────────────── //
//  Constants
// ─────────────────────────────────────────────────────────────────────────── //

const TABS = ["Overview", "Attendance", "Leave", "Payroll", "Performance"] as const;
type Tab = (typeof TABS)[number];

const ATTENDANCE_STATUSES = ["present", "absent", "late", "on_leave", "wfh"];
const LEAVE_TYPES = ["annual", "sick", "emergency", "unpaid", "maternity", "paternity"];
const LEAVE_STATUSES = ["pending", "approved", "rejected"];
const PAYROLL_STATUSES = ["pending", "paid", "cancelled"];
const PERFORMANCE_STATUSES = ["pending", "completed"];
const CURRENCIES = ["USD", "IDR", "EUR", "GBP", "SGD", "MYR", "JPY", "AUD"];

// ─────────────────────────────────────────────────────────────────────────── //
//  Helpers
// ─────────────────────────────────────────────────────────────────────────── //

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtCurrency = (amount?: number | null, currency = "USD") =>
  amount != null
    ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
    : "—";

const statusColor: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  on_leave: "bg-blue-100 text-blue-700",
  wfh: "bg-purple-100 text-purple-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function StatusPill({ label }: { label: string }) {
  const cls = statusColor[label] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Modal scaffold
// ─────────────────────────────────────────────────────────────────────────── //

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Shared table / empty state
// ─────────────────────────────────────────────────────────────────────────── //

function TableShell({
  headers,
  children,
  emptyMessage,
  isEmpty,
}: {
  headers: string[];
  children: React.ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map((h) => (
              <th key={h} className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{children}</tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Form field primitives
// ─────────────────────────────────────────────────────────────────────────── //

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Attendance tab
// ─────────────────────────────────────────────────────────────────────────── //

function AttendanceTab({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const [items, setItems] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attendance | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { date: "", check_in: "", check_out: "", status: "present", notes: "" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const res = await attendanceApi.list(companyId, employeeId);
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (a: Attendance) => {
    setForm({ date: a.date, check_in: a.check_in ?? "", check_out: a.check_out ?? "", status: a.status, notes: a.notes ?? "" });
    setEditing(a);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.date) return;
    setSaving(true);
    try {
      const payload = { date: form.date, check_in: form.check_in || undefined, check_out: form.check_out || undefined, status: form.status || "present", notes: form.notes || undefined };
      if (editing) {
        await attendanceApi.update(companyId, employeeId, editing.id, payload as AttendanceUpdate);
      } else {
        await attendanceApi.create(companyId, employeeId, payload as AttendanceCreate);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await attendanceApi.delete(companyId, employeeId, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} record{items.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Record
        </button>
      </div>

      <TableShell headers={["Date", "Status", "Check In", "Check Out", "Notes", ""]} isEmpty={items.length === 0} emptyMessage="No attendance records yet.">
        {items.map((a) => (
          <tr key={a.id} className="hover:bg-gray-50/50">
            <td className="py-3 pr-4 font-medium text-gray-900">{fmtDate(a.date)}</td>
            <td className="py-3 pr-4"><StatusPill label={a.status} /></td>
            <td className="py-3 pr-4 text-gray-600">{a.check_in ?? "—"}</td>
            <td className="py-3 pr-4 text-gray-600">{a.check_out ?? "—"}</td>
            <td className="py-3 pr-4 max-w-xs truncate text-gray-500">{a.notes ?? "—"}</td>
            <td className="py-3 text-right">
              <button onClick={() => openEdit(a)} className="cursor-pointer mr-3 text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => setDeleteTarget(a)} className="cursor-pointer text-xs text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Attendance" : "Add Attendance"}>
        <div className="space-y-4">
          <Field label="Date *"><input type="date" className={inputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check In"><input type="time" className={inputCls} value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} /></Field>
            <Field label="Check Out"><input type="time" className={inputCls} value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} /></Field>
          </div>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.date} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Record" description="Are you sure you want to delete this attendance record?" closeOnBackdrop={!saving}
        actions={<>
          <button onClick={() => setDeleteTarget(null)} disabled={saving} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Deleting…" : "Delete"}
          </button>
        </>}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Leave tab
// ─────────────────────────────────────────────────────────────────────────── //

function LeaveTab({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const [items, setItems] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Leave | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Leave | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { leave_type: "annual", start_date: "", end_date: "", reason: "", status: "pending", approved_by: "", notes: "" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const res = await leaveApi.list(companyId, employeeId);
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (l: Leave) => {
    setForm({ leave_type: l.leave_type, start_date: l.start_date, end_date: l.end_date, reason: l.reason ?? "", status: l.status, approved_by: l.approved_by ?? "", notes: l.notes ?? "" });
    setEditing(l);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.start_date || !form.end_date) return;
    setSaving(true);
    try {
      const payload = { leave_type: form.leave_type, start_date: form.start_date, end_date: form.end_date, reason: form.reason || undefined, status: form.status, approved_by: form.approved_by || undefined, notes: form.notes || undefined };
      if (editing) {
        await leaveApi.update(companyId, employeeId, editing.id, payload as LeaveUpdate);
      } else {
        await leaveApi.create(companyId, employeeId, payload as LeaveCreate);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await leaveApi.delete(companyId, employeeId, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} record{items.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Request Leave
        </button>
      </div>

      <TableShell headers={["Type", "Period", "Status", "Reason", "Approved By", ""]} isEmpty={items.length === 0} emptyMessage="No leave records yet.">
        {items.map((l) => (
          <tr key={l.id} className="hover:bg-gray-50/50">
            <td className="py-3 pr-4 capitalize font-medium text-gray-900">{l.leave_type.replace(/_/g, " ")}</td>
            <td className="py-3 pr-4 text-gray-600">{fmtDate(l.start_date)} – {fmtDate(l.end_date)}</td>
            <td className="py-3 pr-4"><StatusPill label={l.status} /></td>
            <td className="py-3 pr-4 max-w-xs truncate text-gray-500">{l.reason ?? "—"}</td>
            <td className="py-3 pr-4 text-gray-500">{l.approved_by ?? "—"}</td>
            <td className="py-3 text-right">
              <button onClick={() => openEdit(l)} className="cursor-pointer mr-3 text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => setDeleteTarget(l)} className="cursor-pointer text-xs text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Leave" : "Request Leave"}>
        <div className="space-y-4">
          <Field label="Leave Type">
            <select className={inputCls} value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date *"><input type="date" className={inputCls} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required /></Field>
            <Field label="End Date *"><input type="date" className={inputCls} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required /></Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {LEAVE_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Approved By"><input type="text" className={inputCls} placeholder="Manager name" value={form.approved_by} onChange={e => setForm(f => ({ ...f, approved_by: e.target.value }))} /></Field>
          <Field label="Reason"><textarea className={inputCls} rows={2} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.start_date || !form.end_date} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Leave" description="Are you sure you want to delete this leave record?" closeOnBackdrop={!saving}
        actions={<>
          <button onClick={() => setDeleteTarget(null)} disabled={saving} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Deleting…" : "Delete"}
          </button>
        </>}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Payroll tab
// ─────────────────────────────────────────────────────────────────────────── //

function PayrollTab({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const [items, setItems] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payroll | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payroll | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { period_start: "", period_end: "", base_salary: "", allowances: "0", deductions: "0", currency: "USD", status: "pending", notes: "" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const res = await payrollApi.list(companyId, employeeId);
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (p: Payroll) => {
    setForm({ period_start: p.period_start, period_end: p.period_end, base_salary: String(p.base_salary), allowances: String(p.allowances), deductions: String(p.deductions), currency: p.currency, status: p.status, notes: p.notes ?? "" });
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.period_start || !form.period_end || !form.base_salary) return;
    setSaving(true);
    try {
      const payload = { period_start: form.period_start, period_end: form.period_end, base_salary: parseFloat(form.base_salary), allowances: parseFloat(form.allowances) || 0, deductions: parseFloat(form.deductions) || 0, currency: form.currency, status: form.status, notes: form.notes || undefined };
      if (editing) {
        await payrollApi.update(companyId, employeeId, editing.id, payload as PayrollUpdate);
      } else {
        await payrollApi.create(companyId, employeeId, payload as PayrollCreate);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await payrollApi.delete(companyId, employeeId, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} record{items.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Payroll
        </button>
      </div>

      <TableShell headers={["Period", "Base Salary", "Allowances", "Deductions", "Net", "Status", ""]} isEmpty={items.length === 0} emptyMessage="No payroll records yet.">
        {items.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50/50">
            <td className="py-3 pr-4 text-gray-700 font-medium">{fmtDate(p.period_start)} – {fmtDate(p.period_end)}</td>
            <td className="py-3 pr-4 text-gray-600">{fmtCurrency(p.base_salary, p.currency)}</td>
            <td className="py-3 pr-4 text-emerald-600">+{fmtCurrency(p.allowances, p.currency)}</td>
            <td className="py-3 pr-4 text-red-500">-{fmtCurrency(p.deductions, p.currency)}</td>
            <td className="py-3 pr-4 font-semibold text-gray-900">{fmtCurrency(p.net_salary, p.currency)}</td>
            <td className="py-3 pr-4"><StatusPill label={p.status} /></td>
            <td className="py-3 text-right">
              <button onClick={() => openEdit(p)} className="cursor-pointer mr-3 text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => setDeleteTarget(p)} className="cursor-pointer text-xs text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Payroll" : "Add Payroll"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Period Start *"><input type="date" className={inputCls} value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} required /></Field>
            <Field label="Period End *"><input type="date" className={inputCls} value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Base Salary *"><input type="number" min={0} step="0.01" className={inputCls} placeholder="5000" value={form.base_salary} onChange={e => setForm(f => ({ ...f, base_salary: e.target.value }))} required /></Field>
            <Field label="Currency">
              <select className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Allowances"><input type="number" min={0} step="0.01" className={inputCls} value={form.allowances} onChange={e => setForm(f => ({ ...f, allowances: e.target.value }))} /></Field>
            <Field label="Deductions"><input type="number" min={0} step="0.01" className={inputCls} value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: e.target.value }))} /></Field>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Net = {fmtCurrency((parseFloat(form.base_salary) || 0) + (parseFloat(form.allowances) || 0) - (parseFloat(form.deductions) || 0), form.currency)}
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {PAYROLL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Notes"><textarea className={inputCls} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.period_start || !form.period_end || !form.base_salary} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Payroll" description="Are you sure you want to delete this payroll record?" closeOnBackdrop={!saving}
        actions={<>
          <button onClick={() => setDeleteTarget(null)} disabled={saving} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Deleting…" : "Delete"}
          </button>
        </>}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Performance tab
// ─────────────────────────────────────────────────────────────────────────── //

function PerformanceTab({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const [items, setItems] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Performance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Performance | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { review_period: "", rating: "", goals: "", achievements: "", feedback: "", areas_for_improvement: "", reviewer: "", status: "pending" };
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const res = await performanceApi.list(companyId, employeeId);
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (p: Performance) => {
    setForm({ review_period: p.review_period, rating: p.rating != null ? String(p.rating) : "", goals: p.goals ?? "", achievements: p.achievements ?? "", feedback: p.feedback ?? "", areas_for_improvement: p.areas_for_improvement ?? "", reviewer: p.reviewer ?? "", status: p.status });
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.review_period) return;
    setSaving(true);
    try {
      const payload = { review_period: form.review_period, rating: form.rating ? parseFloat(form.rating) : undefined, goals: form.goals || undefined, achievements: form.achievements || undefined, feedback: form.feedback || undefined, areas_for_improvement: form.areas_for_improvement || undefined, reviewer: form.reviewer || undefined, status: form.status };
      if (editing) {
        await performanceApi.update(companyId, employeeId, editing.id, payload as PerformanceUpdate);
      } else {
        await performanceApi.create(companyId, employeeId, payload as PerformanceCreate);
      }
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await performanceApi.delete(companyId, employeeId, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const ratingStars = (r?: number | null) => {
    if (r == null) return <span className="text-gray-400">—</span>;
    const full = Math.floor(r);
    return (
      <span className="flex items-center gap-1">
        <span className="text-amber-400">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
        <span className="text-xs text-gray-500">{r.toFixed(1)}</span>
      </span>
    );
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="md" /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} review{items.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Review
        </button>
      </div>

      <TableShell headers={["Period", "Rating", "Reviewer", "Status", "Goals", ""]} isEmpty={items.length === 0} emptyMessage="No performance reviews yet.">
        {items.map((p) => (
          <tr key={p.id} className="hover:bg-gray-50/50">
            <td className="py-3 pr-4 font-medium text-gray-900">{p.review_period}</td>
            <td className="py-3 pr-4">{ratingStars(p.rating)}</td>
            <td className="py-3 pr-4 text-gray-600">{p.reviewer ?? "—"}</td>
            <td className="py-3 pr-4"><StatusPill label={p.status} /></td>
            <td className="py-3 pr-4 max-w-xs truncate text-gray-500">{p.goals ?? "—"}</td>
            <td className="py-3 text-right">
              <button onClick={() => openEdit(p)} className="cursor-pointer mr-3 text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => setDeleteTarget(p)} className="cursor-pointer text-xs text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Review" : "Add Review"}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Review Period *"><input type="text" className={inputCls} placeholder="2024-Q1" value={form.review_period} onChange={e => setForm(f => ({ ...f, review_period: e.target.value }))} required /></Field>
            <Field label="Rating (1–5)"><input type="number" min={1} max={5} step={0.1} className={inputCls} placeholder="4.5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reviewer"><input type="text" className={inputCls} placeholder="Manager name" value={form.reviewer} onChange={e => setForm(f => ({ ...f, reviewer: e.target.value }))} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {PERFORMANCE_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Goals"><textarea className={inputCls} rows={2} value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} /></Field>
          <Field label="Achievements"><textarea className={inputCls} rows={2} value={form.achievements} onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))} /></Field>
          <Field label="Feedback"><textarea className={inputCls} rows={2} value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))} /></Field>
          <Field label="Areas for Improvement"><textarea className={inputCls} rows={2} value={form.areas_for_improvement} onChange={e => setForm(f => ({ ...f, areas_for_improvement: e.target.value }))} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.review_period} className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Review" description="Are you sure you want to delete this performance review?" closeOnBackdrop={!saving}
        actions={<>
          <button onClick={() => setDeleteTarget(null)} disabled={saving} className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Deleting…" : "Delete"}
          </button>
        </>}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Overview tab
// ─────────────────────────────────────────────────────────────────────────── //

function OverviewTab({ employee, companyId, onPhotoUpdated }: { employee: Employee; companyId: string; onPhotoUpdated: (updated: Employee) => void }) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const updated = await employeesApi.uploadPhoto(companyId, employee.id, file);
      onPhotoUpdated(updated);
    } catch {
      // silently fail
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initials = employee.name.split(" ").slice(0, 2).map(n => n.charAt(0).toUpperCase()).join("");
  const fmtCurr = (amount?: number | null, currency?: string) =>
    amount != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: currency ?? "USD" }).format(amount) : null;

  return (
    <div className="space-y-6">
      {/* Photo + basic */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden ring-2 ring-white shadow-sm">
            {photoUploading ? <LoadingSpinner size="sm" /> : employee.photo_url ? (
              <img src={employee.photo_url} alt={employee.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">{initials}</span>
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading} title="Upload photo"
            className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:cursor-not-allowed">
            <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Employee ID</p>
          <p className="mt-0.5 font-mono text-xs text-gray-500">{employee.id.slice(0, 8)}…</p>
          {employee.identity_type && employee.identity_number && (
            <p className="mt-2 text-sm text-gray-600"><span className="font-medium">{employee.identity_type}:</span> {employee.identity_number}</p>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {employee.email && <InfoItem label="Email" value={employee.email} />}
        {employee.phone_number && <InfoItem label="Phone" value={employee.phone_number} />}
        {employee.gender && <InfoItem label="Gender" value={employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)} />}
        {employee.birth_date && <InfoItem label="Date of Birth" value={fmtDate(employee.birth_date)} />}
        {employee.join_date && <InfoItem label="Join Date" value={fmtDate(employee.join_date)} />}
        {employee.end_date && <InfoItem label="End Date" value={fmtDate(employee.end_date)} />}
        {fmtCurr(employee.salary, employee.salary_currency) && (
          <InfoItem label="Salary" value={fmtCurr(employee.salary, employee.salary_currency)!} />
        )}
        {employee.address && <InfoItem label="Address" value={employee.address} className="sm:col-span-2" />}
        {employee.emergency_contact && (
          <InfoItem label="Emergency Contact" value={`${employee.emergency_contact}${employee.emergency_contact_phone ? ` · ${employee.emergency_contact_phone}` : ""}`} />
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────── //
//  Page
// ─────────────────────────────────────────────────────────────────────────── //

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string; employeeId: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      companiesApi.get(params.id),
      employeesApi.get(params.id, params.employeeId),
    ])
      .then(([comp, emp]) => { setCompany(comp); setEmployee(emp); })
      .catch(() => router.replace(`/companies/${params.id}`))
      .finally(() => setLoading(false));
  }, [params.id, params.employeeId, router]);

  const handleDeleteConfirm = async () => {
    if (!employee) return;
    setDeleting(true);
    try {
      await employeesApi.delete(params.id, employee.id);
      router.push(`/companies/${params.id}`);
    } catch {
      setDeleting(false);
    }
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
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/companies" className="hover:text-gray-600 transition-colors">Companies</Link>
        <span>/</span>
        <Link href={`/companies/${params.id}`} className="hover:text-gray-600 transition-colors">{company?.name}</Link>
        <span>/</span>
        <Link href={`/companies/${params.id}/employees`} className="hover:text-gray-600 transition-colors">Employees</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{employee.name}</span>
      </nav>

      {/* Employee header card */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm overflow-hidden">
              {employee.photo_url ? (
                <img src={employee.photo_url} alt={employee.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">
                  {employee.name.split(" ").slice(0, 2).map(n => n.charAt(0).toUpperCase()).join("")}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">{employee.name}</h1>
                <Badge
                  label={employee.employment_status.replace(/_/g, " ")}
                  variant={employmentStatusVariant(employee.employment_status)}
                />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                {[employee.position, employee.department].filter(Boolean).join(" · ") || "No position set"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/companies/${params.id}/employees/${employee.id}/edit`}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
            >
              Edit
            </Link>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="cursor-pointer rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {activeTab === "Overview" && (
          <OverviewTab employee={employee} companyId={params.id} onPhotoUpdated={setEmployee} />
        )}
        {activeTab === "Attendance" && (
          <AttendanceTab companyId={params.id} employeeId={params.employeeId} />
        )}
        {activeTab === "Leave" && (
          <LeaveTab companyId={params.id} employeeId={params.employeeId} />
        )}
        {activeTab === "Payroll" && (
          <PayrollTab companyId={params.id} employeeId={params.employeeId} />
        )}
        {activeTab === "Performance" && (
          <PerformanceTab companyId={params.id} employeeId={params.employeeId} />
        )}
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => { if (!deleting) setDeleteDialogOpen(false); }}
        title="Delete Employee"
        description={`Are you sure you want to remove "${employee.name}" from ${company?.name}? All their HR records will also be removed. This action cannot be undone.`}
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
              {deleting ? "Deleting…" : "Delete Employee"}
            </button>
          </>
        }
      />
    </>
  );
}
