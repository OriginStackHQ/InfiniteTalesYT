import {
  VolumeX,
  RefreshCcw,
  Captions,
  RotateCw,
  Pause,
  Play,
} from "lucide-react";
import type { Scene } from "../types";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState, useRef } from "react";

interface VoiceAndCaptionPreview {
  loading: boolean;
  onRegenerateClick: (scene: Scene) => void;
  handleGenerateAllVoicesAndCaptions: () => void;
}

export function VoiceAndCaptionPreview({
  loading,
  onRegenerateClick,
  handleGenerateAllVoicesAndCaptions,
}: VoiceAndCaptionPreview) {
  const { scenes } = useAppContext();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(
    null
  );
  const [currentMs, setCurrentMs] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tick = () => setCurrentMs(audio.currentTime * 1000);
    const done = () => {
      setCurrentSceneIndex(null);
      audioRef.current = null;
    };

    audio.addEventListener("timeupdate", tick);
    audio.addEventListener("ended", done);

    return () => {
      audio.removeEventListener("timeupdate", tick);
      audio.removeEventListener("ended", done);
    };
  }, [currentSceneIndex]);

  const handlePlay = (scene: Scene) => {
    // If this scene is already selected and an audio element exists
    if (currentSceneIndex === scene.index && audioRef.current) {
      if (audioRef.current.paused) {
        // Resume
        audioRef.current.play();
      } else {
        // Pause
        audioRef.current.pause();
      }
      return;
    }

    // Otherwise, stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Guard: no voice available
    if (!scene.voiceBase64) return;

    // Create and play new audio
    const src = `data:${scene.contentType};base64,${scene.voiceBase64}`;
    const newAudio = new Audio(src);
    audioRef.current = newAudio;
    setCurrentSceneIndex(scene.index);
    setCurrentMs(0);
    newAudio.play();
  };

  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
          <Captions className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          Voice and Captions
        </h2>
        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm">
          {scenes.length} scenes
        </span>
        <button
          onClick={handleGenerateAllVoicesAndCaptions}
          disabled={loading}
          className="p-2 text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Voice & Captions
        </button>
      </div>

      <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
        {scenes.map((scene) => (
          <div
            key={scene.index}
            className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              {/* Play */}
              <button
                className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handlePlay(scene)}
                disabled={!scene.voiceBase64}
              >
                {scene.voiceBase64 ? (
                  currentSceneIndex === scene.index &&
                  audioRef.current &&
                  !audioRef.current.paused ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Regenerate & View buttons */}
              <button
                className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => onRegenerateClick(scene)}
                disabled={loading}
                aria-label={`Regenerate voice and caption for scene ${scene.index}`}
              >
                {scene.voiceBase64 ? (
                  <RefreshCcw className="w-4 h-4" />
                ) : (
                  <RotateCw className="w-4 h-4" />
                )}
              </button>

              <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                Scene {scene.index}
              </span>

              {scene.caption.segments.length === 0 ? (
                <p className="text-slate-300 text-sm leading-relaxed flex-1">
                  {scene.text}
                </p>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed flex-1 flex flex-wrap gap-1">
                  {scene.caption.segments.map((seg) => {
                    const active =
                      scene.index === currentSceneIndex &&
                      currentMs >= seg.start &&
                      currentMs <= seg.end;

                    return (
                      <span
                        key={seg.index}
                        className={active ? "text-red-500" : "text-white/80"}
                      >
                        {seg.text + " "}
                      </span>
                    );
                  })}
                </p>
              )}

              {/* duration */}
              <span className="text-slate-400 ml-auto">
                {scene.duration.toFixed(1)}s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
