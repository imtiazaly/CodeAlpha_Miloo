import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Search, TrendingUp, UserPlus } from "lucide-react";
import type { ApiResponse, User } from "../types";

export const RightSidebar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch 4 suggested users
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

  const trends = [
    { tag: "#MilooCreators", posts: "12.4K posts" },
    { tag: "#TypeScript", posts: "8.1K posts" },
    { tag: "#FullStack", posts: "5.6K posts" },
    { tag: "#BuildInPublic", posts: "3.2K posts" },
  ];

  return (
    <aside className="sticky top-0 h-screen w-80 hidden lg:flex flex-col py-6 px-4 space-y-6 select-none overflow-y-auto">
      {/* Search Input */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search on Miloo..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 text-sm rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </form>

      {/* Who To Follow Widget */}
      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
        <h3 className="font-extrabold text-gray-900 text-sm mb-3">
          Who to follow
        </h3>
        <div className="space-y-3">
          {suggestedUsers.slice(0, 4).map((u) => (
            <div key={u.id} className="flex items-center justify-between">
              <Link
                to={`/profile/${u.id}`}
                className="flex items-center space-x-2.5 overflow-hidden"
              >
                {u.profileImage ? (
                  <img
                    src={u.profileImage}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-900 truncate hover:underline">
                  @{u.username}
                </span>
              </Link>
              <Link
                to={`/profile/${u.id}`}
                className="px-3 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-gray-200 text-gray-800 text-xs font-semibold rounded-full shadow-sm transition"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics Widget */}
      <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
        <h3 className="font-extrabold text-gray-900 text-sm mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Trending for you</span>
        </h3>
        <div className="space-y-3">
          {trends.map((t) => (
            <div
              key={t.tag}
              className="cursor-pointer hover:bg-gray-100/60 p-1.5 rounded-xl transition"
            >
              <p className="text-xs font-bold text-gray-900">{t.tag}</p>
              <p className="text-[11px] text-gray-400">{t.posts}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
