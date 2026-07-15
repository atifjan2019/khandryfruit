import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.has(String(session.user.role)))
    redirect("/de/sign-in");
  return session;
}

export function isAdminRole(role: string) {
  return ADMIN_ROLES.has(role);
}
