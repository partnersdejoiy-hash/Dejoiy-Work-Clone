import type { Request, Response, NextFunction } from "express";
import { db, userRolesTable, rolesTable, permissionsTable, rolePermissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

// Cache permissions per request to avoid repeated DB calls
declare module "express-session" {
  interface SessionData {
    userId: number;
    userRoles?: string[];
    userPermissions?: string[];
  }
}

/**
 * Ensure the user has at least one of the specified roles.
 * Usage: requireRole("admin", "hr_admin")
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Use cached roles if available
    if (req.session.userRoles) {
      const hasRole = req.session.userRoles.some(r => allowedRoles.includes(r));
      if (!hasRole) {
        res.status(403).json({ error: "Forbidden", requiredRoles: allowedRoles });
        return;
      }
      next();
      return;
    }

    // Fetch roles from DB
    const userRoles = await db
      .select({ roleName: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, req.session.userId));

    const roleNames = userRoles.map(r => r.roleName);
    req.session.userRoles = roleNames;

    const hasRole = roleNames.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: "Forbidden", requiredRoles: allowedRoles });
      return;
    }

    next();
  };
}

/**
 * Ensure the user has a specific permission.
 * Usage: requirePermission("payroll.view")
 */
export function requirePermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Use cached permissions if available
    if (req.session.userPermissions) {
      if (!req.session.userPermissions.includes(permissionCode)) {
        res.status(403).json({ error: "Forbidden", requiredPermission: permissionCode });
        return;
      }
      next();
      return;
    }

    // Fetch permissions from DB
    const userPerms = await db
      .select({ code: permissionsTable.code })
      .from(userRolesTable)
      .innerJoin(rolePermissionsTable, eq(userRolesTable.roleId, rolePermissionsTable.roleId))
      .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .where(eq(userRolesTable.userId, req.session.userId));

    const permCodes = userPerms.map(p => p.code);
    req.session.userPermissions = permCodes;

    if (!permCodes.includes(permissionCode)) {
      res.status(403).json({ error: "Forbidden", requiredPermission: permissionCode });
      return;
    }

    next();
  };
}

/**
 * Ensure the user has ANY of the specified permissions.
 * Usage: requireAnyPermission("leave.approve", "leave.admin")
 */
export function requireAnyPermission(...permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.session.userPermissions) {
      const hasAny = req.session.userPermissions.some(p => permissionCodes.includes(p));
      if (!hasAny) {
        res.status(403).json({ error: "Forbidden", requiredPermissions: permissionCodes });
        return;
      }
      next();
      return;
    }

    const userPerms = await db
      .select({ code: permissionsTable.code })
      .from(userRolesTable)
      .innerJoin(rolePermissionsTable, eq(userRolesTable.roleId, rolePermissionsTable.roleId))
      .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .where(eq(userRolesTable.userId, req.session.userId));

    const permCodes = userPerms.map(p => p.code);
    req.session.userPermissions = permCodes;

    const hasAny = permCodes.some(p => permissionCodes.includes(p));
    if (!hasAny) {
      res.status(403).json({ error: "Forbidden", requiredPermissions: permissionCodes });
      return;
    }

    next();
  };
}

/**
 * Middleware that loads user roles and permissions into session for downstream use.
 * Place this after requireAuth.
 */
export async function loadUserContext(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.session.userId) {
    next();
    return;
  }

  // Skip if already loaded
  if (req.session.userRoles && req.session.userPermissions) {
    next();
    return;
  }

  try {
    const userRoles = await db
      .select({ roleName: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, req.session.userId));

    req.session.userRoles = userRoles.map(r => r.roleName);

    const userPerms = await db
      .select({ code: permissionsTable.code })
      .from(userRolesTable)
      .innerJoin(rolePermissionsTable, eq(userRolesTable.roleId, rolePermissionsTable.roleId))
      .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .where(eq(userRolesTable.userId, req.session.userId));

    req.session.userPermissions = userPerms.map(p => p.code);
  } catch (err) {
    // Don't fail the request — just proceed without roles
    req.session.userRoles = [];
    req.session.userPermissions = [];
  }

  next();
}
