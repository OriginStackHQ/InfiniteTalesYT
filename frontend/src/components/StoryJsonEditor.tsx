import { useEffect } from "react";
import { Trash2, Upload, Zap } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { JsonEditor } from "json-edit-react";
import type { FullParsedStory, ParsedStory } from "../types";

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
  const {
    storyJson,
    setStoryJson,
    parsedStory,
    setParsedStory,
    refinedStory,
    setRefinedStory,
    resetAll,
  } = useAppContext();

  useEffect(() => {
    try {
      const parsed = JSON.parse(storyJson);
      setParsedStory(parsed);
    } catch {
      console.error("Invalid JSON.");
    }
  }, [storyJson]);

  const handleDownload = () => {
    const exportData: FullParsedStory = {
      topic: parsedStory.topic,
      storyBlocks: refinedStory,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = parsedStory.topic + " Story.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed: FullParsedStory = JSON.parse(text);

        const parsedStoryRaw: ParsedStory = {
          topic: parsed.topic,
          storyBlocks: parsed.storyBlocks.map(
            ({ index, text, imagePrompt, videoPrompt }) => ({
              index,
              text,
              imagePrompt,
              videoPrompt,
            })
          ),
        };
        resetAll();
        setParsedStory(parsedStoryRaw);
        setRefinedStory(parsed.storyBlocks);
        setStoryJson(JSON.stringify(parsedStoryRaw, null, 2));
      } catch (err: any) {
        console.error("Invalid FullParsedStory JSON");
      }
    };

    reader.readAsText(file);
  };

  const handleSetData = (newData: unknown) => {
    if (typeof newData === "object" && newData !== null) {
      setStoryJson(JSON.stringify(newData, null, 2));
    } else {
      console.error("Invalid JSON.");
    }
  };

  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Story JSON Editor</h2>
      </div>

      <div className="bg-slate-900/40 border border-slate-600/50 rounded-xl p-2 max-h-[400px] overflow-auto">
        {parsedStory ? (
          <JsonEditor
            data={parsedStory}
            setData={handleSetData}
            rootName=""
            rootFontSize="14px"
            minWidth={"100%"}
            maxWidth={"100%"}
          />
        ) : (
          <p className="text-red-400 text-sm">
            Invalid JSON. Please check the input.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm sm:flex sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onRefine}
          disabled={loading}
          className="px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Refine story"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Refine Story
        </button>

        <label
          htmlFor="upload-json"
          className="px-3 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload JSON
          <input
            id="upload-json"
            type="file"
            accept=".json"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handleDownload}
          disabled={!parsedStory}
          className="px-3 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Download JSON"
        >
          <Upload className="w-4 h-4 rotate-180" />
          Download JSON
        </button>

        <button
          onClick={() => {
            setLoading(true);
            resetAll();
            setLoading(false);
          }}
          disabled={loading}
          className="px-3 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          aria-label="Reset all"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Reset All
        </button>
      </div>
    </div>
  );
}
