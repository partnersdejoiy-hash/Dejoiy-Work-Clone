import { Router, type IRouter } from "express";
import { db, announcementsTable } from "@workspace/db";
import {
  ListAnnouncementsResponse,
  CreateAnnouncementBody,
  ListAnnouncementsResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = await db.select().from(announcementsTable).orderBy(announcementsTable.createdAt);
  res.json(
    ListAnnouncementsResponse.parse(
      announcements.map((a) => ({
        ...a,
        createdAt: a.createdAt?.toISOString(),
      })),
    ),
  );
});

router.post("/announcements", async (req, res): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [announcement] = await db
    .insert(announcementsTable)
    .values({
      ...parsed.data,
      authorId: req.session.userId!,
    })
    .returning();

  res.status(201).json(
    ListAnnouncementsResponseItem.parse({
      ...announcement,
      createdAt: announcement.createdAt?.toISOString(),
    }),
  );
});

export default router;
