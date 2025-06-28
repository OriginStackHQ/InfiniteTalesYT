// src/render-queue.ts
import {
  makeCancelSignal,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { JobState } from "./types";
import { ShortConfig } from "./remotion/types/shortCompositionType";

const compositionId = "ShortComposition";

export const makeRenderQueue = ({
  port,
  serveUrl,
  rendersDir,
}: {
  port: number;
  serveUrl: string;
  rendersDir: string;
}) => {
  const jobs = new Map<string, JobState>();
  let queue: Promise<unknown> = Promise.resolve();

  const processRender = async (jobId: string) => {
    const job = jobs.get(jobId);
    if (!job) {
      throw new Error(`Render job ${jobId} not found`);
    }

    const { cancel, cancelSignal } = makeCancelSignal();

    jobs.set(jobId, {
      progress: 0,
      title: job.title,
      status: "in-progress",
      cancel: cancel,
      data: job.data,
      createdAt: job.createdAt,
      startedAt: new Date(),
    });

    try {
      const shortConfig = job.data;
      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps: shortConfig,
      });

      const safeTitle = job.title.replace(/[^a-z0-9_\- ]/gi, "_");
      const outputLocation = path.join(rendersDir, `${safeTitle}-${jobId}.mp4`);

      await renderMedia({
        cancelSignal,
        serveUrl,
        composition,
        inputProps: shortConfig,
        codec: "h264",
        // codec: "prores",
        // pixelFormat: "yuva444p10le",
        // proResProfile: "4444",
        // imageFormat: "png",
        onProgress: (progress) => {
          console.info(
            `${jobId} render progress:`,
            Math.round(progress.progress * 100) + "%"
          );
          const currentJob = jobs.get(jobId);
          if (currentJob && currentJob.status === "in-progress") {
            jobs.set(jobId, {
              ...currentJob,
              progress: progress.progress,
            });
          }
        },
        outputLocation,
      });

      // Get file size
      const stats = await fs.stat(outputLocation);
      const fileSize = stats.size;

      jobs.set(jobId, {
        status: "completed",
        title: job.title,
        videoUrl: `http://localhost:${port}/files/${safeTitle}-${jobId}.mp4`,
        data: job.data,
        createdAt: job.createdAt,
        completedAt: new Date(),
        fileSize,
      });

      console.info(`✅ Job ${jobId} completed successfully`);
    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error);
      jobs.set(jobId, {
        status: "failed",
        title: job.title,
        error: error as Error,
        data: job.data,
        createdAt: job.createdAt,
        failedAt: new Date(),
      });
    }
  };

  const queueRender = async ({
    jobId,
    title,
    data,
  }: {
    jobId: string;
    title: string;
    data: ShortConfig;
  }) => {
    jobs.set(jobId, {
      status: "queued",
      title,
      data,
      createdAt: new Date(),
      cancel: () => {
        jobs.delete(jobId);
      },
    });

    queue = queue.then(() => processRender(jobId));
  };

  function createJob(data: ShortConfig, title: string) {
    const jobId = randomUUID();
    console.info(`🎬 Creating new render job: ${jobId}`);
    queueRender({ jobId, title, data });
    return jobId;
  }

  const deleteAllJobs = () => {
    jobs.clear();
    fs.rm(rendersDir, { recursive: true, force: true });
    console.info("📁 Deleted renders directory");
  };

  // Run cleanup every hour
  setInterval(deleteAllJobs, 60 * 60 * 1000);

  return {
    createJob,
    jobs,
    deleteAllJobs,
  };
};
