import { Router } from "express";
import { sign_up, sign_in } from "../controllers/auth.controller";
const router = Router();

router.post("/sign-up", sign_up);
router.post("/sign-in", sign_in);
export default router;
