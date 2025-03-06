import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Video } from "../entity/Videos";

const videoRepository = AppDataSource.getRepository(Video);

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

export const addVideo = async (req: Request, res: Response) => {
  try {
    const { title, youtubeUrl } = req.body;

    const video = videoRepository.create({
      title,
      youtubeUrl,
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
    const { title, youtubeUrl, isActive, sortOrder } = req.body;

    const video = await videoRepository.findOne({ where: { video_id: id } });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.title = title;
    video.youtubeUrl = youtubeUrl;

    // Only update these if they're provided
    if (typeof isActive === "boolean") video.isActive = isActive;
    if (typeof sortOrder === "number") video.sortOrder = sortOrder;

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
      order: { sortOrder: "ASC" }, // Add order condition
    });

    if (!activeVideo) {
      // If no active video, get the first one by sort order
      const firstVideo = await videoRepository.findOne({
        where: {}, // Add empty where clause
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
      // Modified this part to include a where clause
      const firstVideo = await videoRepository.findOne({
        where: {}, // Empty where clause to match all records
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

// Helper endpoint to update video order
export const updateVideoOrder = async (req: Request, res: Response) => {
  try {
    const { videos } = req.body; // Expect array of { video_id, sortOrder }

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

    await videoRepository.remove(video);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Error deleting video" });
  }
};
