import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function useGenerateVideo() {
  const { setRefinedStory, selectedStoryBlock } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = async (
    prompt: string,
    imageBase64: string
  ): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, imageBase64 }),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && response.data) {
        const videoBase64 = response.data.videoBase64;
        setRefinedStory((rs) =>
          rs.map((r) =>
            r.index === selectedStoryBlock.index ? { ...r, videoBase64 } : r
          )
        );

        return true;
      } else {
        throw new Error("Invalid video response structure");
      }
    } catch (err: any) {
      console.error("Video generation error:", err);
      setError("Video generation failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateVideo,
    loading,
    error,
    setError,
  };
}
