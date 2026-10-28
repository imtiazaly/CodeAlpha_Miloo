import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import type { ApiResponse, User } from "../types";

export const StoriesBar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    API.get<ApiResponse<{ users: User[] }>>(
      "/users/search?username=user&limit=10",
    )
      .then((res) => setUsers(res.data.data.users))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 py-3.5 px-4 mb-4 overflow-x-auto no-scrollbar flex space-x-4">
      {users.map((u) => (
        <Link
          key={u.id}
          to={`/profile/${u.id}`}
          className="flex flex-col items-center space-y-1 shrink-0 group"
        >
          <div className="p-0.5 rounded-full bg-linear-to-tr from-amber-500 via-rose-500 to-indigo-600 group-hover:scale-105 transition transform">
            <div className="p-0.5 bg-white rounded-full">
              {u.profileImage ? (
                <img
                  src={u.profileImage}
                  alt=""
                  className="w-13 h-13 rounded-full object-cover"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm">
                  {u.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] font-medium text-gray-700 truncate max-w-15.5">
            {u.username}
          </span>
        </Link>
      ))}
    </div>
  );
};
