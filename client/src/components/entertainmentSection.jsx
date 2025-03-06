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
  const iframeRef = useRef(null);

  // Update video URL when active video changes
  useEffect(() => {
    if (activeVideo?.youtubeUrl) {
      // Reset playing state when video changes
      setIsPlaying(false);
    }
  }, [activeVideo?.youtubeUrl]);

  // Handle announcement state changes
  useEffect(() => {
    if (isAnnouncing) {
      // Store current playing state
      setWasPlayingBeforeAnnouncement(isPlaying);
      // Pause video if it's playing
      setIsPlaying(false);
    } else {
      // Resume video if it was playing before announcement
      if (wasPlayingBeforeAnnouncement) {
        setIsPlaying(true);
      }
    }
  }, [isAnnouncing]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setWasPlayingBeforeAnnouncement(!isPlaying);
  };

  const handleNextVideo = async () => {
    await playNextVideo();
    if (isPlaying && !isAnnouncing) {
      setIsPlaying(true);
    }
  };

  // Construct YouTube URL with appropriate parameters
  const getYouTubeUrl = () => {
    if (!activeVideo?.youtubeUrl) return "";
    const baseUrl = activeVideo.youtubeUrl;
    const params = new URLSearchParams({
      autoplay: isPlaying ? "1" : "0",
      enablejsapi: "1",
      controls: "1",
      modestbranding: "1",
    });
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${params.toString()}`;
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
          // Fixed height instead of percentage-based padding
          height: "220px",
          maxHeight: "220px",
        }}
      >
        {activeVideo ? (
          <iframe
            ref={iframeRef}
            className="absolute top-0 left-0 w-full h-full"
            src={getYouTubeUrl()}
            title={activeVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
