import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const useVideos = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.data?.code === "TOKEN_EXPIRED") {
        Cookies.remove("token");
        localStorage.clear();
        window.location.href = "/login?expired=true";
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        if (error.response.data?.code === "INVALID_TOKEN") {
          Cookies.remove("token");
          localStorage.clear();
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  // Helper function to get stream URL
  const getStreamUrl = (filename) => {
    if (!filename) return null;
    return `${api_url}/entertainment/videos/stream/${filename}`;
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/entertainment/videos");

      // Ensure each video has the proper streamUrl
      const videosWithStream = response.data.map((video) => ({
        ...video,
        videoUrl: video.filename ? getStreamUrl(video.filename) : null,
      }));

      setVideos(videosWithStream);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching videos");
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveVideo = async () => {
    try {
      const response = await axiosInstance.get("/entertainment/videos/active");
      if (response.data) {
        // Add proper stream URL to active video
        const videoWithStream = {
          ...response.data,
          videoUrl: response.data.filename
            ? getStreamUrl(response.data.filename)
            : null,
        };
        setActiveVideo(videoWithStream);
        return videoWithStream;
      }
      return null;
    } catch (err) {
      console.error("Error fetching active video:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchActiveVideo();

    const interval = setInterval(() => {
      fetchVideos();
      fetchActiveVideo();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const createVideo = async (videoData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/entertainment/videos/add",
        videoData
      );
      await fetchVideos();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error creating video");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVideo = async (id, videoData) => {
    setLoading(true);
    try {
      // For FormData, axios will set the correct content type
      const response = await axiosInstance.put(
        `/entertainment/videos/${id}`,
        videoData
      );
      await fetchVideos();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error updating video");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/entertainment/videos/${id}`);
      await fetchVideos();
      if (activeVideo?.video_id === id) {
        await fetchActiveVideo();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting video");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVideoById = async (id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/entertainment/videos/${id}`);
      // Add stream URL to video
      const videoWithStream = {
        ...response.data,
        videoUrl: response.data.filename
          ? getStreamUrl(response.data.filename)
          : null,
      };
      return videoWithStream;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching video");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Video playback control methods
  const setActive = async (id) => {
    try {
      const response = await axiosInstance.put(
        `/entertainment/videos/${id}/activate`
      );

      // Add stream URL to active video
      const videoWithStream = {
        ...response.data,
        videoUrl: response.data.filename
          ? getStreamUrl(response.data.filename)
          : null,
      };

      setActiveVideo(videoWithStream);
      await fetchVideos();
      return videoWithStream;
    } catch (err) {
      console.error("Error setting active video:", err);
      throw err;
    }
  };

  const getNextVideo = async (currentId) => {
    try {
      const response = await axiosInstance.get(
        `/entertainment/videos/${currentId}/next`
      );

      // Add stream URL to next video
      const videoWithStream = {
        ...response.data,
        videoUrl: response.data.filename
          ? getStreamUrl(response.data.filename)
          : null,
      };

      return videoWithStream;
    } catch (err) {
      console.error("Error getting next video:", err);
      throw err;
    }
  };

  const updateVideoOrder = async (videoOrders) => {
    try {
      const response = await axiosInstance.put("/entertainment/videos/order", {
        videos: videoOrders,
      });
      await fetchVideos();
      return response.data;
    } catch (err) {
      console.error("Error updating video order:", err);
      throw err;
    }
  };

  const playNextVideo = async () => {
    if (!activeVideo) {
      const firstVideo = videos[0];
      if (firstVideo) {
        await setActive(firstVideo.video_id);
        return firstVideo;
      }
      return null;
    }

    const nextVideo = await getNextVideo(activeVideo.video_id);
    if (nextVideo) {
      await setActive(nextVideo.video_id);
      return nextVideo;
    }
    return null;
  };

  return {
    videos,
    activeVideo,
    loading,
    error,
    createVideo,
    updateVideo,
    deleteVideo,
    getVideoById,
    setActive,
    getNextVideo,
    playNextVideo,
    updateVideoOrder,
    refreshVideos: fetchVideos,
  };
};
