import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, Search } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-indigo-600"
        >
          Miloo
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

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
