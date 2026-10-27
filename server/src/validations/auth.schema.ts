import * as yup from "yup";

const isBcryptPasswordLengthValid = (password: string): boolean =>
  Buffer.byteLength(password, "utf8") <= 72;

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
    .test(
      "bcrypt-max-bytes",
      "Password cannot exceed 72 bytes",
      (value) => value === undefined || isBcryptPasswordLengthValid(value),
    )
    .required("Password is required"),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email address")
    .required("Email is required"),

  password: yup
    .string()
    .test(
      "bcrypt-max-bytes",
      "Password cannot exceed 72 bytes",
      (value) => value === undefined || isBcryptPasswordLengthValid(value),
    )
    .required("Password is required"),
});
