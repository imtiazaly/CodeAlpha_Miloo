import { Follow, User } from "../models/index.js";

const createError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

export const followUser = async (followerId: number, followingId: number) => {
  if (followerId === followingId) {
    throw createError("You cannot follow yourself", 400);
  }

  const targetUser = await User.findByPk(followingId);

  if (!targetUser) {
    throw createError("User not found", 404);
  }

  const existingFollow = await Follow.findOne({
    where: { followerId, followingId },
  });

  if (existingFollow) {
    throw createError("You already follow this user", 409);
  }

  return Follow.create({ followerId, followingId });
};

export const unfollowUser = async (
  followerId: number,
  followingId: number,
): Promise<void> => {
  const follow = await Follow.findOne({
    where: { followerId, followingId },
  });

  if (!follow) {
    throw createError("You do not follow this user", 404);
  }

  await follow.destroy();
};

export const getFollowers = async (
  userId: number,
  page: number,
  limit: number,
) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return Follow.findAndCountAll({
    where: { followingId: userId },
    include: [
      {
        model: User,
        as: "follower",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
};

export const getFollowing = async (
  userId: number,
  page: number,
  limit: number,
) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  return Follow.findAndCountAll({
    where: { followerId: userId },
    include: [
      {
        model: User,
        as: "following",
        attributes: ["id", "username", "profileImage"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
};