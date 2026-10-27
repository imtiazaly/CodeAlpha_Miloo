import type { Request, Response, NextFunction } from "express";
import {
  createComment as createCommentService,
  getPostComments,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
} from "../services/comment.service.js";

const parseId = (value: string | string[]): number =>
  Number(Array.isArray(value) ? value[0] : value);

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

    const postId = parseId(req.params.postId!);

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
    const postId = parseId(req.params.postId!);

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

    const result = await getPostComments(postId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        comments: result.rows,
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

export const editComment = async (
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

    const commentId = parseId(req.params.id!);

    if (!Number.isInteger(commentId) || commentId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    const comment = await updateCommentService(
      commentId,
      req.userId,
      req.body.content,
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: { comment },
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

    const commentId = parseId(req.params.id!);

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
