import { Router } from "express";
import {
  createTerminals,
  getTerminals,
  occupyterminal,
  releaseTerminal,
  getAllTerminals,
  deleteTerminal,
  updateTerminal,
} from "../controllers/terminal.controller";
import { verifyToken } from "../middlewares/verifyUser";

const router = Router();

//user
router.get("/getTerminals", verifyToken, getTerminals);
router.post("/occupyTerminal", verifyToken, occupyterminal);
router.post("/releaseTerminal", verifyToken, releaseTerminal);

//admin
router.post("/create", verifyToken, createTerminals);
router.get("/terminals", verifyToken, getAllTerminals);
router.put("/updateTerminal/:terminal_id", verifyToken, updateTerminal);
router.delete("/deleteTerminal/:terminal_id", verifyToken, deleteTerminal);

export default router;
