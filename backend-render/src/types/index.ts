import type { ShortConfig } from "../remotion/types/shortCompositionType";

export type JobState =
  | {
      status: "queued";
      title: string;
      data: ShortConfig;
      cancel: () => void;
      createdAt: Date;
    }
  | {
      status: "in-progress";
      title: string;
      progress: number;
      data: ShortConfig;
      cancel: () => void;
      createdAt: Date;
      startedAt: Date;
    }
  | {
      status: "completed";
      title: string;
      videoUrl: string;
      data: ShortConfig;
      createdAt: Date;
      completedAt: Date;
      fileSize?: number;
    }
  | {
      status: "failed";
      title: string;
      error: Error;
      data: ShortConfig;
      createdAt: Date;
      failedAt: Date;
    };
