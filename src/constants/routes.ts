/**
 * Application Route Paths
 * Consolidates authentication to /auth and defines protected console routes
 */
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "/auth",
  SIGNUP: "/auth?tab=signup",
  REGISTER: "/auth?tab=signup",
  DASHBOARD: "/dashboard",
  PROJECTS: "/dashboard/projects",
  SIMULATOR: "/dashboard/simulator",
  LOGS: "/dashboard/logs",
  TEMPLATES: "/dashboard/templates",
  API_KEYS: "/dashboard/api-keys",
  PROVIDERS: "/dashboard/providers",
  SETTINGS: "/dashboard/settings",
  DOCS: "/dashboard/docs",
} as const;
