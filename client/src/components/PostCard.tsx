import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  Edit2,
  X,
  Check,
  Upload,
  Bookmark,
  Share2,
  BadgeCheck,
} from "lucide-react";
import type { ApiResponse, Post, Comment } from "../types";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: number) => void;
}

const formatRelativeTime = (dateString: string): string => {
  const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateString).toLocaleDateString();
};

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit Post State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content);
  const [editPostImage, setEditPostImage] = useState(post.imageUrl || "");

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Likes Modal State
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesUsers, setLikesUsers] = useState<
    Array<{
      user: { id: number; username: string; profileImage: string | null };
    }>
  >([]);

  // Expanded content state
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 200;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("miloo_bookmarks") || "[]");
    setIsBookmarked(saved.some((p: any) => p.id === post.id));
  }, [post.id]);

  const handleToggleBookmark = () => {
    const saved: any[] = JSON.parse(
      localStorage.getItem("miloo_bookmarks") || "[]",
    );
    let updated: any[];
    if (isBookmarked) {
      updated = saved.filter((p) => p.id !== post.id);
    } else {
      updated = [currentPost, ...saved];
    }
    localStorage.setItem("miloo_bookmarks", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("miloo_bookmark_updated"));
    setIsBookmarked(!isBookmarked);
  };

  useEffect(() => {
    API.get<
      ApiResponse<{
        likes: Array<{ userId: number }>;
        pagination: { total: number };
      }>
    >(`/likes/post/${post.id}`)
      .then((res) => {
        setLikesCount(res.data.data.pagination.total);
        setIsLiked(res.data.data.likes.some((l) => l.userId === user?.id));
      })
      .catch(() => {});

    API.get<ApiResponse<{ pagination: { total: number } }>>(
      `/comments/post/${post.id}?limit=1`,
    )
      .then((res) => setCommentsCount(res.data.data.pagination.total))
      .catch(() => {});
  }, [post.id, user?.id]);

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/profile/${currentPost.author.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Miloo Post by @${currentPost.author.username}`,
          text: currentPost.content,
          url: postUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(postUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const loadComments = () => {
    API.get<
      ApiResponse<{ comments: Comment[]; pagination: { total: number } }>
    >(`/comments/post/${post.id}`)
      .then((res) => {
        setComments(res.data.data.comments);
        setCommentsCount(res.data.data.pagination.total);
      })
      .catch(() => {});
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleLikeToggle = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (prevLiked) {
        await API.delete(`/likes/post/${post.id}`);
      } else {
        await API.post(`/likes/post/${post.id}`);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleOpenLikesModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await API.get<ApiResponse<{ likes: any[] }>>(
        `/likes/post/${post.id}`,
      );
      setLikesUsers(res.data.data.likes);
      setShowLikesModal(true);
    } catch {}
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.patch<ApiResponse<{ post: Post }>>(
        `/posts/${post.id}`,
        {
          content: editPostContent.trim(),
          imageUrl: editPostImage.trim() || null,
        },
      );
      setCurrentPost(res.data.data.post);
      setIsEditingPost(false);
    } catch {
      alert("Failed to update post");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/posts/${post.id}`);
      onPostDeleted?.(post.id);
    } catch {
      alert("Failed to delete post");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await API.post<ApiResponse<{ comment: Comment }>>(
        `/comments/post/${post.id}`,
        {
          content: commentText.trim(),
        },
      );
      setComments([...comments, res.data.data.comment]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
    } catch {
      alert("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => prev - 1);
    } catch {
      alert("Failed to delete comment");
    }
  };

  const handleSaveCommentEdit = async (commentId: number) => {
    if (!editCommentText.trim()) return;
    try {
      await API.patch(`/comments/${commentId}`, {
        content: editCommentText.trim(),
      });
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, content: editCommentText.trim() } : c,
        ),
      );
      setEditingCommentId(null);
    } catch {
      alert("Failed to update comment");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/profile/${currentPost.author.id}`}
          className="flex items-center space-x-3"
        >
          {currentPost.author.profileImage ? (
            <img
              src={currentPost.author.profileImage}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
              {currentPost.author.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex items-center space-x-1.5">
            <h4 className="font-bold text-gray-900 text-sm hover:underline">
              @{currentPost.author.username}
            </h4>
            <BadgeCheck className="w-4 h-4 text-indigo-500 fill-indigo-50" />
            <span className="text-gray-300 text-xs">•</span>
            <span className="text-xs text-gray-400 font-medium">
              {formatRelativeTime(currentPost.createdAt)}
            </span>
          </div>
        </Link>

        {user?.id === currentPost.userId && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditingPost(!isEditingPost)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
              title="Edit post"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeletePost}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content / Edit Form */}
      {isEditingPost ? (
        <form onSubmit={handleUpdatePost} className="mb-3 space-y-2">
          <textarea
            rows={3}
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          />
          {/* Image Preview & Clear */}
          {editPostImage && (
            <div className="relative w-fit">
              <img
                src={editPostImage}
                alt="Edit preview"
                className="h-28 w-auto rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => setEditPostImage("")}
                className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-50 text-gray-700">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload from device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditFileChange}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={editPostImage}
              onChange={(e) => setEditPostImage(e.target.value)}
              placeholder="Or paste Image URL"
              className="flex-1 p-1.5 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditingPost(false)}
              className="px-3 py-1 text-xs text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-gray-800 text-sm sm:text-base whitespace-pre-line mb-3">
            {expanded || currentPost.content.length <= LIMIT
              ? currentPost.content
              : currentPost.content.slice(0, LIMIT) + "..."}
            {currentPost.content.length > LIMIT && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-indigo-500 font-semibold text-xs hover:underline"
              >
                {expanded ? "less" : "more"}
              </button>
            )}
          </p>
          {currentPost.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 max-h-96">
              <img
                src={currentPost.imageUrl}
                alt=""
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
        <div className="flex items-center space-x-6">
          {/* Like */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleLikeToggle}
              className={`p-1.5 rounded-full hover:bg-rose-50 transition transform active:scale-125 ${
                isLiked ? "text-rose-600" : "hover:text-rose-600"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenLikesModal}
              className="text-xs font-semibold hover:underline"
            >
              {likesCount}
            </button>
          </div>

          {/* Comment */}
          <button
            onClick={handleToggleComments}
            className="flex items-center space-x-1.5 p-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">{commentsCount}</span>
          </button>
        </div>

        {/* Right Actions: Bookmark & Share */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-full hover:bg-amber-50 transition ${
              isBookmarked ? "text-amber-500" : "hover:text-amber-500"
            }`}
            title="Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`}
            />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-900 transition relative"
            title="Share / Copy Link"
          >
            <Share2 className="w-4 h-4" />
            {copiedToast && (
              <span className="absolute -top-7 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <form onSubmit={handleAddComment} className="flex space-x-2 mb-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-50 rounded-lg border border-gray-200"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className="text-xs sm:text-sm bg-gray-50 p-2.5 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1 mr-2">
                  <span className="font-semibold text-gray-900 mr-2">
                    @{c.author.username}:
                  </span>
                  {editingCommentId === c.id ? (
                    <div className="flex items-center space-x-1 mt-1">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="p-1 border rounded text-xs flex-1"
                      />
                      <button
                        onClick={() => handleSaveCommentEdit(c.id)}
                        className="text-green-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-gray-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-700">{c.content}</span>
                  )}
                </div>

                {user?.id === c.userId && editingCommentId !== c.id && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditCommentText(c.content);
                      }}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {showLikesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-white rounded-xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h4 className="font-bold text-sm text-gray-900">Liked by</h4>
              <button onClick={() => setShowLikesModal(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {likesUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center">
                  No likes yet
                </p>
              ) : (
                likesUsers.map((l, idx) => (
                  <Link
                    key={idx}
                    to={`/profile/${l.user.id}`}
                    className="flex items-center space-x-2 text-xs font-medium text-gray-800 hover:text-indigo-600"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      {l.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span>@{l.user.username}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};;
