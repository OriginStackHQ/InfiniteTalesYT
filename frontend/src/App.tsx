import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import ShortComposition from "./remotion/compositions/ShortComposition";
import type { ShortConfig } from "./remotion/types/shortCompositionType";
import {
  Play,
  Settings,
  Zap,
  Volume2,
  Eye,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Film,
  Type,
  Download,
  Upload,
  TriangleAlert,
} from "lucide-react";

// Keep your VoiceModel type
type VoiceModel = {
  Name: string;
  ShortName: string;
  FriendlyName: string;
  Gender: string;
  Locale: string;
  SuggestedCodec: string;
  Status: string;
  Language: string;
};

type Job = {
  id: string;
  title: string;
  status: "queued" | "in-progress" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  videoUrl?: string;
  fileSize?: number;
};

export default function App() {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Control states (all fields that go into ShortConfig, plus intermediate)
  // ─────────────────────────────────────────────────────────────────────────────
  const [fps, setFps] = useState<number>(30);

  const [videoSource, setVideoSource] = useState<"Image" | "Video">("Image");
  const [bgSong, setBgSong] = useState<string>(""); // background music URL
  const [bgSongVol, setBgSongVol] = useState<number>(0); // 0–1

  // Caption style controls:
  const [captionType, setCaptionType] = useState<string>("WordByWord");
  const [textColor, setTextColor] = useState<string>("#ff0000");
  const [bgColor, setBgColor] = useState<string>("#000000");
  const [font, setFont] = useState<string>("Poppins");
  const [fontSize, setFontSize] = useState<number>(35);

  // Toggle caption on/off:
  const [applyCaption, setApplyCaption] = useState<boolean>(true);

  // Scenes are the raw response from your backend:
  const [scenes, setScenes] = useState<any[]>([]);

  // These two are for the "refine"-flow:
  const [storyJson, setStoryJson] = useState<string>(`{
  "topic": "Kind Pigeon Hero",
  "story_blocks": [
    {
      "block": 0,
      "text": "सुबह की हल्की धूप में एक छोटा गाँव जग रहा था, जहाँ एक बूढ़ा किसान अपने खेत में काम कर रहा था।",
      "image_prompt": "A 3D cartoon of a small rural village ...",
      "animation_prompt": "Slow 3D camera pan ..."
    }, {
      "block": 1,
      "text": "सुबह की हल्की धूप में एक छोटा गाँव जग रहा था, जहाँ एक बूढ़ा किसान अपने खेत में काम कर रहा था।",
      "image_prompt": "A 3D cartoon of a small rural village ...",
      "animation_prompt": "Slow 3D camera pan ..."
    }
  ]
}`);
  const [refinedScenes, setRefinedScenes] = useState<
    { index: number; script: string }[]
  >([]);

  // For fetching voices:
  const [voices, setVoices] = useState<VoiceModel[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // Loading & errors
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);

  // This is the "live" ShortConfig passed to the Player:
  const [shortConfig, setShortConfig] = useState<ShortConfig>({
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
      fontSize: 25,
    },
  });

  // UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    video: true,
    captions: true,
    transitions: true,
  });

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/renders/");
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const body = await res.json();
      if (body.success && Array.isArray(body.data.jobs)) {
        setJobs(body.data.jobs);
      }
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError("Could not fetch jobs: " + err.message);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/renders/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success) {
        setJobs((js) =>
          js.map((j) => (j.id === jobId ? { ...j, status: "failed" } : j))
        );
      } else {
        console.error("Cancel job failed:", await res.text());
      }
    } catch (err: any) {
      console.error("Failed to cancel job:", err);
      setError("Could not cancel job: " + err.message);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/renders/", {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success) {
        setJobs([]);
      } else {
        console.error("Delete all failed:", await res.text());
      }
    } catch (err: any) {
      console.error("Failed to delete all jobs:", err);
      setError("Could not delete all jobs: " + err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
    const iv = setInterval(fetchJobs, 60_000);
    return () => clearInterval(iv);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Fetch available voices once on mount
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVoices = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/voices/?lang_code=hi");
        if (!res.ok) {
          const errorJson = await res.json();
          throw new Error(errorJson.message);
        }
        const response = await res.json();
        if (response.success && Array.isArray(response.data)) {
          setVoices(response.data);
          if (response.data.length > 0) {
            setSelectedVoice(response.data[0].ShortName);
          }
        } else {
          throw new Error("Invalid voice response structure");
        }
      } catch (err: any) {
        console.error("Failed to load voices:", err);
        setError("Could not load voices: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVoices();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) "Refine Story" → POST /refine-story
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRefine = async () => {
    setError(null);
    setRefinedScenes([]);
    setShortConfig(null);

    let payload;
    try {
      payload = JSON.parse(storyJson);
    } catch (e) {
      console.error("JSON parse error:", e);
      setError("Invalid JSON in story editor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/refine-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && Array.isArray(response.data.scenes)) {
        const scenesArr = response.data.scenes.map((scene: any) => ({
          index: scene.index,
          script: scene.script,
        }));
        setRefinedScenes(scenesArr);
        // Reset selectedVoice if needed
        if (voices.length > 0) {
          setSelectedVoice(voices[0].ShortName);
        }
      } else {
        throw new Error("Invalid scene response structure");
      }
    } catch (err: any) {
      console.error("Refine error:", err);
      setError("Refine failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) "Generate Voice & Caption" → POST /voice-and-caption
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerateVoiceCaption = async () => {
    setError(null);
    if (refinedScenes.length === 0) {
      setError("Please refine the story first.");
      return;
    }
    if (!selectedVoice) {
      setError("Please select a voice.");
      return;
    }

    setLoading(true);

    const payload = {
      narrator: selectedVoice,
      scenes: refinedScenes,
    };

    try {
      const res = await fetch("http://localhost:8000/voice-and-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }

      const response = await res.json();
      if (response.success && Array.isArray(response.data.scenes)) {
        // store raw scenes data
        setScenes(response.data.scenes);
      } else {
        throw new Error("Invalid voice-caption response structure");
      }
    } catch (err: any) {
      console.error("Voice+Caption error:", err);
      setError("Voice+Caption failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) LIVE `shortConfig` builder
  // ─────────────────────────────────────────────────────────────────────────────
  // Only the changed part from your App.tsx file:

  // Replace this part in your useEffect where shortConfig is built:
  useEffect(() => {
    if (scenes.length === 0) {
      setShortConfig(null);
      return;
    }

    const scenesForShort: ShortConfig["scenes"] = scenes.map((scene: any) => ({
      video:
        scene.index % 2 === 0
          ? "https://www.shutterstock.com/shutterstock/videos/3802079561/preview/stock-footage-atmospheric-vertical-video-aspect-ratio-from-a-drone-following-a-car-as-it-drives-through-a.webm"
          : "https://www.shutterstock.com/shutterstock/videos/3802080493/preview/stock-footage-breathtaking-vertical-video-aspect-ratio-from-a-drone-capturing-the-scenic-view-of-a-river.webm",
      image:
        scene.index % 2 === 0
          ? "https://images.pexels.com/photos/1294062/pexels-photo-1294062.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&dpr=1"
          : "https://images.pexels.com/photos/32417770/pexels-photo-32417770/free-photo-of-playful-dog-in-curitiba-park-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&dpr=1 ",
      voice: {
        url: "data:audio/mp3;base64," + scene.voiceBase64,
        caption: scene.caption,
        duration: scene.duration,
      },
    }));

    // Updated duration calculation: add 1 second per scene for 0.5s padding at start and end
    const totalDurationInSec = scenes.reduce(
      (acc: number, s: any) => acc + (s.duration || 0),
      0
    );
    const totalDurationWithPadding = totalDurationInSec + scenes.length;
    const newDurationInFrames = totalDurationWithPadding * fps;

    const config: ShortConfig = {
      videoSource,
      scenes: scenesForShort,
      durationInFrames: newDurationInFrames,
      bgSong,
      bgSongVol,
      captionStyle: {
        captionType: captionType as any,
        textColor,
        bgColor,
        font,
        fontSize,
      },
      applyCaption,
    };

    setShortConfig(config);
  }, [
    scenes,
    fps,
    videoSource,
    bgSong,
    bgSongVol,
    captionType,
    textColor,
    bgColor,
    font,
    fontSize,
    applyCaption,
  ]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleExport = async () => {
    setError(null);
    if (!shortConfig) {
      setError("No video configuration available to render.");
      return;
    }
    setLoading(true);

    let topic;
    try {
      const parsedJson = JSON.parse(storyJson);
      topic = parsedJson.topic;
    } catch (e) {
      console.error("JSON parse error:", e);
      setError("Invalid JSON in story configuration.");
      return;
    }
    if (!topic) {
      setError("No topic found in story configuration.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/renders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortConfig: shortConfig, title: topic }),
      });
      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.message);
      }
      const response = await res.json();
      if (response.success && response.data) {
        fetchJobs();
      } else {
        throw new Error("Invalid render response structure");
      }
    } catch (err: any) {
      console.error("Render error:", err);
      setError("Render failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-800/50">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              <Sparkles className="inline-block w-12 h-12 mr-4 text-blue-400" />
              Video Studio Pro
            </h1>
            <p className="text-slate-300 text-lg">
              Create stunning short-form videos with AI-powered tools
            </p>
          </div>
          {/* Error Toast */}
          {error && (
            <div className="fixed top-4 right-4 z-50 max-w-xs p-2 backdrop-blur-xl bg-white/5 border border-red-700 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <TriangleAlert className="w-6 h-6 text-red-700" />
                <p className="text-red-100">{error}</p>
              </div>
            </div>
          )}
          {/* Jobs */}
          {jobs.length > 0 && (
            <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Render Jobs
                </h2>
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm">
                  {jobs.length} jobs
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  className="px-3 mb-2 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
                  onClick={handleDeleteAll}
                >
                  Delete All
                </button>
              </div>
              <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
                {jobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium">
                        Job {i + 1}
                      </span>
                      <div className="flex justify-between flex-1">
                        <p className="text-slate-300 text-sm leading-relaxed flex-1">
                          <b>{job.title}</b> - {job.status}
                        </p>
                        {job.status === "completed" ? (
                          <a
                            href={job.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-white text-sm"
                          >
                            View Video
                          </a>
                        ) : (
                          <button
                            onClick={() => cancelJob(job.id)}
                            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Story JSON Editor */}
          <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Story JSON Editor
              </h2>
            </div>
            <div className="relative">
              <textarea
                className="w-full h-48 bg-slate-900/50 border border-slate-600/50 rounded-xl p-4 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                value={storyJson}
                onChange={(e) => setStoryJson(e.target.value)}
                placeholder="Paste your story JSON here..."
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleRefine}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Refine Story
              </button>
            </div>
          </div>
          {/* Refined Scenes Preview */}
          {refinedScenes.length > 0 && (
            <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Refined Scenes
                </h2>
                <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm">
                  {refinedScenes.length} scenes
                </span>
              </div>
              <div className="max-h-48 overflow-auto custom-scrollbar space-y-3">
                {refinedScenes.map((s) => (
                  <div
                    key={s.index}
                    className="p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium">
                        Scene {s.index}
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed flex-1">
                        {s.script}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Selector */}
          {refinedScenes.length > 0 && (
            <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  Voice Selection
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Narrator Voice
                  </label>
                  <select
                    className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                  >
                    {voices.map((v) => (
                      <option key={v.ShortName} value={v.ShortName}>
                        {v.FriendlyName} ({v.ShortName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateVoiceCaption}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          )}
          {/* Configuration & Preview Row */}
          {shortConfig && refinedScenes.length > 0 && (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Configuration Panel - 60% width (3/5) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                      Configuration
                    </h2>
                  </div>

                  {/* Video Settings Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection("video")}
                      className="flex items-center justify-between w-full p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Film className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-medium">
                          Video Settings
                        </span>
                      </div>
                      {expandedSections.video ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {expandedSections.video && (
                      <div className="mt-4 p-4 bg-slate-900/20 border border-slate-600/20 rounded-xl space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Video Source
                            </label>
                            <select
                              value={videoSource}
                              onChange={(e) =>
                                setVideoSource(
                                  e.target.value as "Image" | "Video"
                                )
                              }
                              className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            >
                              <option value="Image">Image</option>
                              <option value="Video">Video</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Background Volume
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={bgSongVol}
                                onChange={(e) =>
                                  setBgSongVol(Number(e.target.value))
                                }
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <span className="text-slate-300 text-sm w-12">
                                {Math.round(bgSongVol * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-300 font-medium mb-2">
                            Background Song URL
                          </label>
                          <input
                            type="text"
                            value={bgSong}
                            onChange={(e) => setBgSong(e.target.value)}
                            className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            placeholder="Enter background music URL..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caption Styling Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection("captions")}
                      className="flex items-center justify-between w-full p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Type className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-medium">
                          Caption Styling
                        </span>
                      </div>
                      {expandedSections.captions ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {expandedSections.captions && (
                      <div className="mt-4 p-4 bg-slate-900/20 border border-slate-600/20 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            id="applyCaption"
                            type="checkbox"
                            checked={applyCaption}
                            onChange={(e) => setApplyCaption(e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <label
                            htmlFor="applyCaption"
                            className="text-slate-300 font-medium"
                          >
                            Enable Captions
                          </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Caption Type
                            </label>
                            <select
                              value={captionType}
                              onChange={(e) => setCaptionType(e.target.value)}
                              className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                              <option>Line</option>
                              <option>WordByWord</option>
                              <option>Spotlight</option>
                              <option>Segment</option>
                              <option>Karaoke</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Font Family
                            </label>
                            <select
                              value={font}
                              onChange={(e) => setFont(e.target.value)}
                              className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                              <option value="Kalam">Kalam</option>
                              <option value="Poppins">Poppins</option>
                              <option value="Khand">Khand</option>
                              <option value="Arya">Arya</option>
                              <option value="YatraOne">YatraOne</option>
                              <option value="Hind">Hind</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Text Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg cursor-pointer"
                              />
                              <span className="text-slate-300 text-sm font-mono">
                                {textColor}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-slate-300 font-medium mb-2">
                              Background Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg cursor-pointer"
                              />
                              <span className="text-slate-300 text-sm font-mono">
                                {bgColor}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-300 font-medium mb-2">
                            Font Size: {fontSize}px
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={fontSize}
                            onChange={(e) =>
                              setFontSize(Number(e.target.value))
                            }
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Panel - 40% width (2/5) */}
              <div className="lg:col-span-2">
                <div className="sticky top-6 backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                      Live Preview
                    </h2>
                  </div>

                  <div className="relative">
                    {/* Phone mockup frame */}
                    <div className="relative mx-auto w-80 h-[560px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                      <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                        {/* Player */}
                        <Player
                          component={ShortComposition}
                          inputProps={shortConfig}
                          durationInFrames={
                            shortConfig.durationInFrames || fps * 10
                          }
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
                        onClick={handleExport}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                        Export Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
