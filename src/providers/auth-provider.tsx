"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/constants/storage";
import { authService } from "@/features/auth/services/auth-service";

export interface User {
  code: string;
  name: string;
  email?: string;
  status: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signup: (params: { name: string; password: string }) => Promise<{
    success: boolean;
    organization?: unknown;
    error?: string;
    message?: string;
  }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session upon mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch {
          setUser(null);
        }
      }

      if (token && typeof document !== "undefined") {
        document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.authenticate({ name, password });

      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(res.user));
        if (typeof document !== "undefined") {
          document.cookie = `${STORAGE_KEYS.USER_SESSION}=${encodeURIComponent(JSON.stringify(res.user))}; path=/; max-age=604800; SameSite=Lax`;
        }
        if (res.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
          if (typeof document !== "undefined") {
            document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=${encodeURIComponent(res.token)}; path=/; max-age=604800; SameSite=Lax`;
          }
        }
        return { success: true, message: res.message };
      }

      return { success: false, error: res.error || "Authentication failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (params: { name: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(params);

      if (res.success) {
        return {
          success: true,
          organization: res.organization,
          message: res.message,
        };
      }

      return { success: false, error: res.error || "Failed to create organization" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    if (typeof document !== "undefined") {
      document.cookie = `${STORAGE_KEYS.AUTH_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${STORAGE_KEYS.USER_SESSION}=; path=/; max-age=0; SameSite=Lax`;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
