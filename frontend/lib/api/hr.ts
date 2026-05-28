import api from "./axios";
import {
  Attendance,
  AttendanceCreate,
  AttendanceListResponse,
  AttendanceUpdate,
  Leave,
  LeaveCreate,
  LeaveListResponse,
  LeaveUpdate,
  Payroll,
  PayrollCreate,
  PayrollListResponse,
  PayrollUpdate,
  Performance,
  PerformanceCreate,
  PerformanceListResponse,
  PerformanceUpdate,
} from "@/lib/types/hr";

const empBase = (companyId: string, employeeId: string) =>
  `/api/v1/companies/${companyId}/employees/${employeeId}`;

// ------------------------------------------------------------------ //
//  Attendance
// ------------------------------------------------------------------ //

export const attendanceApi = {
  list: async (
    companyId: string,
    employeeId: string,
    skip = 0,
    limit = 100
  ): Promise<AttendanceListResponse> => {
    const res = await api.get<AttendanceListResponse>(
      `${empBase(companyId, employeeId)}/attendances`,
      { params: { skip, limit } }
    );
    return res.data;
  },

  create: async (
    companyId: string,
    employeeId: string,
    data: AttendanceCreate
  ): Promise<Attendance> => {
    const res = await api.post<Attendance>(
      `${empBase(companyId, employeeId)}/attendances`,
      data
    );
    return res.data;
  },

  update: async (
    companyId: string,
    employeeId: string,
    attendanceId: string,
    data: AttendanceUpdate
  ): Promise<Attendance> => {
    const res = await api.patch<Attendance>(
      `${empBase(companyId, employeeId)}/attendances/${attendanceId}`,
      data
    );
    return res.data;
  },

  delete: async (
    companyId: string,
    employeeId: string,
    attendanceId: string
  ): Promise<void> => {
    await api.delete(
      `${empBase(companyId, employeeId)}/attendances/${attendanceId}`
    );
  },
};

// ------------------------------------------------------------------ //
//  Leave
// ------------------------------------------------------------------ //

export const leaveApi = {
  list: async (
    companyId: string,
    employeeId: string,
    skip = 0,
    limit = 100
  ): Promise<LeaveListResponse> => {
    const res = await api.get<LeaveListResponse>(
      `${empBase(companyId, employeeId)}/leaves`,
      { params: { skip, limit } }
    );
    return res.data;
  },

  create: async (
    companyId: string,
    employeeId: string,
    data: LeaveCreate
  ): Promise<Leave> => {
    const res = await api.post<Leave>(
      `${empBase(companyId, employeeId)}/leaves`,
      data
    );
    return res.data;
  },

  update: async (
    companyId: string,
    employeeId: string,
    leaveId: string,
    data: LeaveUpdate
  ): Promise<Leave> => {
    const res = await api.patch<Leave>(
      `${empBase(companyId, employeeId)}/leaves/${leaveId}`,
      data
    );
    return res.data;
  },

  delete: async (
    companyId: string,
    employeeId: string,
    leaveId: string
  ): Promise<void> => {
    await api.delete(`${empBase(companyId, employeeId)}/leaves/${leaveId}`);
  },
};

// ------------------------------------------------------------------ //
//  Payroll
// ------------------------------------------------------------------ //

export const payrollApi = {
  list: async (
    companyId: string,
    employeeId: string,
    skip = 0,
    limit = 100
  ): Promise<PayrollListResponse> => {
    const res = await api.get<PayrollListResponse>(
      `${empBase(companyId, employeeId)}/payrolls`,
      { params: { skip, limit } }
    );
    return res.data;
  },

  create: async (
    companyId: string,
    employeeId: string,
    data: PayrollCreate
  ): Promise<Payroll> => {
    const res = await api.post<Payroll>(
      `${empBase(companyId, employeeId)}/payrolls`,
      data
    );
    return res.data;
  },

  update: async (
    companyId: string,
    employeeId: string,
    payrollId: string,
    data: PayrollUpdate
  ): Promise<Payroll> => {
    const res = await api.patch<Payroll>(
      `${empBase(companyId, employeeId)}/payrolls/${payrollId}`,
      data
    );
    return res.data;
  },

  delete: async (
    companyId: string,
    employeeId: string,
    payrollId: string
  ): Promise<void> => {
    await api.delete(
      `${empBase(companyId, employeeId)}/payrolls/${payrollId}`
    );
  },
};

// ------------------------------------------------------------------ //
//  Performance
// ------------------------------------------------------------------ //

export const performanceApi = {
  list: async (
    companyId: string,
    employeeId: string,
    skip = 0,
    limit = 100
  ): Promise<PerformanceListResponse> => {
    const res = await api.get<PerformanceListResponse>(
      `${empBase(companyId, employeeId)}/performances`,
      { params: { skip, limit } }
    );
    return res.data;
  },

  create: async (
    companyId: string,
    employeeId: string,
    data: PerformanceCreate
  ): Promise<Performance> => {
    const res = await api.post<Performance>(
      `${empBase(companyId, employeeId)}/performances`,
      data
    );
    return res.data;
  },

  update: async (
    companyId: string,
    employeeId: string,
    performanceId: string,
    data: PerformanceUpdate
  ): Promise<Performance> => {
    const res = await api.patch<Performance>(
      `${empBase(companyId, employeeId)}/performances/${performanceId}`,
      data
    );
    return res.data;
  },

  delete: async (
    companyId: string,
    employeeId: string,
    performanceId: string
  ): Promise<void> => {
    await api.delete(
      `${empBase(companyId, employeeId)}/performances/${performanceId}`
    );
  },
};
