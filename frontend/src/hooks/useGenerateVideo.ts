import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function useGenerateVideo() {
  const { setRefinedStory, selectedStoryBlock, refinedStory } = useAppContext();
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
        body: JSON.stringify({
          index: selectedStoryBlock?.index,
          text: prompt,
          imageBase64,
        }),
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
            r.index === selectedStoryBlock?.index ? { ...r, videoBase64 } : r
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

  const generateAllVideos = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = refinedStory.map(
        ({ index, videoPrompt, imageBase64 }) => ({
          index,
          text: videoPrompt,
          imageBase64,
        })
      );
      const res = await fetch("http://localhost:8000/generate-all-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && Array.isArray(response.data)) {
        const videoResponses = response.data as {
          index: number;
          text: string;
          videoBase64: string;
        }[];
        setRefinedStory((rs) =>
          rs.map((r) => {
            const matched = videoResponses.find((img) => img.index === r.index);
            return matched ? { ...r, videoBase64: matched.videoBase64 } : r;
          })
        );
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
    generateAllVideos,
    loading,
    error,
    setError,
  };
}
