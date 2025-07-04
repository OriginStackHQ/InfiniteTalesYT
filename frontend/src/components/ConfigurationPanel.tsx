import { useState } from "react";
import { Settings, Film, Type, ChevronDown, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { ExpandedSections } from "../types";

export function ConfigurationPanel() {
  const { shortConfig, updateShortConfig } = useAppContext();
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    video: true,
    captions: true,
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Configuration</h2>
      </div>

      {/* Video Settings Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("video")}
          className="flex items-center justify-between w-full p-4 bg-slate-900/30 border border-slate-600/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200"
          aria-expanded={expandedSections.video}
          aria-controls="video-settings"
        >
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">Video Settings</span>
          </div>
          {expandedSections.video ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.video && (
          <div
            id="video-settings"
            className="mt-4 p-4 bg-slate-900/20 border border-slate-600/20 rounded-xl space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Video Source
                </label>
                <select
                  value={shortConfig.videoSource}
                  onChange={(e) =>
                    updateShortConfig({
                      videoSource: e.target.value as "Image" | "Video",
                    })
                  }
                  className="w-full text-sm appearance-none p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 truncate disabled:bg-slate-800/50 disabled:border-slate-600/50 disabled:text-slate-400"
                  aria-label="Select video source"
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
                    value={shortConfig.bgSongVol}
                    onChange={(e) =>
                      updateShortConfig({
                        bgSongVol: Number(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    aria-label="Background volume"
                  />
                  <span className="text-slate-300 text-sm w-12">
                    {Math.round(shortConfig.bgSongVol * 100)}%
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
                value={shortConfig.bgSong}
                onChange={(e) => updateShortConfig({ bgSong: e.target.value })}
                className="w-full text-sm appearance-none p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 truncate disabled:bg-slate-800/50 disabled:border-slate-600/50 disabled:text-slate-400"
                placeholder="Enter background music URL..."
                aria-label="Background song URL"
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
          aria-expanded={expandedSections.captions}
          aria-controls="caption-settings"
        >
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Caption Styling</span>
          </div>
          {expandedSections.captions ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {expandedSections.captions && (
          <div
            id="caption-settings"
            className="mt-4 p-4 bg-slate-900/20 border border-slate-600/20 rounded-xl space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <input
                id="applyCaption"
                type="checkbox"
                checked={shortConfig.applyCaption}
                onChange={(e) =>
                  updateShortConfig({
                    applyCaption: e.target.checked,
                  })
                }
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
                  value={shortConfig.captionStyle.captionType}
                  onChange={(e) =>
                    updateShortConfig({
                      captionStyle: {
                        ...shortConfig.captionStyle,
                        captionType: e.target.value as any,
                      },
                    })
                  }
                  className="w-full text-sm appearance-none p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 truncate disabled:bg-slate-800/50 disabled:border-slate-600/50 disabled:text-slate-400"
                  aria-label="Caption type"
                >
                  <option value="Line">Line</option>
                  <option value="WordByWord">WordByWord</option>
                  <option value="Spotlight">Spotlight</option>
                  <option value="Segment">Segment</option>
                  <option value="Karaoke">Karaoke</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Font Family
                </label>
                <select
                  value={shortConfig.captionStyle.font}
                  onChange={(e) =>
                    updateShortConfig({
                      captionStyle: {
                        ...shortConfig.captionStyle,
                        font: e.target.value,
                      },
                    })
                  }
                  className="w-full text-sm appearance-none p-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 truncate disabled:bg-slate-800/50 disabled:border-slate-600/50 disabled:text-slate-400"
                  aria-label="Font family"
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
                  <label className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-600 cursor-pointer">
                    <span
                      className="block w-full h-full rounded-full"
                      style={{
                        backgroundColor: shortConfig.captionStyle.textColor,
                      }}
                    ></span>
                    <input
                      type="color"
                      value={shortConfig.captionStyle.textColor}
                      onChange={(e) =>
                        updateShortConfig({
                          captionStyle: {
                            ...shortConfig.captionStyle,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Text color"
                    />
                  </label>

                  <span className="text-slate-300 text-sm font-mono">
                    {shortConfig.captionStyle.textColor}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <label className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-600 cursor-pointer">
                    <span
                      className="block w-full h-full rounded-full"
                      style={{
                        backgroundColor: shortConfig.captionStyle.bgColor,
                      }}
                    ></span>
                    <input
                      type="color"
                      value={shortConfig.captionStyle.bgColor}
                      onChange={(e) =>
                        updateShortConfig({
                          captionStyle: {
                            ...shortConfig.captionStyle,
                            bgColor: e.target.value,
                          },
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Background color"
                    />
                  </label>

                  <span className="text-slate-300 text-sm font-mono">
                    {shortConfig.captionStyle.bgColor}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Font Size: {shortConfig.captionStyle.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={shortConfig.captionStyle.fontSize}
                onChange={(e) =>
                  updateShortConfig({
                    captionStyle: {
                      ...shortConfig.captionStyle,
                      fontSize: Number(e.target.value),
                    },
                  })
                }
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Font size"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
