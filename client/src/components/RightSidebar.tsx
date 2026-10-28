import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Search, TrendingUp } from "lucide-react";
import type { ApiResponse, User } from "../types";

export const RightSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get<ApiResponse<{ users: User[] }>>(
      "/users/search?username=user&limit=4",
    )
      .then((res) => setSuggestedUsers(res.data.data.users))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const newsItems = [
    {
      title: "Miloo hits 100K active developers",
      time: "Top news • 4,210 readers",
    },
    { title: "Fullstack TypeScript in 2026", time: "Tech • 1,842 readers" },
    {
      title: "MySQL & Sequelize best practices",
      time: "Engineering • 950 readers",
    },
    {
      title: "UI/UX trends for modern social apps",
      time: "Design • 2,130 readers",
    },
  ];

  return (
    <aside className="w-72 shrink-0 hidden lg:flex flex-col space-y-3 sticky top-20 select-none">
      {/* Search Input */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs"
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Miloo..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 text-xs rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>

      {/* Miloo News Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Miloo News</span>
        </h3>
        <div className="space-y-3">
          {newsItems.map((item, idx) => (
            <div key={idx} className="cursor-pointer group">
              <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition leading-snug">
                • {item.title}
              </p>
              <p className="text-[10px] text-slate-400 ml-2.5 mt-0.5">
                {item.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Who To Follow Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">
          Add to your feed
        </h3>
        <div className="space-y-3">
          {suggestedUsers.slice(0, 4).map((u) => (
            <div key={u.id} className="flex items-center justify-between">
              <Link
                to={`/profile/${u.id}`}
                className="flex items-center space-x-2 overflow-hidden"
              >
                {u.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-900 truncate hover:underline">
                  @{u.username}
                </span>
              </Link>
              <Link
                to={`/profile/${u.id}`}
                className="px-2.5 py-1 border border-slate-300 hover:border-slate-400 text-slate-700 text-[11px] font-semibold rounded-full hover:bg-slate-50 transition"
              >
                + Follow
              </Link>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};