import api from "./axios";
import { AuthUser } from "@/lib/auth/types";

export const usersApi = {
  me: async (): Promise<AuthUser> => {
    const res = await api.get<AuthUser>("/api/v1/users/me");
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<AuthUser> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<AuthUser>("/api/v1/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
