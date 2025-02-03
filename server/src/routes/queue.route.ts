import { Router } from "express";
import { createQueue } from "../controllers/queue.controller";
const router = Router();

router.post("/", createQueue);

export default router;
