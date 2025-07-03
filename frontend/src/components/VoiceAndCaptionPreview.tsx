import { Volume2, VolumeX, RefreshCcw, Captions } from "lucide-react";
import type { Scene } from "../types";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState, useRef } from "react";

interface VoiceAndCaptionPreview {
  onRegenerateClick: (scene: Scene) => void;
}

export function VoiceAndCaptionPreview({
  onRegenerateClick,
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
    if (currentSceneIndex === scene.index && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!scene.voiceBase64) return;
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
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handlePlay(scene)}
                disabled={!scene.voiceBase64}
              >
                {scene.voiceBase64 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Regenerate & View buttons (unchanged) */}
              <button
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium hover:bg-blue-500/30"
                onClick={() => onRegenerateClick(scene)}
              >
                <RefreshCcw className="w-4 h-4" />
              </button>

              <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium">
                Scene {scene.index + 1}
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
                        className={active ? "text-yellow-300" : "text-white/80"}
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
