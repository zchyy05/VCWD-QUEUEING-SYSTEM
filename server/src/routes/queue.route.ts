import { Router } from "express";
import {
  createQueue,
  getAllQueues,
  getQueue,
  getDivisionQueues,
  nextQueue,
  endTransaction,
  deleteQueue,
  skipQueue,
  callSkippedQueue,
  getCurrentTransaction,
  getAllInProgressTransactions,
  getAllWaitingQueues,
} from "../controllers/queue.controller";

import { verifyToken } from "../middlewares/verifyUser";
const router = Router();

router.post("/", createQueue);
router.get("/getQueue", verifyToken, getQueue);
router.get("/getAllQueue", getAllQueues);
router.get("/getDivisionQueues/:division_id", verifyToken, getDivisionQueues);
router.post("/next/:division_id", verifyToken, nextQueue);
router.post("/end-transaction", verifyToken, endTransaction);
router.post("/skipQueue", verifyToken, skipQueue);
router.delete("/deleteQueue", verifyToken, deleteQueue);
router.post("/call-skipped", verifyToken, callSkippedQueue);
router.get(
  "/current-transaction/:division_id",
  verifyToken,
  getCurrentTransaction
);

router.get("/in-progress", getAllInProgressTransactions);
router.get("/waiting", getAllWaitingQueues);
export default router;
