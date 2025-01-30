import { Router } from "express";
import { createDepartment } from "../controllers/department.controller";
const router = Router();

router.post("/create-department", createDepartment);

export default router;
