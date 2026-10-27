import { Router } from "express";
import {
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
} from "../controllers/follow.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/:userId", authMiddleware, followUser);
router.delete("/:userId", authMiddleware, unfollowUser);
router.get("/:userId/followers", fetchFollowers);
router.get("/:userId/following", fetchFollowing);

export default router;
