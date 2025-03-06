import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Video } from "../entity/Videos";
import * as fs from "fs";
import * as path from "path";
import { getVideoUrl } from "../config/multer";

const videoRepository = AppDataSource.getRepository(Video);
const uploadDir = path.join(__dirname, "../uploads");

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await videoRepository.find({
      order: {
        createdAt: "DESC",
      },
    });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Error fetching videos" });
  }
};

export const streamVideo = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, "../uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(`File not found: ${filepath}`);
      return res.status(404).json({ message: "Video not found" });
    }

    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests (important for video streaming)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filepath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    } else {
      // Handle non-range requests
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      fs.createReadStream(filepath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({ message: "Error streaming video" });
  }
};

export const addVideo = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const video = videoRepository.create({
      title,
      filename: file.filename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      videoUrl: getVideoUrl(req, file.filename),
      isActive: false,
      sortOrder: 0,
    });

    const savedVideo = await videoRepository.save(video);

    const videoCount = await videoRepository.count();
    savedVideo.sortOrder = videoCount;
    await videoRepository.save(savedVideo);

    res.json(savedVideo);
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ message: "Error adding video" });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, isActive, sortOrder } = req.body;
    const file = req.file;

    const video = await videoRepository.findOne({ where: { video_id: id } });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update basic properties
    if (title) video.title = title;
    if (typeof isActive === "boolean") video.isActive = isActive;
    if (typeof sortOrder === "number") video.sortOrder = sortOrder;

    // If new file is uploaded, update file-related properties and delete old file
    if (file) {
      // Delete old file if it exists
      if (video.filename) {
        const oldFilePath = path.join(uploadDir, video.filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update with new file info
      video.filename = file.filename;
      video.originalFilename = file.originalname;
      video.mimeType = file.mimetype;
      video.fileSize = file.size;
      video.videoUrl = getVideoUrl(req, file.filename);
    }

    await videoRepository.save(video);
    res.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ message: "Error updating video" });
  }
};

export const getActiveVideo = async (req: Request, res: Response) => {
  try {
    const activeVideo = await videoRepository.findOne({
      where: { isActive: true },
      order: { sortOrder: "ASC" },
    });

    if (!activeVideo) {
      // If no active video, get the first one by sort order
      const firstVideo = await videoRepository.findOne({
        where: {},
        order: { sortOrder: "ASC" },
      });

      if (firstVideo) {
        firstVideo.isActive = true;
        await videoRepository.save(firstVideo);
        return res.json(firstVideo);
      }

      return res.status(404).json({ message: "No videos available" });
    }

    res.json(activeVideo);
  } catch (error) {
    console.error("Error fetching active video:", error);
    res.status(500).json({ message: "Error fetching active video" });
  }
};

export const setActiveVideo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await videoRepository.update({}, { isActive: false });

    const video = await videoRepository.findOne({ where: { video_id: id } });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.isActive = true;
    await videoRepository.save(video);

    res.json(video);
  } catch (error) {
    console.error("Error setting active video:", error);
    res.status(500).json({ message: "Error setting active video" });
  }
};

export const getNextVideo = async (req: Request, res: Response) => {
  try {
    const currentId = req.params.id;

    const currentVideo = await videoRepository.findOne({
      where: { video_id: currentId },
    });

    if (!currentVideo) {
      return res.status(404).json({ message: "Current video not found" });
    }

    const nextVideo = await videoRepository
      .createQueryBuilder("video")
      .where("video.sortOrder > :currentOrder", {
        currentOrder: currentVideo.sortOrder,
      })
      .orderBy("video.sortOrder", "ASC")
      .getOne();

    if (!nextVideo) {
      // If no next video, get the first one (loop back)
      const firstVideo = await videoRepository.findOne({
        where: {},
        order: { sortOrder: "ASC" },
      });

      if (!firstVideo) {
        return res.status(404).json({ message: "No videos available" });
      }

      return res.json(firstVideo);
    }

    res.json(nextVideo);
  } catch (error) {
    console.error("Error fetching next video:", error);
    res.status(500).json({ message: "Error fetching next video" });
  }
};

export const updateVideoOrder = async (req: Request, res: Response) => {
  try {
    const { videos } = req.body;

    for (const item of videos) {
      await videoRepository.update(item.video_id, {
        sortOrder: item.sortOrder,
      });
    }

    const updatedVideos = await videoRepository.find({
      order: { sortOrder: "ASC" },
    });

    res.json(updatedVideos);
  } catch (error) {
    console.error("Error updating video order:", error);
    res.status(500).json({ message: "Error updating video order" });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const video = await videoRepository.findOne({ where: { video_id: id } });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete file from filesystem if it exists
    if (video.filename) {
      const filePath = path.join(uploadDir, video.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await videoRepository.remove(video);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Error deleting video" });
  }
};
