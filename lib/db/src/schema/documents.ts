import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * Employee documents — contracts, IDs, certifications, policies, etc.
 */
export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => usersTable.id).notNull(),
  uploadedById: integer("uploaded_by_id").references(() => usersTable.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'contract', 'id', 'tax', 'certification', 'policy', 'performance', 'other'
  fileType: text("file_type"), // 'pdf', 'doc', 'image', etc.
  fileUrl: text("file_url"),
  fileSize: integer("file_size"), // bytes
  isRequired: text("is_required").notNull().default("false"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
