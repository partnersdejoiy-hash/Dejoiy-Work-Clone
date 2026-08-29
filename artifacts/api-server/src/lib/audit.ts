import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger";

interface AuditEvent {
  actorId?: number;
  actorName?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an audit event. This is fire-and-forget — failures are logged but don't block the request.
 */
export async function audit(event: AuditEvent): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      actorId: event.actorId,
      actorName: event.actorName || "System",
      actorRole: event.actorRole,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      entityName: event.entityName,
      previousValue: event.previousValue ?? undefined,
      newValue: event.newValue ?? undefined,
      ip: event.ip,
      userAgent: event.userAgent,
      reason: event.reason,
      metadata: event.metadata ?? undefined,
    });
  } catch (err) {
    // Never let audit failures break the request
    logger.error({ err, event }, "Failed to write audit log");
  }
}

/**
 * Helper to create an audit event from an Express request.
 */
export function auditFromReq(
  req: { session?: { userId?: number }; ip?: string; get?: (h: string) => string | undefined },
  event: Omit<AuditEvent, "actorId" | "ip" | "userAgent"> & { actorId?: number }
) {
  return audit({
    ...event,
    actorId: event.actorId ?? req.session?.userId,
    ip: req.ip,
    userAgent: req.get?.("user-agent"),
  });
}
