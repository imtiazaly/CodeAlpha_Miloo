import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { CreatePost } from "../components/CreatePost";
import { PostCard } from "../components/PostCard";
import type { ApiResponse, Post } from "../types";

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "feed">("all");
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "all" ? "/posts" : "/posts/feed";
      const response = await API.get<ApiResponse<{ posts: Post[] }>>(endpoint);
      setPosts(response.data.data.posts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(posts.filter((p) => p.id !== deletedPostId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed Switcher Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition ${
              activeTab === "all"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Explore All
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition ${
              activeTab === "feed"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Following Feed
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-6 text-gray-500">
            {activeTab === "feed"
              ? "No posts from followed users yet. Follow some users to see their posts here!"
              : "No posts yet. Be the first to share something!"}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </main>
    </div>
  );
};
