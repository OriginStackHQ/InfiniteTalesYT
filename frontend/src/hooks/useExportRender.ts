import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useFetchJobs } from "./useFetchJobs";

export function useExportRender() {
  const { parsedStory, shortConfig } = useAppContext();
  const { fetchJobs } = useFetchJobs();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportRender = async () => {
    setError(null);
    if (!shortConfig) {
      setError("No video configuration available to render.");
      return;
    }
    if (!parsedStory.topic) {
      setError("No topic found in story configuration.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/renders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortConfig, title: parsedStory.topic }),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && response.data) {
        // After successful export, refresh job list
        fetchJobs();
      } else {
        throw new Error("Invalid render response structure");
      }
    } catch (err: any) {
      console.error("Render error:", err);
      setError("Render failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return { exportRender, loading, error, setError };
}
