import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { ProfileWidget } from "../components/ProfileWidget";
import { RightSidebar } from "../components/RightSidebar";
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
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-5 flex justify-center gap-6 items-start">
        {/* Left Column: Profile Card */}
        <ProfileWidget />

        {/* Center Column: Feed Stream */}
        <main className="w-full max-w-[560px] flex-1">
          {/* Live Community Pulse Banner */}
          <div className="mb-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/80 flex items-center justify-between text-xs text-indigo-900 shadow-2xs">
            <span className="flex items-center font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2 inline-block" />
              Community Pulse
            </span>
            <span className="text-[11px] font-medium text-indigo-600">
              500+ creators connected live
            </span>
          </div>

          {/* Create Post */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Modern Segmented Tab Switcher */}
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200/80 mb-3.5 shadow-2xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🔥 Explore All
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === "feed"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              👥 Following Feed
            </button>
          </div>

          {/* Feed Content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200/80 text-slate-400 text-sm">
              {activeTab === "feed"
                ? "No posts from followed users. Follow some accounts from the sidebar!"
                : "No posts found."}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-full text-xs hover:bg-slate-50 shadow-xs"
                  >
                    {loadingMore ? "Loading..." : "Load More Posts"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Column: News & Suggestions */}
        <RightSidebar />
      </div>
    </div>
  );
};
