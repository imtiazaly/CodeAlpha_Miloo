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

    const likes = await getPostLikes(postId);

    res.status(200).json({
      success: true,
      data: { likes },
    });
  } catch (error) {
    next(error);
  }
};
