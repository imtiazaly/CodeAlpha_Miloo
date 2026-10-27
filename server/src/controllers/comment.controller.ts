import type { Request, Response, NextFunction } from "express";
import {
  createComment as createCommentService,
  getPostComments,
  deleteComment as deleteCommentService,
} from "../services/comment.service.js";

export const createComment = async (
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

    const postId = Number(req.params.postId);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const comment = await createCommentService(
      req.userId,
      postId,
      req.body.content,
    );

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

export const fetchPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postId = Number(req.params.postId);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const comments = await getPostComments(postId);

    res.status(200).json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

export const removeComment = async (
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

    const commentId = Number(req.params.id);

    if (!Number.isInteger(commentId) || commentId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    await deleteCommentService(commentId, req.userId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
