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
  streamVideo,
} from "../controllers/entertainment.controller";
import { upload } from "../config/multer";

const router = Router();

// Video routes with file upload
router.get("/videos", getVideos);
router.post("/videos/add", verifyToken, upload.single("video"), addVideo);
router.put("/videos/:id", verifyToken, upload.single("video"), updateVideo);
router.delete("/videos/:id", verifyToken, deleteVideo);

router.get("/videos/stream/:filename", streamVideo);
router.get("/videos/:id/next", getNextVideo);
router.put("/videos/:id/activate", setActiveVideo);
router.put("/videos/order", updateVideoOrder);
router.get("/videos/active", getActiveVideo);

export default router;
