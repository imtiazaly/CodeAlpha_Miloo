import { User } from "../models/index.js";

export const getUserProfile = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), {
      statusCode: 404,
    });
  }

  return user;
};
