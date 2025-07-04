import { useRef, useState, useCallback, useEffect } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /** Create or replace the audio element */
  const setAudio = useCallback((url: string) => {
    // Clean up any existing element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audioRef.current = audio;
  }, []);

  /** Toggle play / pause */
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  /** Auto‑pause on component unmount */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return { isPlaying, setAudio, toggleAudio };
}
