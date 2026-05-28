import { Router, type IRouter } from "express";
import { db, itTicketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListItTicketsResponse,
  CreateItTicketBody,
  UpdateItTicketParams,
  UpdateItTicketBody,
  UpdateItTicketResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/it-tickets", async (_req, res): Promise<void> => {
  const tickets = await db.select().from(itTicketsTable);
  res.json(
    ListItTicketsResponse.parse(
      tickets.map((t) => ({
        ...t,
        resolvedAt: t.resolvedAt?.toISOString(),
        createdAt: t.createdAt?.toISOString(),
      })),
    ),
  );
});

router.post("/it-tickets", async (req, res): Promise<void> => {
  const parsed = CreateItTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .insert(itTicketsTable)
    .values({
      ...parsed.data,
      submitterId: req.session.userId!,
      status: "open",
    })
    .returning();

  res.status(201).json(
    UpdateItTicketResponse.parse({
      ...ticket,
      resolvedAt: ticket.resolvedAt?.toISOString(),
      createdAt: ticket.createdAt?.toISOString(),
    }),
  );
});

router.patch("/it-tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateItTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateItTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db
    .update(itTicketsTable)
    .set({
      ...parsed.data,
      resolvedAt: parsed.data.status === "resolved" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(itTicketsTable.id, params.data.id))
    .returning();

  if (!ticket) {
    res.status(404).json({ error: "IT ticket not found" });
    return;
  }

  res.json(
    UpdateItTicketResponse.parse({
      ...ticket,
      resolvedAt: ticket.resolvedAt?.toISOString(),
      createdAt: ticket.createdAt?.toISOString(),
    }),
  );
});

export default router;
