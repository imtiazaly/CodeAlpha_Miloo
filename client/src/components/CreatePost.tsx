import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Image, Upload, X, Sparkles, Hash } from "lucide-react";
import type { ApiResponse, Post } from "../types";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickTags = ["#Showcase", "#Tech", "#Design", "#Ideas", "#Miloo"];

  const handleTagClick = (tag: string) => {
    if (!content.includes(tag)) {
      setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await API.post<ApiResponse<{ post: Post }>>("/posts", {
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });

      onPostCreated(response.data.data.post);
      setContent("");
      setImageUrl("");
      setShowUrlInput(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/70 p-4 shadow-sm mb-4 transition-all hover:shadow-md">
      {error && (
        <div className="mb-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3 items-start mb-2">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an insight, showcase work, or ask a question..."
            className="flex-1 resize-none border-none focus:outline-none text-slate-800 placeholder-slate-400 text-sm pt-2 bg-transparent"
          />
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center space-x-1.5 mb-3 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center mr-1">
            <Hash className="w-3 h-3 mr-0.5" /> Tags:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-60 w-fit">
            <img
              src={imageUrl}
              alt="Preview"
              className="h-44 w-auto object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {showUrlInput && (
          <div className="mb-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Media</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium cursor-pointer"
            >
              <Image className="w-4 h-4" />
              <span>Link Image</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-full text-xs font-bold hover:opacity-95 shadow-xs disabled:opacity-40 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? "Publishing..." : "Publish"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};