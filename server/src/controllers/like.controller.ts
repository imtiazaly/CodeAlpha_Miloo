import type { Request, Response, NextFunction } from "express";
import {
  likePost as likePostService,
  unlikePost as unlikePostService,
  getPostLikes,
} from "../services/like.service.js";

const parsePostId = (value: string | string[]): number =>
  Number(Array.isArray(value) ? value[0] : value);

export const likePost = async (
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

    const postId = parsePostId(req.params.postId!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const like = await likePostService(req.userId, postId);

    res.status(201).json({
      success: true,
      message: "Post liked successfully",
      data: { like },
    });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (
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

    const postId = parsePostId(req.params.postId!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    await unlikePostService(req.userId, postId);

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchPostLikes = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postId = parsePostId(req.params.postId!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

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
        message:
          "Page must be a positive integer and limit must be between 1 and 100",
      });
      return;
    }

    const result = await getPostLikes(postId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        likes: result.rows,
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
