import api from "./axios";
import {
  Employee,
  EmployeeCreate,
  EmployeeListResponse,
  EmployeeUpdate,
} from "@/lib/types/hr";

const base = (companyId: string) =>
  `/api/v1/companies/${companyId}/employees`;

export const employeesApi = {
  list: async (
    companyId: string,
    skip = 0,
    limit = 100
  ): Promise<EmployeeListResponse> => {
    const res = await api.get<EmployeeListResponse>(base(companyId), {
      params: { skip, limit },
    });
    return res.data;
  },

  get: async (companyId: string, employeeId: string): Promise<Employee> => {
    const res = await api.get<Employee>(`${base(companyId)}/${employeeId}`);
    return res.data;
  },

  create: async (
    companyId: string,
    data: EmployeeCreate
  ): Promise<Employee> => {
    const res = await api.post<Employee>(base(companyId), data);
    return res.data;
  },

  update: async (
    companyId: string,
    employeeId: string,
    data: EmployeeUpdate
  ): Promise<Employee> => {
    const res = await api.patch<Employee>(
      `${base(companyId)}/${employeeId}`,
      data
    );
    return res.data;
  },

  delete: async (companyId: string, employeeId: string): Promise<void> => {
    await api.delete(`${base(companyId)}/${employeeId}`);
  },

  uploadPhoto: async (
    companyId: string,
    employeeId: string,
    file: File
  ): Promise<Employee> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<Employee>(
      `${base(companyId)}/${employeeId}/photo`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },
};
