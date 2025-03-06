import { Router } from "express";
import { verifyToken } from "../middlewares/verifyUser";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/admin.controller";

const router = Router();

router.get("/users", verifyToken, getUsers);
router.post("/create-user", verifyToken, createUser);
router.put("/update-user/:id", verifyToken, updateUser);
router.delete("/delete-user/:id", verifyToken, deleteUser);
router.get("/user/:id", verifyToken, getUserById);

export default router;
