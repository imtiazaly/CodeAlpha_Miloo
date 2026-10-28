import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import type { ApiResponse, Post, Comment } from "../types";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load likes and comments count on mount
  useEffect(() => {
    API.get<
      ApiResponse<{
        likes: Array<{ userId: number }>;
        pagination: { total: number };
      }>
    >(`/likes/post/${post.id}`)
      .then((res) => {
        setLikesCount(res.data.data.pagination.total);
        const liked = res.data.data.likes.some((l) => l.userId === user?.id);
        setIsLiked(liked);
      })
      .catch(() => {});

    API.get<ApiResponse<{ pagination: { total: number } }>>(
      `/comments/post/${post.id}?limit=1`,
    )
      .then((res) => {
        setCommentsCount(res.data.data.pagination.total);
      })
      .catch(() => {});
  }, [post.id, user?.id]);

  // Load comments
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

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleLikeToggle = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic UI update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (prevLiked) {
        await API.delete(`/likes/post/${post.id}`);
      } else {
        await API.post(`/likes/post/${post.id}`);
      }
    } catch {
      // Revert on failure
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
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

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/posts/${post.id}`);
      onPostDeleted?.(post.id);
    } catch {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/profile/${post.author.id}`}
          className="flex items-center space-x-3"
        >
          {post.author.profileImage ? (
            <img
              src={post.author.profileImage}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm hover:underline">
              @{post.author.username}
            </h4>
            <span className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Link>

        {user?.id === post.userId && (
          <button
            onClick={handleDeletePost}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-800 text-sm sm:text-base whitespace-pre-line mb-3">
        {post.content}
      </p>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 max-h-96">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="w-full h-auto object-cover"
            onError={(e) => ((e.target as HTMLElement).style.display = "none")}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6 pt-2 border-t border-gray-100 text-sm text-gray-500">
        <button
          onClick={handleLikeToggle}
          className={`flex items-center space-x-1.5 font-medium transition ${
            isLiked ? "text-rose-600" : "hover:text-rose-600"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-600" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center space-x-1.5 font-medium hover:text-indigo-600 transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>
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
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="text-xs sm:text-sm bg-gray-50 p-2.5 rounded-lg"
                >
                  <span className="font-semibold text-gray-900 mr-2">
                    @{c.author.username}:
                  </span>
                  <span className="text-gray-700">{c.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};;
