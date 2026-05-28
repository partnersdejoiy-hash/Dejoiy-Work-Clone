import { Router, type IRouter } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  UpdateApplicationParams,
  UpdateApplicationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [application] = await db
    .update(applicationsTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(
    {
      ...application,
      appliedAt: application.appliedAt?.toISOString(),
    }
  );
});

export default router;
