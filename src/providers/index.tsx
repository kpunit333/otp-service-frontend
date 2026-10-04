"use client";

import React from "react";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";
import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "./sidebar-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export * from "./auth-provider";
export * from "./toast-provider";
export * from "./theme-provider";
export * from "./sidebar-provider";
