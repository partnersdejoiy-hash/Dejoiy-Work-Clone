import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const assetsTable = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // values: 'laptop','monitor','phone','keyboard','mouse','tablet','server','other'
  serialNumber: text("serial_number"),
  assignedToId: integer("assigned_to_id").references(() => usersTable.id),
  status: text("status").notNull().default("available"), // values: 'available','assigned','maintenance','retired'
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  purchaseValue: numeric("purchase_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
