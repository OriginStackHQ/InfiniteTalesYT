import { Eye, Download } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import ShortComposition from "../remotion/compositions/ShortComposition";
import { Player } from "@remotion/player";

interface PreviewPanelProps {
  onExport: () => void;
}

export function PreviewPanel({ onExport }: PreviewPanelProps) {
  const { shortConfig, fps } = useAppContext();

  return (
    <div className="sticky top-6 backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-rose-500 to-red-600 rounded-lg">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Live Preview</h2>
      </div>

      <div className="relative">
        {/* Phone mockup frame */}
        <div className="relative mx-auto w-80 h-[560px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
          <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

            <Player
              component={ShortComposition}
              inputProps={shortConfig}
              durationInFrames={shortConfig.durationInFrames || fps * 10}
              compositionWidth={720}
              compositionHeight={1280}
              controls
              fps={fps}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "2rem",
              }}
            />
          </div>
        </div>

        {/* Export button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onExport}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            aria-label="Export video"
          >
            <Download className="w-5 h-5" />
            Export Video
          </button>
        </div>
      </div>
    </div>
  );
}
