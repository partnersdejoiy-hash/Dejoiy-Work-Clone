import { Router, type IRouter } from "express";
import { db, leaveRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListLeaveRequestsResponse,
  CreateLeaveRequestBody,
  UpdateLeaveRequestParams,
  UpdateLeaveRequestBody,
  UpdateLeaveRequestResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leave-requests", async (req, res): Promise<void> => {
  const requests = await db.select().from(leaveRequestsTable);
  res.json(
    ListLeaveRequestsResponse.parse(
      requests.map((r) => ({
        ...r,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        createdAt: r.createdAt?.toISOString(),
      })),
    ),
  );
});

router.post("/leave-requests", async (req, res): Promise<void> => {
  const parsed = CreateLeaveRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [request] = await db
    .insert(leaveRequestsTable)
    .values({
      ...parsed.data,
      employeeId: req.session.userId!,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      status: "pending",
    })
    .returning();

  res.status(201).json(
    UpdateLeaveRequestResponse.parse({
      ...request,
      startDate: request.startDate.toISOString(),
      endDate: request.endDate.toISOString(),
      createdAt: request.createdAt?.toISOString(),
    }),
  );
});

router.patch("/leave-requests/:id", async (req, res): Promise<void> => {
  const params = UpdateLeaveRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLeaveRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [request] = await db
    .update(leaveRequestsTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(leaveRequestsTable.id, params.data.id))
    .returning();

  if (!request) {
    res.status(404).json({ error: "Leave request not found" });
    return;
  }

  res.json(
    UpdateLeaveRequestResponse.parse({
      ...request,
      startDate: request.startDate.toISOString(),
      endDate: request.endDate.toISOString(),
      createdAt: request.createdAt?.toISOString(),
    }),
  );
});

export default router;
