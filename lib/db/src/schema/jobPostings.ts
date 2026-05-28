import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const jobPostingsTable = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull().default("Remote"),
  type: text("type").notNull().default("full_time"), // values: 'full_time','part_time','contract','intern'
  description: text("description").notNull(),
  requirements: text("requirements"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  status: text("status").notNull().default("open"), // values: 'open','closed','draft','paused'
  postedById: integer("posted_by_id").references(() => usersTable.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobPostingSchema = createInsertSchema(jobPostingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostingsTable.$inferSelect;
