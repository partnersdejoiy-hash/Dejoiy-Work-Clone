import { Router, type IRouter } from "express";
import { db, jobPostingsTable, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListJobPostingsResponse,
  CreateJobPostingBody,
  UpdateJobPostingParams,
  UpdateJobPostingBody,
  UpdateJobPostingResponse,
  ListApplicationsParams,
  ListApplicationsResponse,
  CreateApplicationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/job-postings", async (req, res): Promise<void> => {
  const jobs = await db.select().from(jobPostingsTable);

  res.json(
    ListJobPostingsResponse.parse(
      jobs.map((j) => ({
        ...j,
        createdAt: j.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/job-postings", async (req, res): Promise<void> => {
  const parsed = CreateJobPostingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .insert(jobPostingsTable)
    .values({
      ...parsed.data,
      postedById: req.session.userId!,
    })
    .returning();

  res.status(201).json(
    UpdateJobPostingResponse.parse({
      ...job,
      createdAt: job.createdAt?.toISOString(),
    })
  );
});

router.patch("/job-postings/:id", async (req, res): Promise<void> => {
  const params = UpdateJobPostingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobPostingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobPostingsTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(jobPostingsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(
    UpdateJobPostingResponse.parse({
      ...job,
      createdAt: job.createdAt?.toISOString(),
    })
  );
});

router.get("/job-postings/:id/applications", async (req, res): Promise<void> => {
  const params = ListApplicationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const applications = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.jobPostingId, params.data.id));

  res.json(
    ListApplicationsResponse.parse(
      applications.map((a) => ({
        ...a,
        appliedAt: a.appliedAt?.toISOString(),
      }))
    )
  );
});

router.post("/job-postings/:id/applications", async (req, res): Promise<void> => {
  const params = ListApplicationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({
      ...parsed.data,
      jobPostingId: params.data.id,
    })
    .returning();

  res.status(201).json(
    {
      ...application,
      appliedAt: application.appliedAt?.toISOString(),
    }
  );
});

export default router;
