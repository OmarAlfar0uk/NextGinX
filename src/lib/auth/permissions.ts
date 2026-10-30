import type { AdminRole } from "@prisma/client";

export type Permission = "dashboard:read" | "content:write" | "leads:read" | "leads:manage" | "users:manage" | "security:manage";
const grants: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: ["dashboard:read", "content:write", "leads:read", "leads:manage", "users:manage", "security:manage"],
  ADMIN: ["dashboard:read", "content:write", "leads:read", "leads:manage", "users:manage"],
  EDITOR: ["dashboard:read", "content:write"],
  SALES_MANAGER: ["dashboard:read", "leads:read", "leads:manage"],
  SALES_AGENT: ["dashboard:read", "leads:read"],
};
export function can(role: AdminRole, permission: Permission) { return grants[role].includes(permission); }
