import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User } from "../models/index.js";

type AuthResult = {
  user: {
    id: number;
    username: string;
    email: string;
    bio: string | null;
    profileImage: string | null;
    createdAt?: Date;
  };
  token: string;
};

const createError = (
  message: string,
  statusCode: number,
): Error & { statusCode: number } =>
  Object.assign(new Error(message), { statusCode });

const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === "replace_with_a_long_random_secret") {
    throw new Error("JWT_SECRET must be configured in .env");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (expiresIn) {
    return jwt.sign({ userId }, secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"] & {},
    });
  }

  return jwt.sign({ userId }, secret, { expiresIn: "1d" });
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username: data.username }, { email: data.email }],
    },
  });

  if (existingUser) {
    throw createError("Username or email already exists", 409);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  if (!Number.isInteger(saltRounds) || saltRounds < 10 || saltRounds > 15) {
    throw new Error("BCRYPT_SALT_ROUNDS must be an integer between 10 and 15");
  }
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);

  const user = await User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    token: generateToken(user.id),
  };
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const user = await User.findOne({
    where: { email: data.email },
  });

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw createError("Invalid email or password", 401);
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
    token: generateToken(user.id),
  };
};
