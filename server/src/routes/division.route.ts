import { Router } from "express";
import {
  createDivision,
  getDivision,
} from "../controllers/division.controller";
const router = Router();

router.post("/create-division", createDivision);
router.get("/get-division", getDivision);
export default router;
