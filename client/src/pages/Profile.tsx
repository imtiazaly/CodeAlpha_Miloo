import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { PostCard } from "../components/PostCard";
import {
  UserCheck,
  UserPlus,
  Edit3,
  X,
  Users,
  Upload,
  BadgeCheck,
  FileText,
} from "lucide-react";
import type { ApiResponse, UserProfile } from "../types";

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateCurrentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [followModalTitle, setFollowModalTitle] = useState<string | null>(null);
  const [followUsersList, setFollowUsersList] = useState<any[]>([]);

  const isOwnProfile = currentUser?.id === Number(id);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get<ApiResponse<{ user: UserProfile }>>(
        `/users/${id}`,
      );
      setProfile(res.data.data.user);
      if (!isOwnProfile && currentUser) {
        const followRes = await API.get<
          ApiResponse<{ followers: Array<{ followerId: number }> }>
        >(`/follows/${id}/followers`);
        const following = followRes.data.data.followers.some(
          (f) => f.followerId === currentUser.id,
        );
        setIsFollowing(following);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    const prev = isFollowing;
    setIsFollowing(!prev);
    setProfile({
      ...profile,
      followersCount: prev
        ? profile.followersCount - 1
        : profile.followersCount + 1,
    });
    try {
      if (prev) await API.delete(`/follows/${id}`);
      else await API.post(`/follows/${id}`);
    } catch {
      setIsFollowing(prev);
      fetchProfile();
    }
  };

  const openFollowersModal = async () => {
    try {
      const res = await API.get<ApiResponse<{ followers: any[] }>>(
        `/follows/${id}/followers`,
      );
      setFollowUsersList(res.data.data.followers.map((f) => f.follower));
      setFollowModalTitle("Followers");
    } catch {}
  };

  const openFollowingModal = async () => {
    try {
      const res = await API.get<ApiResponse<{ following: any[] }>>(
        `/follows/${id}/following`,
      );
      setFollowUsersList(res.data.data.following.map((f) => f.following));
      setFollowModalTitle("Following");
    } catch {}
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await API.patch<ApiResponse<{ user: any }>>("/users/me", {
        username: editUsername.trim() || undefined,
        bio: editBio.trim() || null,
        profileImage: editImage.trim() || null,
      });
      updateCurrentUser(res.data.data.user);
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = () => {
    if (profile) {
      setEditUsername(profile.username);
      setEditBio(profile.bio || "");
      setEditImage(profile.profileImage || "");
      setIsEditing(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f2ee] flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f4f2ee] flex">
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-5 flex justify-center gap-6 items-start">
        {/* Center: Profile + Posts */}
        <main className="w-full max-w-140 flex-1">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden mb-4">
            {/* Banner */}
            <div className="h-24 bg-linear-to-r from-indigo-500 via-violet-500 to-purple-600" />

            <div className="px-5 pb-5 -mt-10">
              {/* Avatar + Action */}
              <div className="flex items-end justify-between mb-3">
                <div className="ring-4 ring-white rounded-full">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.username}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-2xl border border-indigo-100">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {isOwnProfile ? (
                  <button
                    onClick={openEditModal}
                    className="flex items-center space-x-1.5 px-4 py-1.5 border border-slate-300 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center space-x-1.5 px-5 py-1.5 rounded-full text-xs font-bold transition ${
                      isFollowing
                        ? "bg-slate-100 text-slate-800 hover:bg-red-50 hover:text-red-600"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Name + Bio */}
              <div className="flex items-center space-x-1.5 mb-0.5">
                <h2 className="text-base font-bold text-slate-900">
                  @{profile.username}
                </h2>
                <BadgeCheck className="w-4 h-4 text-indigo-500 fill-indigo-50 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {profile.bio || "Miloo creator — sharing thoughts & ideas."}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 text-center py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {profile.posts?.length || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Posts
                  </p>
                </div>
                <div className="border-x border-slate-200">
                  <button onClick={openFollowersModal} className="w-full">
                    <p className="text-sm font-bold text-slate-900">
                      {profile.followersCount}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium hover:underline">
                      Followers
                    </p>
                  </button>
                </div>
                <div>
                  <button onClick={openFollowingModal} className="w-full">
                    <p className="text-sm font-bold text-slate-900">
                      {profile.followingCount}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium hover:underline">
                      Following
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="flex items-center space-x-2 mb-3 px-1">
            <FileText className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
              Posts
            </h3>
          </div>

          {profile.posts?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-sm">
              No posts published yet.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.posts?.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    author: {
                      id: profile.id,
                      username: profile.username,
                      profileImage: profile.profileImage,
                    },
                  }}
                  onPostDeleted={() => fetchProfile()}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Followers / Following Modal */}
      {followModalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{followModalTitle}</span>
              </h4>
              <button onClick={() => setFollowModalTitle(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {followUsersList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No users found.
                </p>
              ) : (
                followUsersList.map((u, idx) => (
                  <Link
                    key={idx}
                    to={`/profile/${u.id}`}
                    onClick={() => setFollowModalTitle(null)}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl"
                  >
                    {u.profileImage ? (
                      <img
                        src={u.profileImage}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-800">
                      @{u.username}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Profile
              </h3>
              <button onClick={() => setIsEditing(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell people about yourself..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Profile Photo
                </label>
                {editImage && (
                  <div className="relative w-fit mb-2">
                    <img
                      src={editImage}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => setEditImage("")}
                      className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-50 text-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="Or paste photo URL"
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
