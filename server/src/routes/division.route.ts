import { Router } from "express";
import {
  createDivision,
  getDivision,
  getDivisions,
  updateDivision,
  deleteDivision,
} from "../controllers/division.controller";

import { verifyToken } from "../middlewares/verifyUser";

const router = Router();
//public
router.get("/get-division", getDivision);

router.post("/create-division", verifyToken, createDivision);
router.get("/get-divisions", verifyToken, getDivisions);
router.put("/update-division/:id", verifyToken, updateDivision);
router.delete("/delete-division/:id", verifyToken, deleteDivision);

export default router;
