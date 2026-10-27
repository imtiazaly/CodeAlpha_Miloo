import { Like, Post, User } from "../models/index.js";

export const likePost = async (userId: number, postId: number) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw Object.assign(new Error("Post not found"), {
      statusCode: 404,
    });
  }

  const [like, created] = await Like.findOrCreate({
    where: { userId, postId },
    defaults: { userId, postId },
  });

  if (!created) {
    throw Object.assign(new Error("Post already liked"), {
      statusCode: 409,
    });
  }

  return like;
};

export const unlikePost = async (
  userId: number,
  postId: number,
): Promise<void> => {
  const like = await Like.findOne({ where: { userId, postId } });

  if (!like) {
    throw Object.assign(new Error("Like not found"), {
      statusCode: 404,
    });
  }

  await like.destroy();
};

export const getPostLikes = async (
  postId: number,
  page: number,
  limit: number,
) => {
  const post = await Post.findByPk(postId);

  if (!post) {
    throw Object.assign(new Error("Post not found"), {
      statusCode: 404,
    });
  }

  return Like.findAndCountAll({
    where: { postId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
};
