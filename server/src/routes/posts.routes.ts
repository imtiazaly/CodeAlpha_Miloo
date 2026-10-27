import { Router } from "express";
import {
  createPost,
  fetchAllPosts,
  fetchPostById,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPostSchema } from "../validations/post.schema.js";

const router = Router();

router.get("/", fetchAllPosts);
router.get("/:id", fetchPostById);
router.post("/", authMiddleware, validate(createPostSchema), createPost);

export default router;
