import { Router, type IRouter } from "express";
import { db, approvalRequestsTable, approvalStepsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { auditFromReq } from "../lib/audit";

const router: IRouter = Router();

// List approval requests (filtered by role)
router.get("/approvals", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const userRoles = req.session.userRoles || [];
  const status = req.query.status as string | undefined;

  let query = db
    .select({
      id: approvalRequestsTable.id,
      entityType: approvalRequestsTable.entityType,
      entityId: approvalRequestsTable.entityId,
      requesterId: approvalRequestsTable.requesterId,
      status: approvalRequestsTable.status,
      currentStep: approvalRequestsTable.currentStep,
      totalSteps: approvalRequestsTable.totalSteps,
      title: approvalRequestsTable.title,
      summary: approvalRequestsTable.summary,
      amount: approvalRequestsTable.amount,
      priority: approvalRequestsTable.priority,
      submittedAt: approvalRequestsTable.submittedAt,
      resolvedAt: approvalRequestsTable.resolvedAt,
      createdAt: approvalRequestsTable.createdAt,
      // Join requester info
      requesterName: usersTable.name,
      requesterEmail: usersTable.email,
    })
    .from(approvalRequestsTable)
    .leftJoin(usersTable, eq(approvalRequestsTable.requesterId, usersTable.id))
    .orderBy(desc(approvalRequestsTable.createdAt));

  // Admins and HR see all; managers see their team's; employees see their own
  if (userRoles.includes("admin") || userRoles.includes("hr_admin") || userRoles.includes("hr")) {
    // See all
  } else if (userRoles.includes("manager")) {
    // Managers see requests where they are an approver
    const managerApprovals = await db
      .select({ requestId: approvalStepsTable.requestId })
      .from(approvalStepsTable)
      .where(and(
        eq(approvalStepsTable.approverId, userId),
        eq(approvalStepsTable.status, "pending")
      ));
    const requestIds = managerApprovals.map(a => a.requestId);
    if (requestIds.length === 0) {
      // If no pending approvals, just show their own
      query = query.where(eq(approvalRequestsTable.requesterId, userId)) as any;
    }
  } else {
    // Employees see only their own requests
    query = query.where(eq(approvalRequestsTable.requesterId, userId)) as any;
  }

  if (status) {
    query = query.where(eq(approvalRequestsTable.status, status)) as any;
  }

  const requests = await query;
  res.json(requests);
});

// Get single approval request with steps
router.get("/approvals/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [request] = await db
    .select()
    .from(approvalRequestsTable)
    .where(eq(approvalRequestsTable.id, id));

  if (!request) {
    res.status(404).json({ error: "Approval request not found" });
    return;
  }

  const steps = await db
    .select({
      id: approvalStepsTable.id,
      stepNumber: approvalStepsTable.stepNumber,
      stepName: approvalStepsTable.stepName,
      approverId: approvalStepsTable.approverId,
      approverRole: approvalStepsTable.approverRole,
      status: approvalStepsTable.status,
      action: approvalStepsTable.action,
      comment: approvalStepsTable.comment,
      decidedAt: approvalStepsTable.decidedAt,
      createdAt: approvalStepsTable.createdAt,
      approverName: usersTable.name,
    })
    .from(approvalStepsTable)
    .leftJoin(usersTable, eq(approvalStepsTable.approverId, usersTable.id))
    .where(eq(approvalStepsTable.requestId, id))
    .orderBy(approvalStepsTable.stepNumber);

  // Get requester info
  const [requester] = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, avatarUrl: usersTable.avatarUrl })
    .from(usersTable)
    .where(eq(usersTable.id, request.requesterId));

  res.json({ ...request, steps, requester });
});

// Create a new approval request
router.post("/approvals", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { entityType, entityId, title, summary, amount, priority } = req.body;

  if (!entityType || !title) {
    res.status(400).json({ error: "entityType and title are required" });
    return;
  }

  const [request] = await db
    .insert(approvalRequestsTable)
    .values({
      entityType,
      entityId: entityId || 0,
      requesterId: userId,
      title,
      summary: summary || null,
      amount: amount ? String(amount) : null,
      priority: priority || "normal",
      status: "pending",
      currentStep: 1,
      totalSteps: 1,
    })
    .returning();

  // Auto-create a manager approval step
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (user) {
    // Find the user's manager (simplified: use admin as approver for now)
    const [admin] = await db.select().from(usersTable).where(eq(usersTable.role, "admin")).limit(1);
    if (admin) {
      await db.insert(approvalStepsTable).values({
        requestId: request.id,
        stepNumber: 1,
        stepName: "Manager Approval",
        approverId: admin.id,
        status: "pending",
      });
    }
  }

  await auditFromReq(req, {
    action: "create",
    entityType: "approval",
    entityId: request.id,
    entityName: title,
  });

  res.status(201).json(request);
});

