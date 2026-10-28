import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { Bookmark, ArrowRight, BadgeCheck } from "lucide-react";
import type { ApiResponse, UserProfile } from "../types";

export const ProfileWidget: React.FC<{ onOpenBookmarks?: () => void }> = ({
  onOpenBookmarks,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    postsCount: number;
    followersCount: number;
    followingCount: number;
  }>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });

  const [bookmarkCount, setBookmarkCount] = useState(
    () => JSON.parse(localStorage.getItem("miloo_bookmarks") || "[]").length,
  );
  useEffect(() => {
    const update = () => {
      setBookmarkCount(
        JSON.parse(localStorage.getItem("miloo_bookmarks") || "[]").length,
      );
    };
    window.addEventListener("miloo_bookmark_updated", update);
    return () => window.removeEventListener("miloo_bookmark_updated", update);
  }, []);

  useEffect(() => {
    if (user?.id) {
      API.get<ApiResponse<{ user: UserProfile }>>(`/users/${user.id}`)
        .then((res) => {
          const profile = res.data.data.user;
          setStats({
            postsCount: profile.posts?.length || 0,
            followersCount: profile.followersCount || 0,
            followingCount: profile.followingCount || 0,
          });
        })
        .catch(() => {});
    }
  }, [user?.id]);

  return (
    <div className="w-60 shrink-0 hidden md:flex flex-col space-y-3 sticky top-20 select-none">
      {/* Consistent Light Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-3">
          <Link to={`/profile/${user?.id}`}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-base border border-indigo-100">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>

          <div className="truncate">
            <div className="flex items-center space-x-1">
              <Link
                to={`/profile/${user?.id}`}
                className="font-bold text-sm text-slate-900 truncate hover:underline"
              >
                @{user?.username}
              </Link>
              <BadgeCheck className="w-4 h-4 text-indigo-500 fill-indigo-50 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">Miloo Creator</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {user?.bio || "Social media explorer on Miloo."}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 text-center py-2.5 bg-slate-50 rounded-xl mb-3 border border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-900">
              {stats.postsCount}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Posts</p>
          </div>
          <div className="border-x border-slate-200">
            <p className="text-xs font-bold text-slate-900">
              {stats.followersCount}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Followers</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              {stats.followingCount}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Following</p>
          </div>
        </div>

        {/* Profile Link */}
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center justify-center space-x-1.5 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition"
        >
          <span>My Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <button
        onClick={onOpenBookmarks}
        className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Saved Bookmarks</span>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
          {bookmarkCount}
        </span>
      </button>
    </div>
  );
};
