// ============================================================
// Company
// ============================================================

export interface Company {
  id: string;
  user_id: string;
  name: string;
  legal_name?: string | null;
  company_code?: string | null;
  logo_url?: string | null;
  description?: string | null;
  business_type?: string | null;
  industry?: string | null;
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  tax_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  employee_range?: string | null; // "1-10" | "10-50" | "50-100" | ">100"
  founded_at?: string | null; // ISO date string
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  legal_name?: string;
  company_code?: string;
  logo_url?: string;
  description?: string;
  business_type?: string;
  industry?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  tax_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  employee_range?: string;
  founded_at?: string;
  status?: string;
}

export type CompanyUpdate = Partial<CompanyCreate>;

export interface CompanyListResponse {
  items: Company[];
  total: number;
}

// ============================================================
// Employee
// ============================================================

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  identity_number?: string | null;
  identity_type?: string | null;
  email?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  birth_date?: string | null; // ISO date string
  address?: string | null;
  photo_url?: string | null;
  position?: string | null;
  department?: string | null;
  join_date?: string | null; // ISO date string
  end_date?: string | null;
  employment_status: string;
  salary?: number | null;
  salary_currency: string;
  emergency_contact?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  name: string;
  identity_number?: string;
  identity_type?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  birth_date?: string;
  address?: string;
  photo_url?: string;
  position?: string;
  department?: string;
  join_date?: string;
  end_date?: string;
  employment_status?: string;
  salary?: number;
  salary_currency?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
}

export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
}

// ============================================================
// Attendance
// ============================================================

export interface Attendance {
  id: string;
  employee_id: string;
  date: string; // ISO date
  check_in?: string | null; // HH:MM:SS
  check_out?: string | null;
  status: string; // present | absent | late | on_leave | wfh
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreate {
  date: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  notes?: string;
}

export type AttendanceUpdate = Partial<AttendanceCreate>;

export interface AttendanceListResponse {
  items: Attendance[];
  total: number;
}

// ============================================================
// Leave
// ============================================================

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: string; // annual | sick | emergency | unpaid | maternity | paternity
  start_date: string;
  end_date: string;
  reason?: string | null;
  status: string; // pending | approved | rejected
  approved_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveCreate {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status?: string;
  approved_by?: string;
  notes?: string;
}

export type LeaveUpdate = Partial<LeaveCreate>;

export interface LeaveListResponse {
  items: Leave[];
  total: number;
}

// ============================================================
// Payroll
// ============================================================

export interface Payroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  currency: string;
  status: string; // pending | paid | cancelled
  paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollCreate {
  period_start: string;
  period_end: string;
  base_salary: number;
  allowances?: number;
  deductions?: number;
  currency?: string;
  status?: string;
  paid_at?: string;
  notes?: string;
}

export type PayrollUpdate = Partial<PayrollCreate>;

export interface PayrollListResponse {
  items: Payroll[];
  total: number;
}

// ============================================================
// Performance
// ============================================================

export interface Performance {
  id: string;
  employee_id: string;
  review_period: string;
  rating?: number | null; // 1.0 – 5.0
  goals?: string | null;
  achievements?: string | null;
  feedback?: string | null;
  areas_for_improvement?: string | null;
  reviewer?: string | null;
  reviewed_at?: string | null;
  status: string; // pending | completed
  created_at: string;
  updated_at: string;
}

export interface PerformanceCreate {
  review_period: string;
  rating?: number;
  goals?: string;
  achievements?: string;
  feedback?: string;
  areas_for_improvement?: string;
  reviewer?: string;
  reviewed_at?: string;
  status?: string;
}

export type PerformanceUpdate = Partial<PerformanceCreate>;

export interface PerformanceListResponse {
  items: Performance[];
  total: number;
}
