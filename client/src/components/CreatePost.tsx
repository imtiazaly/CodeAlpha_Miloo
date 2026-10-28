import React, { useState } from "react";
import API from "../services/api";
import { Image, Send } from "lucide-react";
import type { ApiResponse, Post } from "../types";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setShowImageInput(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full resize-none border-none focus:outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
        />

        {showImageInput && (
          <div className="mt-2 mb-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL (e.g. https://...)"
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-500 hover:text-indigo-600 font-medium"
          >
            <Image className="w-4 h-4" />
            <span>Photo URL</span>
          </button>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
