import React, { useState } from "react";
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

const convertToEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);

    // Handle youtube.com URLs
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        // Return clean embed URL without any extra parameters
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Handle youtu.be URLs
    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    return "";
  } catch (error) {
    console.error("Error converting URL:", error);
    return "";
  }
};

const AdminVideos = () => {
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
    youtubeUrl: "",
  });

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = "YouTube URL is required";
    } else if (!formData.youtubeUrl.includes("youtube.com/embed/")) {
      newErrors.youtubeUrl = "Please enter a valid YouTube URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (editingVideo) {
          await updateVideo(editingVideo.video_id, formData);
        } else {
          await createVideo(formData);
        }
        setIsModalOpen(false);
        setEditingVideo(null);
        setFormData({ title: "", youtubeUrl: "" });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
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
                          <iframe
                            src={convertToEmbedUrl(video.youtubeUrl)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {video.title}
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
                              youtubeUrl: video.youtubeUrl,
                            });
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
                  setFormData({ title: "", youtubeUrl: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    YouTube URL*
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => {
                      const embedUrl = convertToEmbedUrl(e.target.value);
                      setFormData({ ...formData, youtubeUrl: embedUrl });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  {errors.youtubeUrl && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.youtubeUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingVideo(null);
                    setFormData({ title: "", youtubeUrl: "" });
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
