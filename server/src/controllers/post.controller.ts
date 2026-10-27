import type { Request, Response, NextFunction } from "express";
import {
  createPost as createPostService,
  getAllPosts,
  getPersonalizedFeed,
  getPostById,
  updatePost as updatePostService,
  deletePost as deletePostService,
} from "../services/post.service.js";

const parsePostId = (value: string | string[]): number =>
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

export const createPost = async (
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

    const post = await createPostService(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pagination = parsePagination(req, res);
    if (!pagination) return;

    const { page, limit } = pagination;
    const result = await getAllPosts(page, limit);

    res.status(200).json({
      success: true,
      data: {
        posts: result.rows,
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

export const fetchPostById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postId = parsePostId(req.params.id!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await getPostById(postId);

    res.status(200).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const editPost = async (
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

    const postId = parsePostId(req.params.id!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await updatePostService(postId, req.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const removePost = async (
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

    const postId = parsePostId(req.params.id!);

    if (!Number.isInteger(postId) || postId < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    await deletePostService(postId, req.userId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchPersonalizedFeed = async (
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

    const pagination = parsePagination(req, res);
    if (!pagination) return;

    const { page, limit } = pagination;
    const result = await getPersonalizedFeed(req.userId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        posts: result.rows,
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
