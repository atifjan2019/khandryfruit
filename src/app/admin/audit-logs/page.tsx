import { Search } from "lucide-react";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/server/policies/authorization";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; entity?: string }>;
}) {
  await requireAdmin("audit-logs");
  const { q = "", entity = "" } = await searchParams;
  const logs = await db.auditLog.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { action: { contains: q, mode: "insensitive" } },
              { entityId: { contains: q, mode: "insensitive" } },
              { actor: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(entity ? { entityType: entity } : {}),
    },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div className="admin-page-v2">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Security record</p>
          <h1>Audit logs</h1>
          <p>
            Append-only history of sensitive administrative changes and request
            metadata.
          </p>
        </div>
      </div>
      <form className="admin-filterbar">
        <label>
          <Search size={16} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Action, entity ID or actor"
          />
        </label>
        <input name="entity" defaultValue={entity} placeholder="Entity type" />
        <button className="button">Apply</button>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP</th>
              <th>Change summary</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt.toLocaleString("en-DE")}</td>
                <td>
                  {log.actor?.name ?? "System"}
                  <small>{log.actor?.email}</small>
                </td>
                <td>
                  <strong>{log.action.replaceAll("_", " ")}</strong>
                </td>
                <td>
                  {log.entityType}
                  <small>{log.entityId}</small>
                </td>
                <td>{log.ipAddress ?? "-"}</td>
                <td>
                  <small>
                    {log.before ? "Previous value recorded · " : ""}
                    {log.after ? "New value recorded" : "Metadata only"}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && (
          <p className="admin-empty">No audit records match these filters.</p>
        )}
      </div>
    </div>
  );
}
