import { Comment, Post, User } from "../models/index.js";

const createError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

export const createComment = async (
  userId: number,
  postId: number,
  content: string,
) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw createError("Post not found", 404);
  }

  const comment = await Comment.create({
    userId,
    postId,
    content,
  });

  return Comment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
  });
};

export const getPostComments = async (
  postId: number,
  page: number,
  limit: number,
) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw createError("Post not found", 404);
  }

  return Comment.findAndCountAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });
};

export const updateComment = async (
  commentId: number,
  userId: number,
  content: string,
) => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw createError("Comment not found", 404);
  }

  if (comment.userId !== userId) {
    throw createError("You can only update your own comments", 403);
  }

  await comment.update({ content });

  return Comment.findByPk(commentId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
  });
};

export const deleteComment = async (
  commentId: number,
  userId: number,
): Promise<void> => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw createError("Comment not found", 404);
  }

  if (comment.userId !== userId) {
    throw createError("You can only delete your own comments", 403);
  }

  await comment.destroy();
};
