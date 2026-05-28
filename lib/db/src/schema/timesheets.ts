import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const timesheetsTable = pgTable("timesheets", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => usersTable.id).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  hoursWorked: numeric("hours_worked", { precision: 4, scale: 2 }).notNull(),
  project: text("project").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // values: 'draft','submitted','approved','rejected'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTimesheetSchema = createInsertSchema(timesheetsTable).omit({ id: true, createdAt: true });
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheetsTable.$inferSelect;
