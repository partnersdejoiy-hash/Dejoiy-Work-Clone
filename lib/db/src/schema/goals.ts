import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("professional"), // values: 'professional','personal','team','company'
  progress: integer("progress").notNull().default(0), // 0-100
  status: text("status").notNull().default("on_track"), // values: 'on_track','at_risk','completed','cancelled'
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
