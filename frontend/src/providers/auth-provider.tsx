"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  agencyId?: string | null;
  agencyRole?: string | null;
  companyRoles?: string[];
  companyId?: string | null;
  forcePasswordChange?: boolean;
  hasCompletedOnboarding?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  updateUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Foundation level fetch: simply provide user session details to the UI layer.
    const fetchSession = async () => {
      try {
        const res = await apiClient<ApiResponse<{ user: User }>>("/users/me", {
          suppressAuthRedirect: true,
        });
        setUser(res.data.user);

        if (res.data.user.forcePasswordChange && typeof window !== "undefined") {
          if (!window.location.pathname.startsWith("/force-password")) {
            window.location.href = "/force-password";
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const logout = useCallback(async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {
      // Proceed with client-side cleanup even if the request fails
    }
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
