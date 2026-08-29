import { Router, type IRouter } from "express";
import { db, auditLogsTable, usersTable } from "@workspace/db";
import { eq, and, desc, ilike, sql } from "drizzle-orm";

const router: IRouter = Router();

// List audit logs (admin only)
router.get("/audit-logs", async (req, res): Promise<void> => {
  const userRoles = req.session.userRoles || [];
  const isAdmin = userRoles.includes("admin") || userRoles.includes("hr_admin");

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { entityType, action, actorId, search, limit: limitStr, offset: offsetStr } = req.query as Record<string, string | undefined>;
  const limit = Math.min(parseInt(limitStr || "50"), 100);
  const offset = parseInt(offsetStr || "0");

  const conditions = [];
  if (entityType) conditions.push(eq(auditLogsTable.entityType, entityType));
  if (action) conditions.push(eq(auditLogsTable.action, action));
  if (actorId) conditions.push(eq(auditLogsTable.actorId, parseInt(actorId)));
  if (search) conditions.push(ilike(auditLogsTable.entityName, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogsTable)
    .where(whereClause);

  const logs = await db
    .select()
    .from(auditLogsTable)
    .where(whereClause)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    logs,
    total: countResult?.count || 0,
    limit,
    offset,
  });
});

// Get audit stats
router.get("/audit-logs/stats", async (req, res): Promise<void> => {
  const userRoles = req.session.userRoles || [];
  const isAdmin = userRoles.includes("admin") || userRoles.includes("hr_admin");

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [totalEvents] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogsTable);

  const recentActivity = await db
    .select({
      action: auditLogsTable.action,
      count: sql<number>`count(*)::int`,
    })
    .from(auditLogsTable)
    .groupBy(auditLogsTable.action)
    .orderBy(desc(sql<number>`count(*)::int`))
    .limit(10);

  res.json({
    totalEvents: totalEvents?.count || 0,
    recentActivity,
  });
});

export default router;
