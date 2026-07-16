import { AdminShell } from "@/components/admin/admin-shell";
import { visibleAdminAreas } from "@/config/admin";
import { requireAdmin } from "@/server/policies/authorization";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin("dashboard");
  const role = String(session.user.role);
  return (
    <AdminShell
      areas={visibleAdminAreas(role)}
      user={{ name: session.user.name, email: session.user.email, role }}
    >
      {children}
    </AdminShell>
  );
}
