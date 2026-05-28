import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const performanceReviewsTable = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => usersTable.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => usersTable.id).notNull(),
  period: text("period").notNull(), // e.g. "Q1 2026", "Annual 2025"
  overallRating: integer("overall_rating").notNull(), // 1-5
  strengths: text("strengths"),
  improvements: text("improvements"),
  comments: text("comments"),
  status: text("status").notNull().default("draft"), // values: 'draft','submitted','acknowledged'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviewsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type PerformanceReview = typeof performanceReviewsTable.$inferSelect;
