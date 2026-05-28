import { Router, type IRouter } from "express";
import { db, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListEventsResponse,
  CreateEventBody,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  DeleteEventParams,
  DeleteEventResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const events = await db.select().from(eventsTable);

  res.json(
    ListEventsResponse.parse(
      events.map((e) => ({
        ...e,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        createdAt: e.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .insert(eventsTable)
    .values({
      ...parsed.data,
      organizerId: req.session.userId!,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    })
    .returning();

  res.status(201).json(
    UpdateEventResponse.parse({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      createdAt: event.createdAt?.toISOString(),
    })
  );
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);

  const [event] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(
    UpdateEventResponse.parse({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      createdAt: event.createdAt?.toISOString(),
    })
  );
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(DeleteEventResponse.parse({ success: true }));
});

export default router;
