import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/policies/authorization";

export default async function LegalAdminPage() {
  await requireAdmin("legal");
  redirect("/admin/content");
}
