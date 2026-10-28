import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Search, User as UserIcon, LogOut, Sparkles } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Explore", path: "/search?q=user", icon: Search },
    { label: "Profile", path: `/profile/${user?.id}`, icon: UserIcon },
  ];

  return (
    <aside className="sticky top-0 h-screen w-20 xl:w-64 flex flex-col justify-between py-6 px-3 xl:px-6 border-r border-gray-200 bg-white select-none">
      <div className="space-y-6">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center space-x-3 px-2 text-indigo-600"
        >
          <img
            src="/miloo_icon.jpg"
            alt="Miloo"
            className="w-12 h-12 rounded-2xl object-cover shadow-lg"
          />
          <span className="hidden xl:inline text-2xl font-black tracking-tight text-gray-900">
            Miloo
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() =>
                  item.path === "/" &&
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className={`flex items-center space-x-4 px-3.5 py-3 rounded-2xl text-base font-semibold transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`}
                />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card & Logout */}
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center space-x-3 overflow-hidden p-1 rounded-xl hover:bg-gray-50 flex-1 mr-2"
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden xl:block text-left truncate">
            <p className="text-sm font-bold text-gray-900 truncate">
              @{user?.username}
            </p>
            <p className="text-xs text-gray-400">View profile</p>
          </div>
        </Link>
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
