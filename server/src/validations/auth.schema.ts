import * as yup from "yup";

export const registerSchema = yup.object({
  username: yup
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .required("Username is required"),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email address")
    .max(255)
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email address")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});
