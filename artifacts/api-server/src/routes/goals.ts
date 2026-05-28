import { Router, type IRouter } from "express";
import { db, goalsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import {
  ListGoalsResponse,
  CreateGoalBody,
  UpdateGoalParams,
  UpdateGoalBody,
  UpdateGoalResponse,
  DeleteGoalParams,
  DeleteGoalResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/goals", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  let conditions = [];
  if (user.role !== "admin" && user.role !== "manager") {
    conditions.push(eq(goalsTable.employeeId, req.session.userId!));
  }

  const goals = await db
    .select()
    .from(goalsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(
    ListGoalsResponse.parse(
      goals.map((g) => ({
        ...g,
        dueDate: g.dueDate?.toISOString(),
        createdAt: g.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/goals", async (req, res): Promise<void> => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [goal] = await db
    .insert(goalsTable)
    .values({
      ...parsed.data,
      employeeId: req.session.userId!,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    })
    .returning();

  res.status(201).json(
    UpdateGoalResponse.parse({
      ...goal,
      dueDate: goal.dueDate?.toISOString(),
      createdAt: goal.createdAt?.toISOString(),
    })
  );
});

router.patch("/goals/:id", async (req, res): Promise<void> => {
  const params = UpdateGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [goal] = await db
    .update(goalsTable)
    .set({
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(goalsTable.id, params.data.id))
    .returning();

  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  res.json(
    UpdateGoalResponse.parse({
      ...goal,
      dueDate: goal.dueDate?.toISOString(),
      createdAt: goal.createdAt?.toISOString(),
    })
  );
});

router.delete("/goals/:id", async (req, res): Promise<void> => {
  const params = DeleteGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [goal] = await db
    .delete(goalsTable)
    .where(eq(goalsTable.id, params.data.id))
    .returning();

  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  res.json(DeleteGoalResponse.parse({ success: true }));
});

export default router;
