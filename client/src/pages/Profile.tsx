import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { PostCard } from "../components/PostCard";
import { UserCheck, UserPlus, Edit3, X } from "lucide-react";
import type { ApiResponse, UserProfile } from "../types";

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateCurrentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const isOwnProfile = currentUser?.id === Number(id);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get<ApiResponse<{ user: UserProfile }>>(
        `/users/${id}`,
      );
      setProfile(res.data.data.user);

      // Check follow status if not own profile
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
      if (prev) {
        await API.delete(`/follows/${id}`);
      } else {
        await API.post(`/follows/${id}`);
      }
    } catch {
      setIsFollowing(prev);
      fetchProfile();
    }
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 font-medium">
          User not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 mt-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.username}
                className="w-18 h-18 rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-18 h-18 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                @{profile.username}
              </h2>
              {profile.bio && (
                <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-4 mt-3 text-xs sm:text-sm text-gray-500">
                <div>
                  <span className="font-bold text-gray-900">
                    {profile.posts?.length || 0}
                  </span>{" "}
                  Posts
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profile.followersCount}
                  </span>{" "}
                  Followers
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {profile.followingCount}
                  </span>{" "}
                  Following
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            {isOwnProfile ? (
              <button
                onClick={openEditModal}
                className="flex items-center space-x-1.5 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`flex items-center space-x-1.5 px-5 py-1.5 rounded-full text-sm font-semibold transition ${
                  isFollowing
                    ? "bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-red-600"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* User Posts Stream */}
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
          Posts
        </h3>
        {profile.posts?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400 text-sm">
            No posts published yet.
          </div>
        ) : (
          profile.posts?.map((post) => (
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
          ))
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Tell people about yourself..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50"
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
