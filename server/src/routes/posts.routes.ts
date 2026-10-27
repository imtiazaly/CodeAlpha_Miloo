import { Router } from "express";
import {
  createPost,
  fetchAllPosts,
  fetchPostById,
  editPost,
  removePost,
  fetchPersonalizedFeed,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../validations/post.schema.js";

const router = Router();

router.get("/", fetchAllPosts);
router.get("/feed", authMiddleware, fetchPersonalizedFeed);
router.get("/:id", fetchPostById);

router.post("/", authMiddleware, validate(createPostSchema), createPost);

router.patch("/:id", authMiddleware, validate(updatePostSchema), editPost);

router.delete("/:id", authMiddleware, removePost);

export default router;
