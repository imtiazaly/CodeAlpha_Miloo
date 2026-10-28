import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bookmark, User as UserIcon } from "lucide-react";

export const ProfileWidget: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="w-56 shrink-0 hidden md:flex flex-col space-y-2 sticky top-20">
      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden text-center">
        {/* Cover Banner */}
        <div className="h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" />

        {/* Avatar */}
        <div className="-mt-8 mb-2 flex justify-center">
          <Link to={`/profile/${user?.id}`}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm hover:opacity-90 transition"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-bold border-2 border-white shadow-sm flex items-center justify-center text-xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>

        {/* Username & Bio */}
        <div className="px-4 pb-3 border-b border-slate-100">
          <Link
            to={`/profile/${user?.id}`}
            className="font-bold text-slate-900 text-sm hover:underline block truncate"
          >
            @{user?.username}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
            {user?.bio || "Social Media Enthusiast on Miloo"}
          </p>
        </div>

        {/* Stats Block */}
        <Link
          to={`/profile/${user?.id}`}
          className="p-3 text-xs flex justify-between items-center hover:bg-slate-50 text-slate-500 font-medium"
        >
          <span>View full profile</span>
          <span className="text-indigo-600 font-semibold">Profile &rarr;</span>
        </Link>
      </div>

      {/* Mini Bookmarks Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-3 text-xs text-slate-600 font-semibold flex items-center space-x-2 hover:bg-slate-50 cursor-pointer">
        <Bookmark className="w-4 h-4 text-slate-400" />
        <span>My Saved Items</span>
      </div>
    </div>
  );
};
