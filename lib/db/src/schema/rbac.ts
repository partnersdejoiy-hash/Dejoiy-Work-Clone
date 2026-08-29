import { pgTable, text, serial, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

// Roles defined in the system
export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g. 'admin', 'hr_admin', 'hr', 'manager', 'employee', 'payroll_admin', 'recruiter', 'finance', 'it_admin'
  displayName: text("display_name").notNull(),
  description: text("description"),
  isSystem: text("is_system").notNull().default("false"), // 'true' for built-in roles that can't be deleted
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Granular permissions
export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. 'payroll.view', 'leave.approve', 'employee.profile.edit'
  module: text("module").notNull(), // e.g. 'payroll', 'leave', 'employee', 'recruiting'
  action: text("action").notNull(), // e.g. 'view', 'create', 'edit', 'delete', 'approve', 'admin'
  description: text("description"),
});

// Many-to-many: role ↔ permission
export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: integer("role_id").references(() => rolesTable.id).notNull(),
  permissionId: integer("permission_id").references(() => permissionsTable.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// User ↔ role assignment (a user can have multiple roles)
export const userRolesTable = pgTable("user_roles", {
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  roleId: integer("role_id").references(() => rolesTable.id).notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  assignedBy: integer("assigned_by").references(() => usersTable.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

export const insertRoleSchema = createInsertSchema(rolesTable).omit({ id: true, createdAt: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof rolesTable.$inferSelect;

export const insertPermissionSchema = createInsertSchema(permissionsTable).omit({ id: true });
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissionsTable.$inferSelect;
