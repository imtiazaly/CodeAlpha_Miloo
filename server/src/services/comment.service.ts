import { Comment, Post, User } from "../models/index.js";

export const createComment = async (
  userId: number,
  postId: number,
  content: string,
) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw Object.assign(new Error("Post not found"), {
      statusCode: 404,
    });
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

export const getPostComments = async (postId: number) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw Object.assign(new Error("Post not found"), {
      statusCode: 404,
    });
  }

  return Comment.findAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};

export const deleteComment = async (
  commentId: number,
  userId: number,
): Promise<void> => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw Object.assign(new Error("Comment not found"), {
      statusCode: 404,
    });
  }

  if (comment.userId !== userId) {
    throw Object.assign(new Error("You can only delete your own comments"), {
      statusCode: 403,
    });
  }

  await comment.destroy();
};
