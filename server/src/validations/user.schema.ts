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

    profileImage: yup.string().nullable().optional(),
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
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(10),
});
