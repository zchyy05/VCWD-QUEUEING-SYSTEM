import { Router } from "express";
import { sign_up } from "../controllers/auth.controller";
const router = Router();

router.post("/sign-up", sign_up);

export default router;
