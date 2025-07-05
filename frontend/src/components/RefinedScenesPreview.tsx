import {
  Film,
  ImageIcon,
  ImageOff,
  RefreshCcw,
  RotateCw,
  Video,
  VideoOff,
} from "lucide-react";
import type { StoryBlock } from "../types";

interface RefinedScenesPreviewProps {
  loading: boolean;
  refinedStory: StoryBlock[];
  onImageClick: (imageBase64: string) => void;
  onRegenerateImageClick: (storyBlock: StoryBlock) => void;
  handleGenerateAllImages: () => void;
  onVideoClick: (videoBase64: string) => void;
  onRegenerateVideoClick: (storyBlock: StoryBlock) => void;
  handleGenerateAllVideos: () => void;
}

export function RefinedScenesPreview({
  loading,
  refinedStory,
  onImageClick,
  onRegenerateImageClick,
  handleGenerateAllImages,
  onVideoClick,
  onRegenerateVideoClick,
  handleGenerateAllVideos,
}: RefinedScenesPreviewProps) {
  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
          <Film className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Refined Scenes</h2>
        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm">
          {refinedStory.length} scenes
        </span>
        <button
          onClick={handleGenerateAllImages}
          disabled={loading}
          className="p-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Images
        </button>
        <button
          onClick={handleGenerateAllVideos}
          disabled={loading}
          className="p-2 text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Videos
        </button>
      </div>
      <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
        {refinedStory.map((s: StoryBlock) => (
          <div
            key={s.index}
            className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <button
                className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => s.imageBase64 && onImageClick(s.imageBase64)}
                disabled={!s.imageBase64}
                aria-label={`View image for scene ${s.index}`}
              >
                {s.imageBase64 ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <ImageOff className="w-4 h-4" />
                )}
              </button>
              <button
                className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => onRegenerateImageClick(s)}
                disabled={loading}
                aria-label={`Regenerate image for scene ${s.index}`}
              >
                {s.imageBase64 ? (
                  <RefreshCcw className="w-4 h-4" />
                ) : (
                  <RotateCw className="w-4 h-4" />
                )}
              </button>
              <button
                className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => s.videoBase64 && onVideoClick(s.videoBase64)}
                disabled={!s.videoBase64}
                aria-label={`View image for scene ${s.index}`}
              >
                {s.videoBase64 ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </button>
              <button
                className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => onRegenerateVideoClick(s)}
                disabled={loading}
                aria-label={`Regenerate video for scene ${s.index}`}
              >
                {s.videoBase64 ? (
                  <RefreshCcw className="w-4 h-4" />
                ) : (
                  <RotateCw className="w-4 h-4" />
                )}
              </button>
              <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                Scene {s.index}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                {s.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
