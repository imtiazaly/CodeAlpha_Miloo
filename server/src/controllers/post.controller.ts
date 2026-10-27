import type { Request, Response, NextFunction } from "express";
import {
  createPost as createPostService,
  getAllPosts,
  getPostById,
} from "../services/post.service.js";

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
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const posts = await getAllPosts();

    res.status(200).json({
      success: true,
      data: { posts },
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
    const postId = Number(req.params.id);

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
