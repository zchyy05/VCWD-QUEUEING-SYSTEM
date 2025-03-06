import { Router } from "express";
import { getCurrentUser, updateUser } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyUser";

const router = Router();

router.get("/me", verifyToken, getCurrentUser);
router.put("/update", verifyToken, updateUser);

export default router;
