// src/routes/renders.ts
import { Router, Request, Response } from "express";
import { makeRenderQueue } from "../render-queue";
import { validateRenderRequest } from "../middleware/validation";

export const createRenderRoutes = (
  queue: ReturnType<typeof makeRenderQueue>
) => {
  const router = Router();

  // List all jobs (with pagination) - MUST come before /:jobId route
  router.get("/", (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      let jobsArray = Array.from(queue.jobs.entries()).map(([id, job]) => ({
        id,
        status: job.status,
        title: job.title,
        createdAt: job.createdAt,
        ...(job.status === "in-progress" && {
          progress: (job as any).progress,
        }),
        ...(job.status === "completed" && {
          videoUrl: (job as any).videoUrl,
          completedAt: (job as any).completedAt,
          fileSize: (job as any).fileSize,
        }),
        ...(job.status === "failed" && {
          error: (job as any).error.message,
          failedAt: (job as any).failedAt,
        }),
      }));

      // Filter by status if provided
      if (status) {
        jobsArray = jobsArray.filter((job) => job.status === status);
      }

      // Sort by creation date (newest first)
      jobsArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Pagination
      const total = jobsArray.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const jobs = jobsArray.slice(start, start + limit);
      res.json({
        success: true,
        statusCode: 200,
        message: "Jobs listed successfully",
        data: {
          jobs,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error listing jobs:", error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to list jobs",
        data: null,
      });
    }
  });

  // Delete all jobs
  router.delete("/", (req: Request, res: Response) => {
    try {
      queue.deleteAllJobs();
      res.json({
        success: true,
        statusCode: 200,
        message: "All jobs deleted successfully",
        data: null,
      });
    } catch (error) {
      console.error("Error deleting all jobs:", error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to delete all jobs",
        data: null,
      });
    }
  });

  // Create a new render job
  router.post(
    "/",
    validateRenderRequest,
    async (req: Request, res: Response) => {
      try {
        const jobId = queue.createJob(req.body.shortConfig, req.body.title);
        res.json({
          success: true,
          statusCode: 201,
          message: "Render job created successfully",
          data: { jobId },
        });
      } catch (error) {
        console.error("Error creating render job:", error);
        res.status(500).json({
          success: false,
          statusCode: 500,
          message: "Failed to create render job",
          data: null,
        });
      }
    }
  );

  // Get job status by ID
  router.get("/:jobId", (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;

      if (!jobId || typeof jobId !== "string") {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Invalid job ID",
          data: null,
        });
      }

      const job = queue.jobs.get(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: `No job found with ID: ${jobId}`,
          data: null,
        });
      }

      // Don't expose internal cancel function
      const { cancel, ...jobData } = job as any;

      res.json({
        success: true,
        job: {
          id: jobId,
          ...jobData,
        },
      });
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to get job status",
        data: null,
      });
    }
  });

  // Cancel a job by ID
  router.delete("/:jobId", (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;

      if (!jobId || typeof jobId !== "string") {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Job ID must be a valid string",
          data: null,
        });
      }

      const job = queue.jobs.get(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: `No job found with ID: ${jobId}`,
          data: null,
        });
      }

      if (job.status !== "queued" && job.status !== "in-progress") {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `Job is in ${job.status} state and cannot be cancelled`,
          data: null,
        });
      }

      job.cancel();
      res.json({
        success: true,
        statusCode: 200,
        message: "Job cancelled successfully",
        data: null,
      });
    } catch (error) {
      console.error("Error cancelling job:", error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to cancel job",
        data: null,
      });
    }
  });

  return router;
};
