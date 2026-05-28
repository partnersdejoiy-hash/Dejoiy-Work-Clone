import { Router, type IRouter } from "express";
import { db, usersTable, tasksTable, leaveRequestsTable, expensesTable, itTicketsTable, notificationsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { GetDashboardStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [usersCount] = await db.select({ value: count() }).from(usersTable);
  const [tasksCount] = await db
    .select({ value: count() })
    .from(tasksTable)
    .where(and(eq(tasksTable.assigneeId, userId), eq(tasksTable.status, "todo")));
  const [leavesCount] = await db
    .select({ value: count() })
    .from(leaveRequestsTable)
    .where(eq(leaveRequestsTable.status, "pending"));
  const [expensesCount] = await db
    .select({ value: count() })
    .from(expensesTable)
    .where(eq(expensesTable.status, "pending"));
  const [ticketsCount] = await db
    .select({ value: count() })
    .from(itTicketsTable)
    .where(eq(itTicketsTable.status, "open"));
  const [notificationsCount] = await db
    .select({ value: count() })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));

  const stats = {
    totalEmployees: Number(usersCount.value),
    activeTasks: Number(tasksCount.value),
    pendingLeaves: Number(leavesCount.value),
    pendingExpenses: Number(expensesCount.value),
    openTickets: Number(ticketsCount.value),
    unreadNotifications: Number(notificationsCount.value),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
