import type { Request, Response, NextFunction } from "express";
import {
  followUser as followUserService,
  unfollowUser as unfollowUserService,
  getFollowers,
  getFollowing,
} from "../services/follow.service.js";

const parseUserId = (value: string | string[]): number =>
  Number(Array.isArray(value) ? value[0] : value);

const parsePagination = (
  req: Request,
  res: Response,
): { page: number; limit: number } | null => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    res.status(400).json({
      success: false,
      message: "Page must be positive and limit must be between 1 and 100",
    });

    return null;
  }

  return { page, limit };
};

export const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const followingId = parseUserId(req.params.userId!);

    if (!Number.isInteger(followingId) || followingId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const follow = await followUserService(req.userId, followingId);

    res.status(201).json({
      success: true,
      message: "User followed successfully",
      data: { follow },
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const followingId = parseUserId(req.params.userId!);

    if (!Number.isInteger(followingId) || followingId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    await unfollowUserService(req.userId, followingId);

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = parseUserId(req.params.userId!);

    if (!Number.isInteger(userId) || userId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const pagination = parsePagination(req, res);
    if (!pagination) return;

    const { page, limit } = pagination;
    const result = await getFollowers(userId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        followers: result.rows,
        pagination: {
          total: result.count,
          page,
          limit,
          totalPages: Math.ceil(result.count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const fetchFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = parseUserId(req.params.userId!);

    if (!Number.isInteger(userId) || userId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const pagination = parsePagination(req, res);
    if (!pagination) return;

    const { page, limit } = pagination;
    const result = await getFollowing(userId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        following: result.rows,
        pagination: {
          total: result.count,
          page,
          limit,
          totalPages: Math.ceil(result.count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
