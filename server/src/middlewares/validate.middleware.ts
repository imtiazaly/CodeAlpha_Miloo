import type { Request, Response, NextFunction } from "express";
import type { AnyObjectSchema } from "yup";

type RequestSource = "body" | "params" | "query";

export const validate = (
  schema: AnyObjectSchema,
  source: RequestSource = "body",
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = await schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (source === "query") {
        Object.defineProperty(req, "query", {
          value: validatedData,
          writable: true,
          configurable: true,
        });
      } else {
        req[source] = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof Error && "inner" in error) {
        const validationError = error as Error & {
          inner: Array<{ path?: string; message: string }>;
        };

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationError.inner.map(({ path, message }) => ({
            field: path,
            message,
          })),
        });
        return;
      }

      next(error);
    }
  };
};
