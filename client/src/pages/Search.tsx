import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { User as UserIcon, ArrowRight } from "lucide-react";
import type { ApiResponse, User } from "../types";

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    API.get<ApiResponse<{ users: User[] }>>(
      `/users/search?username=${encodeURIComponent(query)}`,
    )
      .then((res) => setUsers(res.data.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Search Results for "{query}"
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400 text-sm">
            No users found matching "{query}".
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  {u.profileImage ? (
                    <img
                      src={u.profileImage}
                      alt={u.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      @{u.username}
                    </h4>
                    {u.bio && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {u.bio}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to={`/profile/${u.id}`}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
