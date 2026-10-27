import { Router } from "express";
import {
  createComment,
  fetchPostComments,
  removeComment,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema } from "../validations/comment.schema.js";

const router = Router();

router.get("/post/:postId", fetchPostComments);
router.post(
  "/post/:postId",
  authMiddleware,
  validate(createCommentSchema),
  createComment,
);
router.delete("/:id", authMiddleware, removeComment);

export default router;
