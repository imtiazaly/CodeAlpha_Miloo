import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  searchUsersController,
  getUserProfileById,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
  searchUsersSchema,
} from "../validations/user.schema.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfile);

router.patch(
  "/me",
  authMiddleware,
  validate(updateProfileSchema),
  updateMyProfile,
);

router.get(
  "/search",
  authMiddleware,
  validate(searchUsersSchema, "query"),
  searchUsersController,
);

router.get("/:id", authMiddleware, getUserProfileById);

export default router;
