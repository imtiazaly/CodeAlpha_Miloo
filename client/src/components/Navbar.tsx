import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Search, X, Clock } from "lucide-react";

const RECENT_KEY = "miloo_recent_searches";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        saveAndNavigate(searchQuery.trim());
      }, 400);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const saveAndNavigate = (q: string) => {
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) saveAndNavigate(searchQuery.trim());
  };

  const clearRecent = (term: string) => {
    const updated = recentSearches.filter((r) => r !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center"
        >
          <img
            src="/miloo_logo.jpg"
            alt="Miloo"
            className="h-12 w-12 object-contain"
          />
        </Link>

        {/* Search */}
        <div ref={wrapperRef} className="relative flex-1 max-w-xs mx-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search users..."
                className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>

          {/* Recent Searches Dropdown */}
          {showDropdown && !searchQuery && recentSearches.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-slate-200/80 shadow-lg z-50 p-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Recent
                </span>
                <button
                  onClick={clearAll}
                  className="text-[10px] text-indigo-500 font-semibold"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((term) => (
                <div
                  key={term}
                  className="flex items-center justify-between group hover:bg-slate-50 rounded-xl px-2 py-1.5"
                >
                  <button
                    onClick={() => {
                      setSearchQuery(term);
                      saveAndNavigate(term);
                    }}
                    className="flex items-center space-x-2 text-xs text-slate-700 flex-1 text-left"
                  >
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{term}</span>
                  </button>
                  <button
                    onClick={() => clearRecent(term)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          <Link
            to={`/profile/${user?.id}`}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <span className="hidden sm:inline">@{user?.username}</span>
          </Link>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
