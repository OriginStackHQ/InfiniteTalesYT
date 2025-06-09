// src/app.ts
import express from "express";
import cors from "cors";
import path from "node:path";
import { makeRenderQueue } from "./render-queue";
import { createRenderRoutes } from "./routes/renders";

export function setupApp({ remotionBundleUrl }: { remotionBundleUrl: string }) {
  const app = express();
  const rendersDir = path.resolve("renders");
  const port = Number(process.env.PORT) || 3001;

  // Create render queue
  const queue = makeRenderQueue({
    port,
    serveUrl: remotionBundleUrl,
    rendersDir,
  });

  // Basic middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "Video render service is running",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount render API routes
  app.use("/api/renders", createRenderRoutes(queue));

  // Serve static rendered files
  app.use("/files", express.static(rendersDir));

  // 404 handler
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: `The route ${req.method} ${req.originalUrl} does not exist`,
      data: {
        availableRoutes: [
          "GET /health",
          "POST /renders",
          "GET /renders/:jobId",
          "DELETE /renders/:jobId",
          "GET /renders",
        ],
      },
    });
  });

  // Error handler
  app.use(
    (
      error: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.error("Unhandled error:", error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        data: null,
      });
    }
  );

  return app;
}
