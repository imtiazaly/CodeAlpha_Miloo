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
