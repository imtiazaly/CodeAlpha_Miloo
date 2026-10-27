import * as yup from "yup";

export const createCommentSchema = yup.object({
  content: yup
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .required("Comment content is required"),
});

export const updateCommentSchema = yup.object({
  content: yup
    .string()
    .trim()
    .max(2000, "Comment cannot exceed 2000 characters")
    .required("Comment content is required"),
});
