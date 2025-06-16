import { Eye } from "lucide-react";
import type { Job } from "../types";

interface JobsListProps {
  jobs: Job[];
  onCancelJob: (jobId: string) => void;
  onDeleteAll: () => void;
}

export function JobsList({ jobs, onCancelJob, onDeleteAll }: JobsListProps) {
  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Render Jobs</h2>
        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
          {jobs.length} jobs
        </span>
      </div>
      <div className="flex justify-end">
        <button
          className="px-3 mb-2 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
          onClick={onDeleteAll}
          aria-label="Delete all jobs"
        >
          Delete All
        </button>
      </div>
      <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium">
                Job {i + 1}
              </span>
              <div className="flex justify-between flex-1">
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  <b>{job.title}</b> - {job.status}
                </p>
                {job.status === "completed" ? (
                  <a
                    href={job.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-white text-sm"
                    aria-label={`View video for ${job.title}`}
                  >
                    View Video
                  </a>
                ) : (
                  <button
                    onClick={() => onCancelJob(job.id)}
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
                    aria-label={`Cancel job ${job.title}`}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
