import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Search, Trophy, Flame, Sparkles } from "lucide-react";
import type { ApiResponse, User } from "../types";

export const RightSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [spotlightUsers, setSpotlightUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get<ApiResponse<{ users: User[] }>>(
      "/users/search?username=user&limit=4",
    )
      .then((res) => setSpotlightUsers(res.data.data.users))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const trendingTags = [
    { tag: "#TypeScript", count: "1.2k posts" },
    { tag: "#WebDev", count: "890 posts" },
    { tag: "#FullStack", count: "640 posts" },
    { tag: "#DesignSystem", count: "420 posts" },
  ];

  const medals = ["🥇", "🥈", "🥉", "⭐"];

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col space-y-3.5 sticky top-20 select-none">
      {/* Search Input */}
      <form
        onSubmit={handleSearch}
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-2 shadow-xs"
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators & ideas..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>

      {/* Top Creators Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Creator Spotlight</span>
        </h3>
        <div className="space-y-2.5">
          {spotlightUsers.slice(0, 4).map((u, idx) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              <Link
                to={`/profile/${u.id}`}
                className="flex items-center space-x-2.5 overflow-hidden"
              >
                <span className="text-sm">{medals[idx]}</span>
                {u.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate hover:underline">
                    @{u.username}
                  </p>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    Trending Creator
                  </p>
                </div>
              </Link>
              <Link
                to={`/profile/${u.id}`}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 text-[11px] font-bold rounded-full transition"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Topics Cloud */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>Hot Discussions</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map((t) => (
            <button
              key={t.tag}
              onClick={() =>
                navigate(
                  `/search?q=${encodeURIComponent(t.tag.replace("#", ""))}`,
                )
              }
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/60 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <span>{t.tag}</span>
              <span className="text-[10px] text-slate-400">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Live Stats */}
      <div className="p-3 bg-linear-to-tr from-indigo-500 to-violet-600 rounded-2xl text-white text-center shadow-xs">
        <div className="flex items-center justify-center space-x-1 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Miloo Ecosystem</span>
        </div>
        <p className="text-[11px] text-indigo-100">
          500+ Creators • 5,000+ Posts active right now
        </p>
      </div>
    </aside>
  );
};