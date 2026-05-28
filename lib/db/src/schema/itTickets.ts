import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const itTicketsTable = pgTable("it_tickets", {
  id: serial("id").primaryKey(),
  submitterId: integer("submitter_id").references(() => usersTable.id).notNull(),
  assigneeId: integer("assignee_id").references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // values: 'hardware', 'software', 'network', 'access', 'other'
  priority: text("priority").notNull().default("medium"), // values: 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("open"), // values: 'open', 'in_progress', 'resolved', 'closed'
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertItTicketSchema = createInsertSchema(itTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertItTicket = z.infer<typeof insertItTicketSchema>;
export type ItTicket = typeof itTicketsTable.$inferSelect;
