import { Router } from "express";
import { createDivision } from "../controllers/division.controller";
const router = Router();

router.post("/create-division", createDivision);

export default router;
