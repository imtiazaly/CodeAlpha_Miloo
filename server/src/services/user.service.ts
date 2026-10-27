import { Op } from "sequelize";
import { User, Post, Follow } from "../models/index.js";

export const getUserProfile = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), {
      statusCode: 404,
    });
  }

  const [followersCount, followingCount, posts] = await Promise.all([
    Follow.count({
      where: { followingId: userId },
    }),
    Follow.count({
      where: { followerId: userId },
    }),
    Post.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    }),
  ]);

  return {
    ...user.toJSON(),
    followersCount,
    followingCount,
    posts,
  };
};

export const updateUserProfile = async (
  userId: number,
  data: {
    username?: string;
    bio?: string | null;
    profileImage?: string | null;
  },
) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw Object.assign(new Error("User not found"), {
      statusCode: 404,
    });
  }

  if (data.username !== undefined) {
    const existingUser = await User.findOne({
      where: {
        username: data.username,
        id: { [Op.ne]: userId },
      },
    });

    if (existingUser) {
      throw Object.assign(new Error("Username already exists"), {
        statusCode: 409,
      });
    }
  }

  await user.update(data);

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  return updatedUser;
};

export const searchUsers = async (
  username: string,
  currentUserId: number,
  page: number,
  limit: number,
) => {
  const result = await User.findAndCountAll({
    where: {
      username: {
        [Op.like]: `%${username}%`,
      },
      id: {
        [Op.ne]: currentUserId,
      },
    },
    attributes: ["id", "username", "bio", "profileImage", "createdAt"],
    order: [["username", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return result;
};