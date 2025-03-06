import { Router } from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} from "../controllers/department.controller";
import { verifyToken } from "../middlewares/verifyUser";
const router = Router();

router.post("/create-department", verifyToken, createDepartment);
router.get("/departments", verifyToken, getAllDepartments);
router.put("/update-departments/:id", verifyToken, updateDepartment);
router.delete("/delete-departments/:id", verifyToken, deleteDepartment);
router.get("/department-stats", verifyToken, getDepartmentStats);
export default router;
