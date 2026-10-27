import { Post, User } from "../models/index.js";

const createError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

export const createPost = async (
  userId: number,
  data: { content: string; imageUrl?: string | null },
) => {
  const post = await Post.create({
    userId,
    content: data.content,
    imageUrl: data.imageUrl ?? null,
  });

  return Post.findByPk(post.id, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
  });
};

export const getAllPosts = async () => {
  return Post.findAll({
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getPostById = async (postId: number) => {
  const post = await Post.findByPk(postId, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
  });

  if (!post) {
    throw createError("Post not found", 404);
  }

  return post;
};

export const updatePost = async (
  postId: number,
  userId: number,
  data: { content?: string; imageUrl?: string | null },
) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw createError("Post not found", 404);
  }

  if (post.userId !== userId) {
    throw createError("You can only update your own posts", 403);
  }

  await post.update(data);

  return getPostById(postId);
};

export const deletePost = async (
  postId: number,
  userId: number,
): Promise<void> => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw createError("Post not found", 404);
  }

  if (post.userId !== userId) {
    throw createError("You can only delete your own posts", 403);
  }

  await post.destroy();
};
