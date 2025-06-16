import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export function useFetchVoices() {
  const { setVoices, setSelectedVoice } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/voices");
        if (!res.ok) {
          const errorJson = await res.json();
          throw new Error(errorJson.message);
        }
        const response = await res.json();
        if (response.success && Array.isArray(response.data)) {
          setVoices(response.data);
          if (response.data.length > 0) {
            setSelectedVoice(response.data[0].VoiceId);
          }
        } else {
          throw new Error("Invalid voice response structure");
        }
      } catch (err: any) {
        console.error("Failed to load voices:", err);
        setError("Could not load voices: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVoices();
  }, []);

  return {
    loading,
    error,
    setError,
  };
}
