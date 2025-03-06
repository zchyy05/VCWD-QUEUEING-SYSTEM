import React, { useState, useRef } from "react";
import AdminLayout from "./adminLayout";
import { useVideos } from "../../hooks/useVideos";
import {
  PlayCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Video,
} from "lucide-react";

const AdminVideos = () => {
  const api_url = import.meta.env.VITE_API_URL;
  const {
    videos,
    loading,
    error,
    createVideo,
    updateVideo,
    deleteVideo,
    setActive,
  } = useVideos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const stats = [
    {
      name: "Total Videos",
      value: videos.length.toString(),
      icon: Video,
    },
    {
      name: "Active Videos",
      value: videos.filter((video) => video.isActive).length.toString(),
      icon: CheckCircle,
    },
    {
      name: "Entertainment Views",
      value: videos
        .reduce((sum, video) => sum + (video.views || 0), 0)
        .toString(),
      icon: PlayCircle,
    },
  ];

  // Generate stream URL directly from the streaming endpoint
  const getStreamUrl = (filename) => {
    if (!filename) return null;
    return `${api_url}/entertainment/videos/stream/${filename}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Only require video file for new uploads
    if (!editingVideo && !videoFile) {
      newErrors.videoFile = "Video file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create FormData object for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);

        if (videoFile) {
          formDataToSend.append("video", videoFile);
        }

        if (editingVideo) {
          await updateVideo(editingVideo.video_id, formDataToSend);
        } else {
          await createVideo(formDataToSend);
        }
        setIsModalOpen(false);
        setEditingVideo(null);
        setFormData({ title: "" });
        setVideoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        console.error("Error saving video:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(id);
      } catch (err) {
        console.error("Error deleting video:", err);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const acceptedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
      ];
      if (!acceptedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          videoFile:
            "Please upload a valid video file (MP4, WebM, OGG, or QuickTime)",
        });
        e.target.value = "";
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setErrors({
          ...errors,
          videoFile: "File size should be less than 100MB",
        });
        e.target.value = "";
        return;
      }

      setVideoFile(file);
      setErrors({
        ...errors,
        videoFile: null,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setFormData({ title: "" });
                setVideoFile(null);
                setEditingVideo(null);
                setErrors({});
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Video
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Video List
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading videos...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : videos.length === 0 ? (
            <p className="text-gray-600">No videos to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.video_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-40 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          {video.filename ? (
                            <video
                              src={getStreamUrl(video.filename)}
                              className="w-full h-full object-cover"
                              controlsList="nodownload nofullscreen noremoteplayback"
                              controls
                              muted
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {video.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {video.originalFilename && (
                            <span title={video.originalFilename}>
                              {video.originalFilename.length > 20
                                ? video.originalFilename.substring(0, 20) +
                                  "..."
                                : video.originalFilename}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              video.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {video.isActive
                              ? "Currently Playing"
                              : "Not Playing"}
                          </span>
                          {video.isActive && (
                            <span className="text-xs text-gray-500">
                              Active since{" "}
                              {new Date(video.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end">
                        <button
                          onClick={() => setActive(video.video_id)}
                          className={`mx-2 ${
                            video.isActive
                              ? "text-green-600 hover:text-green-800"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={
                            video.isActive
                              ? "Currently Active"
                              : "Set as Active"
                          }
                        >
                          <PlayCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo(video);
                            setFormData({
                              title: video.title,
                            });
                            setVideoFile(null);
                            setErrors({});
                            setIsModalOpen(true);
                          }}
                          className="text-primary hover:text-primary/80 mx-2"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.video_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingVideo ? "Edit Video" : "Add Video"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingVideo(null);
                  setFormData({ title: "" });
                  setVideoFile(null);
                  setErrors({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File{" "}
                  {editingVideo ? "(Leave empty to keep existing file)" : "*"}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {videoFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected file: {videoFile.name} (
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                {errors.videoFile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.videoFile}
                  </p>
                )}
                {editingVideo && editingVideo.originalFilename && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current file: {editingVideo.originalFilename}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingVideo(null);
                    setFormData({ title: "" });
                    setVideoFile(null);
                    setErrors({});
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingVideo ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVideos;
