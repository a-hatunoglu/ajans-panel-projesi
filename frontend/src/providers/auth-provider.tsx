"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type User = {
  id: string;
  email: string;
  role: string;
  companyId?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

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
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
