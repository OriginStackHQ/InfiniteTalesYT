import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { StoryBlock } from "../types";

export function useRefineStory() {
  const {
    defaultShortConfig,
    storyJson,
    setRefinedStory,
    setShortConfig,
    voices,
    setSelectedVoice,
    setParsedStory,
  } = useAppContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refineStory = async () => {
    setError(null);
    setRefinedStory([]);
    setShortConfig(defaultShortConfig);

    let payload: any;
    try {
      payload = JSON.parse(storyJson);
      setParsedStory(payload);
    } catch (err: any) {
      console.error("JSON parse error:", err);
      setError("Invalid JSON in story editor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/refine-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && Array.isArray(response.data.storyBlocks)) {
        setRefinedStory(response.data.storyBlocks as StoryBlock[]);
        if (voices && voices.length > 0) {
          setSelectedVoice(voices[0].VoiceId);
        }
      } else {
        throw new Error("Invalid scene response structure");
      }
    } catch (err: any) {
      console.error("Refine error:", err);
      setError("Refine failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    refineStory,
    loading,
    error,
    setError,
  };
}
