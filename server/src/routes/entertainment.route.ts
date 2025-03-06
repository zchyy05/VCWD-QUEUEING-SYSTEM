import { Router } from "express";
import { verifyToken } from "../middlewares/verifyUser";
import {
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  getActiveVideo,
  setActiveVideo,
  getNextVideo,
  updateVideoOrder,
} from "../controllers/entertainment.controller";
const router = Router();

router.get("/videos", getVideos);
router.post("/videos/add", verifyToken, addVideo);
router.put("/videos/:id", verifyToken, updateVideo);
router.delete("/videos/:id", verifyToken, deleteVideo);

router.get("/videos/:id/next", getNextVideo);
router.put("/videos/:id/activate", setActiveVideo);
router.put("/videos/order", updateVideoOrder);
router.get("/videos/active", getActiveVideo);
export default router;
