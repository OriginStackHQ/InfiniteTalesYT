import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { Scene } from "../types";

export function useGenerateVoiceCaption() {
  const { refinedStory, selectedVoice, scenes, setScenes } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVoiceCaption = async (scene: Scene) => {
    setError(null);

    if (!refinedStory || refinedStory.length === 0) {
      setError("Please refine the story first.");
      return;
    }
    if (!selectedVoice) {
      setError("Please select a voice.");
      return;
    }

    if (!scene.text.trim()) {
      setError("Scene text is empty.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        narrator: selectedVoice,
        scene: scene,
      };

      const res = await fetch(
        "http://localhost:8000/generate-voice-and-caption",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && response.data) {
        const updatedScene = response.data.scene as Scene;
        const updatedScenes = scenes.map((s) => {
          if (s.index === updatedScene.index) {
            return updatedScene;
          }
          return s;
        });

        setScenes(updatedScenes);
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

  return {
    generateVoiceCaption,
    loading,
    error,
    setError,
  };
}
