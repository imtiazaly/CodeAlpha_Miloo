import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import {
  Search as SearchIcon,
  ArrowRight,
  Users,
  X,
  Clock,
} from "lucide-react";
import type { ApiResponse, User } from "../types";

const RECENT_KEY = "miloo_recent_searches";

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Debounced search as you type
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (inputValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`, {
          replace: true,
        });
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  useEffect(() => {
    setPage(1);
    fetchUsers(query, 1);
    if (query.trim()) {
      const updated = [
        query,
        ...recentSearches.filter((r) => r !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
  }, [query]);

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

  const clearRecent = (term: string) => {
    const updated = recentSearches.filter((r) => r !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee] pb-12">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Empty state: Recent Searches */}
        {!query.trim() && (
          <div>
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearAllRecent}
                    className="text-xs text-indigo-500 font-semibold hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center justify-between group"
                    >
                      <button
                        onClick={() => {
                          setInputValue(term);
                          navigate(`/search?q=${encodeURIComponent(term)}`);
                        }}
                        className="flex items-center space-x-2 text-sm text-slate-700 hover:text-indigo-600 py-1.5 flex-1 text-left"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        <span>{term}</span>
                      </button>
                      <button
                        onClick={() => clearRecent(term)}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty placeholder */}
            <div className="text-center py-14 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <SearchIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                Search for people on Miloo
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Type a name above to get started
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
                    <Link
                      to={`/profile/${u.id}`}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}

                {/* Load More */}
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
