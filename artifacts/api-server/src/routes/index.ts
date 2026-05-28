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
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);

// Protected routes
router.use(requireAuth);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(tasksRouter);
router.use(notificationsRouter);
router.use(leaveRequestsRouter);
router.use(expensesRouter);
router.use(itTicketsRouter);
router.use(announcementsRouter);

export default router;
