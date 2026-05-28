import { Router, type IRouter } from "express";
import { db, timesheetsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListTimesheetsResponse,
  CreateTimesheetBody,
  UpdateTimesheetParams,
  UpdateTimesheetBody,
  UpdateTimesheetResponse,
  DeleteTimesheetParams,
  DeleteTimesheetResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/timesheets", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  let conditions = [];
  if (user.role !== "admin" && user.role !== "manager") {
    conditions.push(eq(timesheetsTable.employeeId, req.session.userId!));
  }

  const entries = await db
    .select()
    .from(timesheetsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(
    ListTimesheetsResponse.parse(
      entries.map((e) => ({
        ...e,
        hoursWorked: parseFloat(e.hoursWorked),
        date: e.date.toISOString(),
        createdAt: e.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/timesheets", async (req, res): Promise<void> => {
  const parsed = CreateTimesheetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .insert(timesheetsTable)
    .values({
      ...parsed.data,
      employeeId: req.session.userId!,
      date: new Date(parsed.data.date),
      hoursWorked: parsed.data.hoursWorked.toString(),
    })
    .returning();

  res.status(201).json(
    UpdateTimesheetResponse.parse({
      ...entry,
      hoursWorked: parseFloat(entry.hoursWorked),
      date: entry.date.toISOString(),
      createdAt: entry.createdAt?.toISOString(),
    })
  );
});

router.patch("/timesheets/:id", async (req, res): Promise<void> => {
  const params = UpdateTimesheetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTimesheetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (parsed.data.hoursWorked !== undefined) updateData.hoursWorked = parsed.data.hoursWorked.toString();

  const [entry] = await db
    .update(timesheetsTable)
    .set(updateData)
    .where(eq(timesheetsTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Timesheet entry not found" });
    return;
  }

  res.json(
    UpdateTimesheetResponse.parse({
      ...entry,
      hoursWorked: parseFloat(entry.hoursWorked),
      date: entry.date.toISOString(),
      createdAt: entry.createdAt?.toISOString(),
    })
  );
});

router.delete("/timesheets/:id", async (req, res): Promise<void> => {
  const params = DeleteTimesheetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
    .delete(timesheetsTable)
    .where(eq(timesheetsTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Timesheet entry not found" });
    return;
  }

  res.json(DeleteTimesheetResponse.parse({ success: true }));
});

export default router;
