import { Film, Volume2, VolumeX, RefreshCcw, FileText } from "lucide-react";
import type { Scene } from "../types";
import { useAppContext } from "../context/AppContext";

interface VoiceAndCaptionPreview {
  onPlayVoice: (voiceBase64: string, contentType: string) => void;
  onRegenerateClick: (scene: Scene) => void;
  onViewCaption: (caption: Scene["caption"]) => void;
}

export function VoiceAndCaptionPreview({
  onPlayVoice,
  onRegenerateClick,
  onViewCaption,
}: VoiceAndCaptionPreview) {
  const { scenes } = useAppContext();
  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
          <Film className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">
          Voice and Captions
        </h2>
        <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-300 text-sm">
          {scenes.length} scenes
        </span>
      </div>

      {/* Scene list */}
      <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
        {scenes.map((scene) => (
          <div
            key={scene.index}
            className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              {/* Play voice */}
              <button
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() =>
                  scene.voiceBase64 &&
                  onPlayVoice(scene.voiceBase64, scene.contentType)
                }
                disabled={!scene.voiceBase64}
                aria-label={`Play voice for scene ${scene.index + 1}`}
              >
                {scene.voiceBase64 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Regenerate voice */}
              <button
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                onClick={() => onRegenerateClick(scene)}
                aria-label={`Regenerate voice for scene ${scene.index + 1}`}
              >
                <RefreshCcw className="w-4 h-4" />
              </button>

              {/* View caption */}
              <button
                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                onClick={() => onViewCaption(scene.caption)}
                aria-label={`View caption for scene ${scene.index + 1}`}
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Scene index pill */}
              <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium">
                Scene {scene.index + 1}
              </span>

              {/* Caption preview */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                {scene.text}
              </p>

              {/* Duration at end */}
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
