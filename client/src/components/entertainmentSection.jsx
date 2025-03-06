import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import { useVideos } from "../hooks/useVideos";
import { useAnnouncement } from "../context/announcementContext";

const EntertainmentSection = ({ theme, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasPlayingBeforeAnnouncement, setWasPlayingBeforeAnnouncement] =
    useState(false);
  const { isAnnouncing } = useAnnouncement();
  const { activeVideo, playNextVideo } = useVideos();
  const videoRef = useRef(null);
  const api_url = import.meta.env.VITE_API_URL;

  // Update video playing state when active video changes
  useEffect(() => {
    if (activeVideo?.filename) {
      // Reset playing state when video changes
      setIsPlaying(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.load();
      }
    }
  }, [activeVideo?.filename]);

  // Handle announcement state changes
  useEffect(() => {
    if (isAnnouncing) {
      // Store current playing state
      setWasPlayingBeforeAnnouncement(isPlaying);
      // Pause video if it's playing
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Resume video if it was playing before announcement
      if (wasPlayingBeforeAnnouncement && videoRef.current) {
        videoRef.current.play().catch((e) => {
          console.error("Error playing video:", e);
        });
        setIsPlaying(true);
      }
    }
  }, [isAnnouncing]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((e) => {
          console.error("Error playing video:", e);
        });
      }
      setIsPlaying(!isPlaying);
      setWasPlayingBeforeAnnouncement(!isPlaying);
    }
  };

  const handleNextVideo = async () => {
    await playNextVideo();
    if (isPlaying && !isAnnouncing && videoRef.current) {
      // Wait for new video to load, then play
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.error("Error playing next video:", e);
          });
          setIsPlaying(true);
        }
      }, 300);
    }
  };

  // Generate stream URL directly from the streaming endpoint
  const getStreamUrl = (filename) => {
    if (!filename) return null;
    return `${api_url}/entertainment/videos/stream/${filename}`;
  };

  return (
    <div
      className={`${theme.cardBackground} rounded-xl shadow-lg overflow-hidden h-full`}
    >
      <div className={`${theme.banner} px-4 py-3`}>
        <div className="flex justify-between items-center">
          <h2
            className={`${
              compact ? "text-lg" : "text-xl"
            } font-bold text-white flex items-center`}
          >
            <button
              onClick={handlePlayPause}
              className="focus:outline-none hover:opacity-80"
              title={isPlaying ? "Pause" : "Play"}
              disabled={isAnnouncing || !activeVideo}
            >
              {isPlaying ? (
                <Pause className={`${compact ? "h-5 w-5" : "h-6 w-6"} mr-2`} />
              ) : (
                <Play className={`${compact ? "h-5 w-5" : "h-6 w-6"} mr-2`} />
              )}
            </button>
            <span className="truncate">
              {activeVideo?.title || "Entertainment"}
            </span>
          </h2>
          <button
            onClick={handleNextVideo}
            className="text-white hover:opacity-80 focus:outline-none"
            title="Next Video"
            disabled={isAnnouncing}
          >
            <SkipForward className={`${compact ? "h-5 w-5" : "h-6 w-6"}`} />
          </button>
        </div>
      </div>
      <div
        className="relative w-full"
        style={{
          height: "220px",
          maxHeight: "220px",
        }}
      >
        {activeVideo?.filename ? (
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain bg-black"
            preload="auto"
            controlsList="nodownload"
            playsInline
            controls
            onError={(e) => {
              console.error("Video error details:", {
                error: e.target.error,
                networkState: e.target.networkState,
                readyState: e.target.readyState,
                src: e.target.src,
              });
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleNextVideo}
          >
            <source
              src={getStreamUrl(activeVideo.filename)}
              type={activeVideo.mimeType || "video/mp4"}
            />
            <p>Your browser doesn't support this video format.</p>
          </video>
        ) : (
          <div
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${theme.waitingListBg}`}
          >
            <p className="text-gray-500">No video available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntertainmentSection;
