import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  getCustomerQueueHistory,
  searchCustomers,
} from "../controllers/customer.controller";
import { verifyToken } from "../middlewares/verifyUser";
const router = Router();

router.get("/customers", verifyToken, getCustomers);

router.get("/customers/:id", verifyToken, getCustomerById); // Parameterized routes after
router.get(
  "/customers/:id/queue-history",
  verifyToken,
  getCustomerQueueHistory
);
router.post("/customers/search", verifyToken, searchCustomers);

export default router;
