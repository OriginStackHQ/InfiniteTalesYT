import { useEffect } from "react";
import { Trash2, Upload, Zap } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { JsonEditor } from "json-edit-react";

interface StoryJsonEditorProps {
  onRefine: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function StoryJsonEditor({
  onRefine,
  loading,
  setLoading,
}: StoryJsonEditorProps) {
  const { storyJson, setStoryJson, parsedStory, setParsedStory, resetAll } =
    useAppContext();

  useEffect(() => {
    try {
      const parsed = JSON.parse(storyJson);
      setParsedStory(parsed);
    } catch {
      console.error("Invalid JSON.");
    }
  }, [storyJson]);

  const handleSetData = (newData: object) => {
    setStoryJson(JSON.stringify(newData, null, 2));
  };

  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Story JSON Editor</h2>
      </div>

      <div className="bg-slate-900/40 border border-slate-600/50 rounded-xl p-4 max-h-[400px] overflow-auto">
        {parsedStory ? (
          <JsonEditor
            data={parsedStory}
            setData={handleSetData}
            rootName=""
            rootFontSize="14px"
          />
        ) : (
          <p className="text-red-400 text-sm">
            Invalid JSON. Please check the input.
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onRefine}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Refine story"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          Refine Story
        </button>
        <button
          onClick={() => {
            setLoading(true);
            resetAll();
            setLoading(false);
          }}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Refine story"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
          Reset All
        </button>
      </div>
    </div>
  );
}
