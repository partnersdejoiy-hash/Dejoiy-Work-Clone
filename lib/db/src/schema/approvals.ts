import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * Approval requests — a universal record for any item requiring approval.
 * 
 * entityType + entityId reference the source record (e.g. 'leave_request' → leave_requests.id).
 * This keeps the approval system decoupled from specific modules.
 */
export const approvalRequestsTable = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  // What is being approved
  entityType: text("entity_type").notNull(), // 'leave_request', 'expense', 'timesheet', 'job_requisition', 'offer', 'employee_change', 'access_request'
  entityId: integer("entity_id").notNull(),
  // Who submitted
  requesterId: integer("requester_id").references(() => usersTable.id).notNull(),
  // Current workflow state
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'cancelled', 'escalated'
  currentStep: integer("current_step").notNull().default(1),
  totalSteps: integer("total_steps").notNull().default(1),
  // Summary for display
  title: text("title").notNull(),
  summary: text("summary"), // human-readable summary e.g. "3 days vacation, Dec 20-22"
  amount: text("amount"), // for expenses/payroll
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  // Workflow config (JSON blob for flexibility)
  workflowConfig: jsonb("workflow_config"), // defines steps, conditions, approvers
  // Timestamps
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * Individual approval steps within a workflow.
 * Each step has one or more approvers, and tracks the action taken.
 */
export const approvalStepsTable = pgTable("approval_steps", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => approvalRequestsTable.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(), // 'Manager Approval', 'HR Approval', 'Finance Review'
  // Who can/must approve
  approverId: integer("approver_id").references(() => usersTable.id), // specific person
  approverRole: text("approver_role"), // or role-based: 'manager', 'hr', 'finance'
  // What happened
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'skipped', 'delegated'
  action: text("action"), // 'approve', 'reject', 'send_back'
  comment: text("comment"),
  delegatedToId: integer("delegated_to_id").references(() => usersTable.id),
  // Timestamps
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApprovalRequestSchema = createInsertSchema(approvalRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;
export type ApprovalRequest = typeof approvalRequestsTable.$inferSelect;

export const insertApprovalStepSchema = createInsertSchema(approvalStepsTable).omit({ id: true, createdAt: true });
export type InsertApprovalStep = z.infer<typeof insertApprovalStepSchema>;
export type ApprovalStep = typeof approvalStepsTable.$inferSelect;
