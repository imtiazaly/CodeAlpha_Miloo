import * as yup from "yup";

export const createPostSchema = yup.object({
  content: yup
    .string()
    .trim()
    .max(5000, "Post cannot exceed 5000 characters")
    .required("Post content is required"),

  imageUrl: yup
    .string()
    .url("Invalid image URL")
    .max(255)
    .nullable()
    .optional(),
});

export const updatePostSchema = yup
  .object({
    content: yup
      .string()
      .trim()
      .min(1, "Post content cannot be empty")
      .max(5000, "Post cannot exceed 5000 characters")
      .optional(),

    imageUrl: yup
      .string()
      .url("Invalid image URL")
      .max(255)
      .nullable()
      .optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field is required",
    (value) =>
      value !== undefined &&
      ["content", "imageUrl"].some((key) =>
        Object.prototype.hasOwnProperty.call(value, key),
      ),
  );
