import { Router } from "express";
import { sign_up, sign_in, me } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyUser";
const router = Router();

router.post("/sign-up", sign_up);
router.post("/sign-in", sign_in);
router.get("/me", verifyToken, me);
export default router;
