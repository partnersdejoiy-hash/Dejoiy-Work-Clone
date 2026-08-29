import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * Audit log — records every significant system event.
 * 
 * Used for compliance, debugging, and security investigations.
 * Never delete audit records — they are append-only.
 */
export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  // Who
  actorId: integer("actor_id").references(() => usersTable.id),
  actorName: text("actor_name").notNull(), // denormalized for query performance
  actorRole: text("actor_role"),
  // What
  action: text("action").notNull(), // 'login', 'logout', 'create', 'update', 'delete', 'approve', 'reject', 'submit', 'export', 'view'
  entityType: text("entity_type").notNull(), // 'user', 'leave_request', 'expense', 'payroll', 'approval', 'document', 'role', 'workflow', etc.
  entityId: integer("entity_id"),
  entityName: text("entity_name"), // human-readable name of the entity
  // Change tracking
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  // Context
  ip: text("ip_address"),
  userAgent: text("user_agent"),
  reason: text("reason"), // optional reason/comment
  metadata: jsonb("metadata"), // extra context
  // Timestamp
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
