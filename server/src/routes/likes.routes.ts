import { Router } from "express";
import {
  likePost,
  unlikePost,
  fetchPostLikes,
} from "../controllers/like.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/post/:postId", fetchPostLikes);
router.post("/post/:postId", authMiddleware, likePost);
router.delete("/post/:postId", authMiddleware, unlikePost);

export default router;
