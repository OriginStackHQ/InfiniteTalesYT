import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Job,
  ParsedStory,
  Scene,
  ShortConfig,
  StoryBlock,
  VoiceModel,
} from "../types";

interface AppContextType {
  defaultShortConfig: ShortConfig;
  shortConfig: ShortConfig;
  setShortConfig: (config: ShortConfig) => void;
  updateShortConfig: (updates: Partial<ShortConfig>) => void;
  storyJson: string;
  setStoryJson: (json: string) => void;
  parsedStory: ParsedStory;
  setParsedStory: (story: ParsedStory) => void;
  refinedStory: StoryBlock[];
  setRefinedStory: (story: StoryBlock[]) => void;
  selectedStoryBlock: StoryBlock | null;
  setSelectedStoryBlock: (block: StoryBlock | null) => void;
  voices: VoiceModel[];
  setVoices: (voices: VoiceModel[]) => void;
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  fps: number;
  setFps: (fps: number) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  resetAll: () => void;
}

const defaultShortConfig: ShortConfig = {
  videoSource: "Image",
  bgSong: "",
  bgSongVol: 0,
  scenes: [],
  applyCaption: true,
  durationInFrames: 30,
  captionStyle: {
    captionType: "WordByWord",
    textColor: "#ff0000",
    bgColor: "#000000",
    font: "Poppins",
    fontSize: 38,
  },
};

const defaultStoryJson = `{
  "topic": "Kind Pigeon Hero",
  "storyBlocks": [
    {
      "index": 0,
      "text": "एक छोटा गाँव जग रहा था।",
      "imagePrompt": "A 3D cartoon of a small rural village ...",
      "videoPrompt": "Slow 3D camera pan ..."
    }
  ]
}`;

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [shortConfig, setShortConfig] =
    useState<ShortConfig>(defaultShortConfig);
  const [storyJson, setStoryJson] = useState<string>(defaultStoryJson);
  const [parsedStory, setParsedStory] = useState<ParsedStory>({
    topic: "",
    storyBlocks: [],
  });
  const [refinedStory, setRefinedStory] = useState<StoryBlock[]>([]);
  const [voices, setVoices] = useState<VoiceModel[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedStoryBlock, setSelectedStoryBlock] =
    useState<StoryBlock | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [fps, setFps] = useState<number>(30);
  const [jobs, setJobs] = useState<Job[]>([]);

  const updateShortConfig = (updates: Partial<ShortConfig>) => {
    setShortConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetAll = () => {
    setShortConfig(defaultShortConfig);
    setStoryJson(defaultStoryJson);
    setRefinedStory([]);
    setSelectedStoryBlock(null);
    setScenes([]);
    setFps(30);
    setJobs([]);
  };

  return (
    <AppContext.Provider
      value={{
        defaultShortConfig,
        shortConfig,
        setShortConfig,
        updateShortConfig,
        storyJson,
        setStoryJson,
        parsedStory,
        setParsedStory,
        refinedStory,
        setRefinedStory,
        selectedStoryBlock,
        setSelectedStoryBlock,
        voices,
        setVoices,
        selectedVoice,
        setSelectedVoice,
        scenes,
        setScenes,
        fps,
        setFps,
        jobs,
        setJobs,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
