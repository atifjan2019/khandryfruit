import "server-only";

import { headers } from "next/headers";
import { forbidden, redirect, unauthorized } from "next/navigation";

import type { AdminArea } from "@/config/admin";
import { canAccessAdmin } from "@/config/admin";
import { auth } from "@/lib/auth/auth";

const ADMIN_ROLES = new Set([
  "CONTENT_EDITOR",
  "ORDER_MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
]);

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser(locale = "de") {
  const session = await getSession();
  if (!session) redirect(`/${locale}/sign-in`);
  return session;
}

export async function requireAdmin(area: AdminArea = "dashboard") {
  const session = await getSession();
  if (!session) unauthorized();
  if (!canAccessAdmin(String(session.user.role), area)) forbidden();
  return session;
}

export function isAdminRole(role: string) {
  return ADMIN_ROLES.has(role);
}
