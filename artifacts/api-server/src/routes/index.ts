import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import tasksRouter from "./tasks";
import notificationsRouter from "./notifications";
import leaveRequestsRouter from "./leave-requests";
import expensesRouter from "./expenses";
import itTicketsRouter from "./it-tickets";
import announcementsRouter from "./announcements";
import analyticsRouter from "./analytics";
import goalsRouter from "./goals";
import performanceReviewsRouter from "./performance-reviews";
import payrollRouter from "./payroll";
import jobPostingsRouter from "./job-postings";
import applicationsRouter from "./applications";
import timesheetsRouter from "./timesheets";
import eventsRouter from "./events";
import assetsRouter from "./assets";
import approvalsRouter from "./approvals";
import auditRouter from "./audit";
import { requireAuth } from "../middlewares/auth";
import { loadUserContext } from "../middlewares/rbac";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);

// Protected routes — load RBAC context after auth
router.use(requireAuth);
router.use(loadUserContext);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(tasksRouter);
router.use(notificationsRouter);
router.use(leaveRequestsRouter);
router.use(expensesRouter);
router.use(itTicketsRouter);
router.use(announcementsRouter);
router.use(analyticsRouter);
router.use(goalsRouter);
router.use(performanceReviewsRouter);
router.use(payrollRouter);
router.use(jobPostingsRouter);
router.use(applicationsRouter);
router.use(timesheetsRouter);
router.use(eventsRouter);
router.use(assetsRouter);
router.use(approvalsRouter);
router.use(auditRouter);

export default router;
