// src/middleware/validation.ts
import { Request, Response, NextFunction } from "express";

export const validateRenderRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { shortConfig, title } = req.body;

    // Validate shortConfig
    if (!shortConfig) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Please provide a valid shortConfig object",
        data: null,
      });
      return;
    }

    if (!shortConfig.scenes || !Array.isArray(shortConfig.scenes)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "shortConfig.scenes must be an array",
        data: null,
      });
      return;
    }

    if (shortConfig.scenes.length === 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "At least one scene is required",
        data: null,
      });
      return;
    }

    // Validate title
    if (!title) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Please provide a title",
        data: null,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Validation error",
      data: null,
    });
  }
};
