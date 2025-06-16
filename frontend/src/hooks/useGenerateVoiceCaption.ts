import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { Scene } from "../types";

export function useGenerateVoiceCaption() {
  const {
    refinedStory,
    selectedVoice,
    setScenes,
    setShortConfig,
    defaultShortConfig,
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVoiceCaption = async () => {
    setError(null);
    setScenes([]);
    setShortConfig(defaultShortConfig);

    if (!refinedStory || refinedStory.length === 0) {
      setError("Please refine the story first.");
      return;
    }
    if (!selectedVoice) {
      setError("Please select a voice.");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload: narrator and scenes without imageBase64
      const payload = {
        narrator: selectedVoice,
        scenes: refinedStory.map(({ imageBase64, ...rest }) => rest),
      };

      const res = await fetch("http://localhost:8000/voice-and-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && Array.isArray(response.data.scenes)) {
        setScenes(response.data.scenes as Scene[]);
      } else {
        throw new Error("Invalid voice-caption response structure");
      }
    } catch (err: any) {
      console.error("Voice+Caption error:", err);
      setError("Voice+Caption failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return { generateVoiceCaption, loading, error, setError };
}
