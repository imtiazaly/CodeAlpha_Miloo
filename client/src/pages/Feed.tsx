import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Sidebar } from "../components/Sidebar";
import { RightSidebar } from "../components/RightSidebar";
import { StoriesBar } from "../components/StoriesBar";
import { CreatePost } from "../components/CreatePost";
import { PostCard } from "../components/PostCard";
import type { ApiResponse, Post } from "../types";

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "feed">("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (targetPage = 1) => {
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const endpoint = activeTab === "all" ? "/posts" : "/posts/feed";
      const response = await API.get<
        ApiResponse<{
          posts: Post[];
          pagination: { page: number; totalPages: number };
        }>
      >(`${endpoint}?page=${targetPage}&limit=10`);

      const newPosts = response.data.data.posts;
      const pagination = response.data.data.pagination;

      if (targetPage === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setPage(targetPage);
      setHasMore(pagination.page < pagination.totalPages);
    } catch {
      if (targetPage === 1) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [activeTab]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(posts.filter((p) => p.id !== deletedPostId));
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-7xl flex">
        {/* Left Column: Fixed Navigation Sidebar */}
        <Sidebar />

        {/* Center Column: Feed Stream */}
        <main className="flex-1 max-w-2xl border-r border-gray-200 bg-white min-h-screen">
          {/* Glassmorphic Sticky Header */}
          <div className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-gray-100 flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3.5 text-center text-sm font-bold transition relative ${
                activeTab === "all"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              For you
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 py-3.5 text-center text-sm font-bold transition relative ${
                activeTab === "feed"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Following
              {activeTab === "feed" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Stories Bar */}
          <StoriesBar />

          {/* Feed Content */}
          <div className="p-4">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                {activeTab === "feed"
                  ? "No posts from followed users. Follow some accounts from the sidebar!"
                  : "No posts found."}
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}

                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-full text-xs hover:bg-gray-100 shadow-sm"
                    >
                      {loadingMore ? "Loading..." : "Load More Posts"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Column: Trending & Suggestions */}
        <RightSidebar />
      </div>
    </div>
  );
};