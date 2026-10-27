import * as yup from "yup";

export const updateProfileSchema = yup
  .object({
    username: yup
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .optional(),

    bio: yup
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters")
      .nullable()
      .optional(),

    profileImage: yup
      .string()
      .trim()
      .url("Invalid profile image URL")
      .max(255, "Profile image URL cannot exceed 255 characters")
      .nullable()
      .optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field is required",
    (value) =>
      value !== undefined &&
      ["username", "bio", "profileImage"].some((key) =>
        Object.prototype.hasOwnProperty.call(value, key),
      ),
  );

export const searchUsersSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(1, "Search username is required")
    .max(30, "Search username cannot exceed 30 characters")
    .required("Username is required"),
});