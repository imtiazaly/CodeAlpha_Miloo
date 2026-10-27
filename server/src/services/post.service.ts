import { Post, User } from "../models/index.js";

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
    throw Object.assign(new Error("Post not found"), {
      statusCode: 404,
    });
  }

  return post;
};
