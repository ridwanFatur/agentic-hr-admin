import api from "./axios";
import {
  Company,
  CompanyCreate,
  CompanyListResponse,
  CompanyUpdate,
} from "@/lib/types/hr";

const BASE = "/api/v1/companies";

export const companiesApi = {
  list: async (skip = 0, limit = 50): Promise<CompanyListResponse> => {
    const res = await api.get<CompanyListResponse>(BASE, {
      params: { skip, limit },
    });
    return res.data;
  },

  get: async (id: string): Promise<Company> => {
    const res = await api.get<Company>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: CompanyCreate): Promise<Company> => {
    const res = await api.post<Company>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: CompanyUpdate): Promise<Company> => {
    const res = await api.patch<Company>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  uploadLogo: async (id: string, file: File): Promise<Company> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<Company>(`${BASE}/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