// Approve a step
router.post("/approvals/:id/approve", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.session.userId!;
  const { comment } = req.body || {};

  const [request] = await db
    .select()
    .from(approvalRequestsTable)
    .where(eq(approvalRequestsTable.id, id));

  if (!request) {
    res.status(404).json({ error: "Approval request not found" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: "This request is no longer pending" });
    return;
  }

  // Find the current pending step for this user
  const [currentStep] = await db
    .select()
    .from(approvalStepsTable)
    .where(and(
      eq(approvalStepsTable.requestId, id),
      eq(approvalStepsTable.stepNumber, request.currentStep),
      eq(approvalStepsTable.status, "pending")
    ));

  if (!currentStep) {
    res.status(400).json({ error: "No pending step found for this approval" });
    return;
  }

  // Check the user is the approver (or admin)
  const userRoles = req.session.userRoles || [];
  const isAdmin = userRoles.includes("admin") || userRoles.includes("hr_admin");
  if (!isAdmin && currentStep.approverId !== userId) {
    res.status(403).json({ error: "You are not authorized to approve this step" });
    return;
  }

  // Mark step as approved
  await db
    .update(approvalStepsTable)
    .set({
      status: "approved",
      action: "approve",
      comment: comment || null,
      decidedAt: new Date(),
    })
    .where(eq(approvalStepsTable.id, currentStep.id));

  // Check if there are more steps
  const nextStepNumber = request.currentStep + 1;
  const [nextStep] = await db
    .select()
    .from(approvalStepsTable)
    .where(and(
      eq(approvalStepsTable.requestId, id),
      eq(approvalStepsTable.stepNumber, nextStepNumber)
    ));

  if (nextStep) {
    // Move to next step
    await db
      .update(approvalRequestsTable)
      .set({ currentStep: nextStepNumber, updatedAt: new Date() })
      .where(eq(approvalRequestsTable.id, id));
  } else {
    // All steps approved — mark request as approved
    await db
      .update(approvalRequestsTable)
      .set({
        status: "approved",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequestsTable.id, id));
  }

  // Audit
  await auditFromReq(req, {
    action: "approve",
    entityType: "approval",
    entityId: id,
    entityName: request.title,
    newValue: { stepApproved: currentStep.stepNumber, comment },
  });

  res.json({ success: true, status: nextStep ? "pending" : "approved" });
});

// Reject a step
router.post("/approvals/:id/reject", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.session.userId!;
  const { comment } = req.body || {};

  const [request] = await db
    .select()
    .from(approvalRequestsTable)
    .where(eq(approvalRequestsTable.id, id));

  if (!request) {
    res.status(404).json({ error: "Approval request not found" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: "This request is no longer pending" });
    return;
  }

  const [currentStep] = await db
    .select()
    .from(approvalStepsTable)
    .where(and(
      eq(approvalStepsTable.requestId, id),
      eq(approvalStepsTable.stepNumber, request.currentStep),
      eq(approvalStepsTable.status, "pending")
    ));

  if (!currentStep) {
    res.status(400).json({ error: "No pending step found" });
    return;
  }

  const userRoles = req.session.userRoles || [];
  const isAdmin = userRoles.includes("admin") || userRoles.includes("hr_admin");
  if (!isAdmin && currentStep.approverId !== userId) {
    res.status(403).json({ error: "You are not authorized to reject this step" });
    return;
  }

  // Mark step as rejected
  await db
    .update(approvalStepsTable)
    .set({
      status: "rejected",
      action: "reject",
      comment: comment || null,
      decidedAt: new Date(),
    })
    .where(eq(approvalStepsTable.id, currentStep.id));

  // Mark entire request as rejected
  await db
    .update(approvalRequestsTable)
    .set({
      status: "rejected",
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvalRequestsTable.id, id));

  await auditFromReq(req, {
    action: "reject",
    entityType: "approval",
    entityId: id,
    entityName: request.title,
    newValue: { stepRejected: currentStep.stepNumber, comment },
  });

  res.json({ success: true, status: "rejected" });
});

// Cancel a request (by requester)
router.post("/approvals/:id/cancel", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.session.userId!;

  const [request] = await db
    .select()
    .from(approvalRequestsTable)
    .where(eq(approvalRequestsTable.id, id));

  if (!request) {
    res.status(404).json({ error: "Approval request not found" });
    return;
  }

  if (request.requesterId !== userId) {
    res.status(403).json({ error: "Only the requester can cancel" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: "Can only cancel pending requests" });
    return;
  }

  await db
    .update(approvalRequestsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(approvalRequestsTable.id, id));

  await auditFromReq(req, {
    action: "cancel",
    entityType: "approval",
    entityId: id,
    entityName: request.title,
  });

  res.json({ success: true });
});

export default router;
