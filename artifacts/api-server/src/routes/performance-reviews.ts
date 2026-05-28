import { Router, type IRouter } from "express";
import { db, performanceReviewsTable, usersTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import {
  ListPerformanceReviewsResponse,
  CreatePerformanceReviewBody,
  UpdatePerformanceReviewParams,
  UpdatePerformanceReviewBody,
  UpdatePerformanceReviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/performance-reviews", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  let conditions = [];
  if (user.role !== "admin" && user.role !== "manager") {
    conditions.push(eq(performanceReviewsTable.employeeId, req.session.userId!));
  }

  const reviews = await db
    .select()
    .from(performanceReviewsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(
    ListPerformanceReviewsResponse.parse(
      reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/performance-reviews", async (req, res): Promise<void> => {
  const user = (await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId!)
  }))!;

  if (user.role !== "admin" && user.role !== "manager") {
    res.status(403).json({ error: "Only admins and managers can create reviews" });
    return;
  }

  const parsed = CreatePerformanceReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .insert(performanceReviewsTable)
    .values({
      ...parsed.data,
      reviewerId: req.session.userId!,
    })
    .returning();

  res.status(201).json(
    UpdatePerformanceReviewResponse.parse({
      ...review,
      createdAt: review.createdAt?.toISOString(),
    })
  );
});

router.patch("/performance-reviews/:id", async (req, res): Promise<void> => {
  const params = UpdatePerformanceReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePerformanceReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .update(performanceReviewsTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(performanceReviewsTable.id, params.data.id))
    .returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  res.json(
    UpdatePerformanceReviewResponse.parse({
      ...review,
      createdAt: review.createdAt?.toISOString(),
    })
  );
});

export default router;
