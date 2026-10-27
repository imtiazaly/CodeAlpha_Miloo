import type { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error.statusCode ?? 500;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : error.message,
  });
};
