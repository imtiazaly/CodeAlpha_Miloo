import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Search as SearchIcon, Users, ArrowRight, Clock } from "lucide-react";
import type { ApiResponse, User } from "../types";

const RECENT_KEY = "miloo_recent_searches";

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentSearches] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
  );
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async (q: string, targetPage = 1) => {
    if (!q.trim()) {
      setUsers([]);
      setHasMore(false);
      return;
    }
    if (targetPage === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await API.get<
        ApiResponse<{ users: User[]; pagination: any }>
      >(
        `/users/search?username=${encodeURIComponent(q)}&page=${targetPage}&limit=10`,
      );
      const newUsers = res.data.data.users;
      const pagination = res.data.data.pagination;
      if (targetPage === 1) setUsers(newUsers);
      else setUsers((prev) => [...prev, ...newUsers]);
      setPage(targetPage);
      setHasMore(pagination.page < pagination.totalPages);
    } catch {
      if (targetPage === 1) setUsers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(query, 1);
  }, [query]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchUsers(query, page + 1);
        }
      },
      { threshold: 1.0 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, query]);

  return (
    <div className="min-h-screen bg-[#f4f2ee] pb-12">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Empty: no query */}
        {!query.trim() && (
          <div>
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center space-x-2 py-1.5 text-sm text-slate-600"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-center py-14 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <SearchIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                Search for people on Miloo
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Use the search bar above
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {/* Results */}
        {!loading && query.trim() && (
          <>
            <div className="flex items-center space-x-2 mb-3 px-1">
              <SearchIcon className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Results for <span className="text-indigo-600">"{query}"</span>
              </h2>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">
                  No users found matching "{query}"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition"
                  >
                    <div className="flex items-center space-x-3">
                      {u.profileImage ? (
                        <img
                          src={u.profileImage}
                          alt={u.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-lg border border-indigo-100">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          @{u.username}
                        </h4>
                        {u.bio && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/profile/${u.id}`}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}

                {/* Infinite scroll trigger */}
                <div ref={loaderRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
