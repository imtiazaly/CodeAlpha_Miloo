import * as yup from "yup";

export const createPostSchema = yup.object({
  content: yup
    .string()
    .trim()
    .max(5000, "Post cannot exceed 5000 characters")
    .required("Post content is required"),

  imageUrl: yup.string().nullable().optional(),
});

export const updatePostSchema = yup
  .object({
    content: yup
      .string()
      .trim()
      .min(1, "Post content cannot be empty")
      .max(5000, "Post cannot exceed 5000 characters")
      .optional(),

    imageUrl: yup.string().nullable().optional(),
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
