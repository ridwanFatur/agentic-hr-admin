"use client";

import { createContext, useContext } from "react";
import { AuthUser } from "@/lib/auth/types";

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
