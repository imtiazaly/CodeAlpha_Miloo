import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { ProfileWidget } from "../components/ProfileWidget";
import { RightSidebar } from "../components/RightSidebar";
import { CreatePost } from "../components/CreatePost";
import { PostCard } from "../components/PostCard";
import { Bookmark, Compass, Users } from "lucide-react";
import type { ApiResponse, Post } from "../types";

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "feed">("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  const loaderRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 1.0 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-5 flex justify-center gap-6 items-start">
        {/* Left Column: Profile Card */}
        <ProfileWidget
          onOpenBookmarks={() => {
            setSavedPosts(
              JSON.parse(localStorage.getItem("miloo_bookmarks") || "[]"),
            );
            setShowBookmarksModal(true);
          }}
        />

        {/* Center Column: Feed Stream */}
        <main className="w-full max-w-140 flex-1">
          {/* Live Community Pulse Banner */}
          <div className="mb-3 px-3.5 py-2 rounded-2xl bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/80 flex items-center justify-between text-xs text-indigo-900 shadow-2xs">
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
              className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore All</span>
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === "feed"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Following Feed</span>
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

              <div ref={loaderRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Column: News & Suggestions */}
        <RightSidebar />
      </div>

      {showBookmarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Saved Posts</span>
              </h4>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {savedPosts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No saved posts yet.
                </p>
              ) : (
                savedPosts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-start gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">
                        @{p.author?.username}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                        {p.content}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = savedPosts.filter(
                          (item) => item.id !== p.id,
                        );
                        localStorage.setItem(
                          "miloo_bookmarks",
                          JSON.stringify(updated),
                        );
                        setSavedPosts(updated);
                      }}
                      className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
