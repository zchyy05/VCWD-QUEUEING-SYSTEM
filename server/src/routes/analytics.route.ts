import { Router } from "express";
import {
  getUserAverageTime,
  getServiceTrends,
  getAnalyticsOverview,
  getUserPerformanceStats,
  getPeakHoursAnalysis,
  getWaitTimeAnalytics,
  getDivisionQueueStats,
} from "../controllers/analytics.controller";
import { verifyToken } from "../middlewares/verifyUser";
const router = Router();

router.get("/user-average-time/:userId", verifyToken, getUserAverageTime);
router.get("/service-trends", verifyToken, getServiceTrends);
router.get("/overview", verifyToken, getAnalyticsOverview);
router.get("/user-performance/:userId", verifyToken, getUserPerformanceStats);
router.get("/peak-hours", verifyToken, getPeakHoursAnalysis);
router.get("/wait-time", verifyToken, getWaitTimeAnalytics);
router.get("/division-queue-stats", verifyToken, getDivisionQueueStats);
export default router;
