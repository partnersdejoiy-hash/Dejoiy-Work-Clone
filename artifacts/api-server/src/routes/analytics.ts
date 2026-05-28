import { Router, type IRouter } from "express";
import { db, usersTable, payrollTable, expensesTable, jobPostingsTable, performanceReviewsTable, tasksTable, leaveRequestsTable } from "@workspace/db";
import { sql, eq, avg, sum, count, desc } from "drizzle-orm";
import {
  GetAnalyticsOverviewResponse,
  GetHeadcountDataResponse,
  GetTaskStatsResponse,
  GetExpenseTrendsResponse,
  GetLeaveBreakdownResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/overview", async (req, res): Promise<void> => {
  const [totalEmployees] = await db.select({ count: count() }).from(usersTable);
  const [totalPayroll] = await db.select({ total: sum(payrollTable.netPay) }).from(payrollTable);
  const [totalExpenses] = await db.select({ total: sum(expensesTable.amount) }).from(expensesTable);
  const [openPositions] = await db.select({ count: count() }).from(jobPostingsTable).where(eq(jobPostingsTable.status, "open"));
  const [avgPerformance] = await db.select({ avg: avg(performanceReviewsTable.overallRating) }).from(performanceReviewsTable);

  const response = {
    totalEmployees: totalEmployees.count,
    monthlyHires: 2, // Mock for now or calculate from usersTable.hireDate
    avgTenureMonths: 14.5, // Mock
    turnoverRate: 0.05, // Mock
    totalPayroll: parseFloat(totalPayroll.total || "0"),
    totalExpenses: parseFloat(totalExpenses.total || "0"),
    openPositions: openPositions.count,
    avgPerformanceRating: parseFloat(avgPerformance.avg || "0"),
  };

  res.json(GetAnalyticsOverviewResponse.parse(response));
});

router.get("/analytics/headcount", async (req, res): Promise<void> => {
  const data = await db
    .select({
      department: usersTable.department,
      count: count(),
    })
    .from(usersTable)
    .groupBy(usersTable.department);

  res.json(GetHeadcountDataResponse.parse(data.map(d => ({
    department: d.department || "Unassigned",
    count: d.count
  }))));
});

router.get("/analytics/task-stats", async (req, res): Promise<void> => {
  const data = await db
    .select({
      status: tasksTable.status,
      count: count(),
    })
    .from(tasksTable)
    .groupBy(tasksTable.status);

  res.json(GetTaskStatsResponse.parse(data));
});

router.get("/analytics/expense-trends", async (req, res): Promise<void> => {
  // Simple last 6 months grouping by month
  // In a real app we'd use postgres date formatting, but let's keep it simple for now
  const data = await db
    .select({
      month: sql<string>`to_char(${expensesTable.expenseDate}, 'Mon YYYY')`,
      amount: sum(expensesTable.amount),
      count: count(),
    })
    .from(expensesTable)
    .groupBy(sql`to_char(${expensesTable.expenseDate}, 'Mon YYYY')`)
    .limit(6);

  res.json(GetExpenseTrendsResponse.parse(data.map(d => ({
    month: d.month,
    amount: parseFloat(d.amount || "0"),
    count: d.count
  }))));
});

router.get("/analytics/leave-breakdown", async (req, res): Promise<void> => {
  const data = await db
    .select({
      type: leaveRequestsTable.type,
      count: count(),
      totalDays: sum(leaveRequestsTable.days),
    })
    .from(leaveRequestsTable)
    .groupBy(leaveRequestsTable.type);

  res.json(GetLeaveBreakdownResponse.parse(data.map(d => ({
    type: d.type,
    count: d.count,
    totalDays: parseInt(d.totalDays || "0")
  }))));
});

export default router;
