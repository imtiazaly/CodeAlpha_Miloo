import { Post, User, Follow } from "../models/index.js";

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

export const getAllPosts = async (page: number, limit: number) => {
  return Post.findAndCountAll({
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
};

export const getPersonalizedFeed = async (
  userId: number,
  page: number,
  limit: number,
) => {
  const followRelations = await Follow.findAll({
    where: { followerId: userId },
    attributes: ["followingId"],
  });

  const followingIds = followRelations.map((relation) => relation.followingId);

  if (followingIds.length === 0) {
    return { count: 0, rows: [] };
  }

  return Post.findAndCountAll({
    where: {
      userId: followingIds,
    },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
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
