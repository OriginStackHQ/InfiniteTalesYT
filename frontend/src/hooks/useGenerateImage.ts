import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export function useGenerateImage() {
  const { setRefinedStory, selectedStoryBlock, refinedStory } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (prompt: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          index: selectedStoryBlock?.index,
          text: prompt,
        }),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && response.data) {
        const imageBase64 = response.data.imageBase64;
        setRefinedStory((rs) =>
          rs.map((r) =>
            r.index === selectedStoryBlock?.index ? { ...r, imageBase64 } : r
          )
        );

        return true;
      } else {
        throw new Error("Invalid image response structure");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError("Image generation failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateAllImages = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = refinedStory.map(({ index, imagePrompt }) => ({
        index,
        text: imagePrompt,
      }));
      const res = await fetch("http://localhost:8000/generate-all-images", {
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
        const imageResponses = response.data as {
          index: number;
          text: string;
          imageBase64: string;
        }[];

        setRefinedStory((rs) =>
          rs.map((r) => {
            const matched = imageResponses.find((img) => img.index === r.index);
            return matched ? { ...r, imageBase64: matched.imageBase64 } : r;
          })
        );
      } else {
        throw new Error("Invalid image response structure");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError("Image generation failed: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateImage,
    generateAllImages,
    loading,
    error,
    setError,
  };
}
