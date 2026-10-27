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

type JwtConfig = {
  secret: string;
  expiresIn: NonNullable<jwt.SignOptions["expiresIn"]>;
};

const getJwtConfig = (): JwtConfig => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === "replace_with_a_long_random_secret") {
    throw new Error("JWT_SECRET must be configured in .env");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as NonNullable<
    jwt.SignOptions["expiresIn"]
  >;

  try {
    jwt.sign({ userId: 1 }, secret, { expiresIn });
  } catch {
    throw new Error("JWT_EXPIRES_IN must be a valid JWT duration");
  }

  return { secret, expiresIn };
};

const generateToken = (userId: number, config: JwtConfig): string => {
  return jwt.sign({ userId }, config.secret, {
    expiresIn: config.expiresIn,
  });
};

export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const jwtConfig = getJwtConfig();

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
    token: generateToken(user.id, jwtConfig),
  };
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const jwtConfig = getJwtConfig();

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
    token: generateToken(user.id, jwtConfig),
  };
};
