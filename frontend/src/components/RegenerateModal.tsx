import { useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";

interface RegenerateModalProps {
  initialPrompt: string;
  loading: boolean;
  onClose: () => void;
  onRegenerate: (prompt: string) => void;
}

export function RegenerateModal({
  initialPrompt,
  loading,
  onClose,
  onRegenerate,
}: RegenerateModalProps) {
  const [promptText, setPromptText] = useState(initialPrompt);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close regenerate modal"
        >
          <Plus className="h-6 w-6 rotate-45" />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-white">Enter Prompt</h2>

        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Type something..."
          className="w-full p-3 mb-4 border border-yellow-300 rounded-lg text-white bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          rows={5}
          aria-label="Image generation prompt"
        />

        <button
          onClick={() => onRegenerate(promptText)}
          disabled={!promptText || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Regenerate image"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <RefreshCcw className="w-5 h-5" />
          )}
          Regenerate Image
        </button>
      </div>
    </div>
  );
}
