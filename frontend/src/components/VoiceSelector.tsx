import { Volume2, Play, Pause } from "lucide-react";
import type { VoiceModel } from "../types";

interface VoiceSelectorProps {
  voices: VoiceModel[];
  selectedVoice: string;
  isPlaying: boolean;
  loading: boolean;
  onVoiceChange: (voiceId: string) => void;
  onToggleAudio: () => void;
  onGenerateVoiceCaption: () => void;
}

export function VoiceSelector({
  voices,
  selectedVoice,
  isPlaying,
  loading,
  onVoiceChange,
  onToggleAudio,
  onGenerateVoiceCaption,
}: VoiceSelectorProps) {
  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Volume2 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Voice Selection</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-medium mb-2">
            Narrator Voice
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAudio}
              className="text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              aria-label={
                isPlaying ? "Pause voice preview" : "Play voice preview"
              }
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 bg-blue-600 p-2 rounded-full" />
              ) : (
                <Play className="w-10 h-10 bg-blue-600 p-2 rounded-full" />
              )}
            </button>

            <div className="relative w-full">
              <select
                className="w-full appearance-none p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                value={selectedVoice}
                disabled={loading}
                onChange={(e) => onVoiceChange(e.target.value)}
                aria-label="Select narrator voice"
              >
                {voices.map((v) => (
                  <option key={v.VoiceId} value={v.VoiceId}>
                    {v.Name} ({v.Gender?.toUpperCase()})
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={onGenerateVoiceCaption}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            aria-label="Generate voice and captions"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Generate Voice & Captions
          </button>
        </div>
      </div>
    </div>
  );
}
