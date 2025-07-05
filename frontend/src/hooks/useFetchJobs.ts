import { useState, useEffect } from "react";
import type { Job } from "../types";
import { useAppContext } from "../context/AppContext";

export function useFetchJobs() {
  const { jobs, setJobs } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/renders/");
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const body = await res.json();
      if (body.success && Array.isArray(body.data.jobs)) {
        setJobs(body.data.jobs as Job[]);
      }
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError("Could not fetch jobs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/renders/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success) {
        setJobs((js) =>
          js.map((j) => (j.id === jobId ? { ...j, status: "failed" } : j))
        );
      }
    } catch (err: any) {
      console.error("Failed to cancel job:", err);
      setError("Could not cancel job: " + err.message);
    }
  };

  const deleteAllJobs = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/renders/", {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success) {
        setJobs([]);
      }
    } catch (err: any) {
      console.error("Failed to delete all jobs:", err);
      setError("Could not delete all jobs: " + err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 180_000);
    return () => clearInterval(interval);
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    cancelJob,
    deleteAllJobs,
    setError,
  };
}
