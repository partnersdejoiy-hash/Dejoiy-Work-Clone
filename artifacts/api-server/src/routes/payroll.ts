import { Router, type IRouter } from "express";
import { db, payrollTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListPayrollResponse,
  CreatePayrollRecordBody,
  UpdatePayrollRecordParams,
  UpdatePayrollRecordBody,
  UpdatePayrollRecordResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/payroll", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  let conditions = [];
  if (user.role !== "admin" && user.role !== "manager") {
    conditions.push(eq(payrollTable.employeeId, req.session.userId!));
  }

  const records = await db
    .select()
    .from(payrollTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(
    ListPayrollResponse.parse(
      records.map((r) => ({
        ...r,
        baseSalary: parseFloat(r.baseSalary),
        bonus: parseFloat(r.bonus),
        deductions: parseFloat(r.deductions),
        netPay: parseFloat(r.netPay),
        paidAt: r.paidAt?.toISOString(),
        createdAt: r.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/payroll", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  if (user.role !== "admin" && user.role !== "manager") {
    res.status(403).json({ error: "Only admins and managers can create payroll records" });
    return;
  }

  const parsed = CreatePayrollRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(payrollTable)
    .values({
      ...parsed.data,
      baseSalary: parsed.data.baseSalary.toString(),
      bonus: (parsed.data.bonus || 0).toString(),
      deductions: (parsed.data.deductions || 0).toString(),
      netPay: parsed.data.netPay.toString(),
    })
    .returning();

  res.status(201).json(
    UpdatePayrollRecordResponse.parse({
      ...record,
      baseSalary: parseFloat(record.baseSalary),
      bonus: parseFloat(record.bonus),
      deductions: parseFloat(record.deductions),
      netPay: parseFloat(record.netPay),
      paidAt: record.paidAt?.toISOString(),
      createdAt: record.createdAt?.toISOString(),
    })
  );
});

router.patch("/payroll/:id", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  if (user.role !== "admin" && user.role !== "manager") {
    res.status(403).json({ error: "Only admins and managers can update payroll records" });
    return;
  }

  const params = UpdatePayrollRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePayrollRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (parsed.data.bonus !== undefined) updateData.bonus = parsed.data.bonus.toString();
  if (parsed.data.deductions !== undefined) updateData.deductions = parsed.data.deductions.toString();
  if (parsed.data.netPay !== undefined) updateData.netPay = parsed.data.netPay.toString();
  if (parsed.data.paidAt !== undefined) updateData.paidAt = new Date(parsed.data.paidAt);

  const [record] = await db
    .update(payrollTable)
    .set(updateData)
    .where(eq(payrollTable.id, params.data.id))
    .returning();

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.json(
    UpdatePayrollRecordResponse.parse({
      ...record,
      baseSalary: parseFloat(record.baseSalary),
      bonus: parseFloat(record.bonus),
      deductions: parseFloat(record.deductions),
      netPay: parseFloat(record.netPay),
      paidAt: record.paidAt?.toISOString(),
      createdAt: record.createdAt?.toISOString(),
    })
  );
});

export default router;
