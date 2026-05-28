import { Router, type IRouter } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListExpensesResponse,
  CreateExpenseBody,
  UpdateExpenseParams,
  UpdateExpenseBody,
  UpdateExpenseResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/expenses", async (_req, res): Promise<void> => {
  const expenses = await db.select().from(expensesTable);
  res.json(
    ListExpensesResponse.parse(
      expenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
        expenseDate: e.expenseDate.toISOString(),
        createdAt: e.createdAt?.toISOString(),
      })),
    ),
  );
});

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expense] = await db
    .insert(expensesTable)
    .values({
      ...parsed.data,
      employeeId: req.session.userId!,
      amount: parsed.data.amount.toString(),
      expenseDate: new Date(parsed.data.expenseDate),
      status: "pending",
    })
    .returning();

  res.status(201).json(
    UpdateExpenseResponse.parse({
      ...expense,
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt?.toISOString(),
    }),
  );
});

router.patch("/expenses/:id", async (req, res): Promise<void> => {
  const params = UpdateExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expense] = await db
    .update(expensesTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(
    UpdateExpenseResponse.parse({
      ...expense,
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt?.toISOString(),
    }),
  );
});

export default router;
