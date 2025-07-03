import { useState, useEffect } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { HeaderSection } from "./components/HeaderSection";
import { ErrorToast } from "./components/ErrorToast";
import { JobsList } from "./components/JobsList";
import { StoryJsonEditor } from "./components/StoryJsonEditor";
import { RefinedScenesPreview } from "./components/RefinedScenesPreview";
import { VoiceSelector } from "./components/VoiceSelector";
import { ModalImagePreview } from "./components/ModalImagePreview";
import { ModalVideoPreview } from "./components/ModalVideoPreview";
import { RegenerateModal } from "./components/RegenerateModal";
import { ConfigurationPanel } from "./components/ConfigurationPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { useRefineStory } from "./hooks/useRefineStory";
import { useExportRender } from "./hooks/useExportRender";
import { useGenerateVoiceCaption } from "./hooks/useGenerateVoiceCaption";
import { useFetchJobs } from "./hooks/useFetchJobs";
import { useFetchVoices } from "./hooks/useFetchVoices";
import { useGenerateImage } from "./hooks/useGenerateImage";
import { useGenerateVideo } from "./hooks/useGenerateVideo";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import type { Scene, StoryBlock } from "./types";
import { VoiceAndCaptionPreview } from "./components/VoiceAndCaptionPreview";

function AppContent() {
  const {
    shortConfig,
    setShortConfig,
    refinedStory,
    parsedStory,
    setRefinedStory,
    setStoryJson,
    voices,
    selectedVoice,
    setSelectedVoice,
    scenes,
    setScenes,
    fps,
    selectedStoryBlock,
    setSelectedStoryBlock,
  } = useAppContext();

  // Hooks
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    cancelJob,
    deleteAllJobs,
    setError: setJobsError,
  } = useFetchJobs();

  const {
    exportRender,
    loading: renderLoading,
    error: renderError,
    setError: setRenderError,
  } = useExportRender();

  const {
    generateVoiceCaption,
    loading: voiceCaptionLoading,
    error: voiceCaptionError,
    setError: setVoiceCaptionError,
  } = useGenerateVoiceCaption();

  const {
    refineStory,
    loading: refineStoryLoading,
    error: refineStoryError,
    setError: setRefineStoryError,
  } = useRefineStory();

  const {
    loading: voicesLoading,
    error: voicesError,
    setError: setVoicesError,
  } = useFetchVoices();

  const {
    generateImage,
    loading: imageLoading,
    error: imageError,
    setError: setImageError,
  } = useGenerateImage();

  const {
    generateVideo,
    loading: videoLoading,
    error: videoError,
    setError: setVideoError,
  } = useGenerateVideo();

  const { isPlaying, setAudio, toggleAudio } = useAudioPlayer();

  // Local state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [modalImage, setImageModal] = useState<string>("");
  const [modalVideo, setVideoModal] = useState<string>("");
  const [isRegenerateImageModalOpen, setRegenerateImageModalOpen] =
    useState<boolean>(false);
  const [isRegenerateVideoModalOpen, setRegenerateVideoModalOpen] =
    useState<boolean>(false);

  // Combine all errors
  const combinedError =
    error ||
    jobsError ||
    voicesError ||
    refineStoryError ||
    imageError ||
    videoError ||
    renderError ||
    voiceCaptionError;

  const combinedLoading =
    loading ||
    jobsLoading ||
    voicesLoading ||
    refineStoryLoading ||
    imageLoading ||
    videoLoading ||
    renderLoading ||
    voiceCaptionLoading;

  const clearError = () => {
    setError(null);
    setJobsError(null);
    setVoicesError(null);
    setImageError(null);
    setVideoError(null);
    setRefineStoryError(null);
    setRenderError(null);
    setVoiceCaptionError(null);
  };

  const handleVoiceChange = (voiceId: string) => {
    const voice = voices.find((v) => v.VoiceId === voiceId);
    if (!voice) return;

    setSelectedVoice(voiceId);
    setAudio(voice.PreviewUrl);
  };

  const openImageModal = (imageBase64: string) => {
    setImageModal(imageBase64);
    setIsImageModalOpen(true);
  };

  const openVideoModal = (videoBase64: string) => {
    setVideoModal(videoBase64);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModal("");
    setIsVideoModalOpen(false);
  };

  const closeImageModal = () => {
    setImageModal("");
    setIsImageModalOpen(false);
  };

  const openRegenerateImageModal = (s: StoryBlock) => {
    setSelectedStoryBlock(s);
    setRegenerateImageModalOpen(true);
  };

  const closeRegenerateImageModal = () => {
    setSelectedStoryBlock(null);
    setRegenerateImageModalOpen(false);
  };

  const openRegenerateVideoModal = (s: StoryBlock) => {
    setSelectedStoryBlock(s);
    setRegenerateVideoModalOpen(true);
  };

  const closeRegenerateVideoModal = () => {
    setSelectedStoryBlock(null);
    setRegenerateVideoModalOpen(false);
  };

  const handleRegenerateImage = async (prompt: string) => {
    if (!selectedStoryBlock) {
      setError("Please select a story block first.");
      return;
    }

    const newStoryBlock = {
      ...selectedStoryBlock,
      imagePrompt: prompt,
      imageBase64: null,
    };

    const newRefinedStory = refinedStory.map((s) => {
      if (s.index === newStoryBlock.index) {
        return newStoryBlock;
      }
      return s;
    });

    setRefinedStory(newRefinedStory);

    setStoryJson(
      JSON.stringify(
        {
          ...parsedStory,
          storyBlocks: newRefinedStory.map(
            ({ index, text, imagePrompt, videoPrompt }) => ({
              index,
              text,
              imagePrompt,
              videoPrompt,
            })
          ),
        },
        null,
        2
      )
    );

    const isUpdated = await generateImage(prompt);
    if (isUpdated) {
      closeRegenerateImageModal();
    }
  };

  const handleRegenerateVideo = async (prompt: string) => {
    if (!selectedStoryBlock) {
      setError("Please select a story block first.");
      return;
    }

    if (!selectedStoryBlock.imageBase64) {
      setError("Please generate an image first.");
      return;
    }

    const newStoryBlock = {
      ...selectedStoryBlock,
      videoPrompt: prompt,
      videoBase64: null,
    };

    const newRefinedStory = refinedStory.map((s) => {
      if (s.index === newStoryBlock.index) {
        return newStoryBlock;
      }
      return s;
    });

    setRefinedStory(newRefinedStory);

    setStoryJson(
      JSON.stringify(
        {
          ...parsedStory,
          storyBlocks: newRefinedStory.map(
            ({ index, text, imagePrompt, videoPrompt }) => ({
              index,
              text,
              imagePrompt,
              videoPrompt,
            })
          ),
        },
        null,
        2
      )
    );

    const isUpdated = await generateVideo(
      prompt,
      selectedStoryBlock.imageBase64
    );
    if (isUpdated) {
      closeRegenerateImageModal();
    }
  };

  const convertToEmptyScenes = (refinedStory: StoryBlock[]): Scene[] => {
    return refinedStory.map((block) => {
      const scene: Scene = {
        index: block.index,
        text: block.text,
        voiceBase64: null,
        contentType: "audio/mp3",
        duration: 0,
        caption: {
          text: block.text,
          segments: [],
          language: "hi",
        },
      };
      return scene;
    });
  };

  const handleSubmitVoice = async () => {
    const scenes = convertToEmptyScenes(refinedStory);
    setScenes(scenes);
  };

  const allScenesReadyForRender =
    scenes.length === refinedStory.length &&
    refinedStory.every((s) => s.imageBase64) &&
    scenes.every((s) => s.voiceBase64 && s.duration > 0 && s.caption);

  useEffect(() => {
    if (!scenes.length) return;

    const allScenesReady =
      scenes.length === refinedStory.length &&
      refinedStory.every((s) => s.imageBase64) &&
      scenes.every((s) => s.voiceBase64 && s.duration > 0 && s.caption);

    if (!allScenesReady) return;

    const scenesForShort = scenes.map((scene: Scene, index) => ({
      video: "data:video/mp4;base64," + refinedStory[index].videoBase64,
      image: "data:image/jpeg;base64," + refinedStory[index].imageBase64,
      voice: {
        url: "data:audio/mp3;base64," + scene.voiceBase64,
        caption: scene.caption,
        duration: scene.duration,
      },
    }));

    const totalDurationInSec = scenes.reduce(
      (acc: number, s) => acc + (s.duration || 0),
      0
    );

    const newDurationInFrames = totalDurationInSec * fps;

    const config = {
      ...shortConfig,
      scenes: scenesForShort,
      durationInFrames: newDurationInFrames,
    };

    setShortConfig(config);
  }, [scenes, fps, refinedStory, setShortConfig]);

  // Set initial audio when voices load
  useEffect(() => {
    if (voices.length > 0 && selectedVoice) {
      const voice = voices.find((v) => v.VoiceId === selectedVoice);
      if (voice) {
        setAudio(voice.PreviewUrl);
      }
    }
  }, [voices, selectedVoice, setAudio]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-800/50">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      {/* Modals */}
      {isImageModalOpen && (
        <ModalImagePreview imageBase64={modalImage} onClose={closeImageModal} />
      )}

      {isRegenerateImageModalOpen && selectedStoryBlock && (
        <RegenerateModal
          initialPrompt={selectedStoryBlock.imagePrompt || ""}
          loading={combinedLoading}
          onClose={closeRegenerateImageModal}
          onRegenerate={handleRegenerateImage}
        />
      )}

      {isVideoModalOpen && (
        <ModalVideoPreview videoBase64={modalVideo} onClose={closeVideoModal} />
      )}

      {isRegenerateVideoModalOpen && selectedStoryBlock && (
        <RegenerateModal
          initialPrompt={selectedStoryBlock.videoPrompt || ""}
          loading={combinedLoading}
          onClose={closeRegenerateVideoModal}
          onRegenerate={handleRegenerateVideo}
        />
      )}

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <HeaderSection />

          <ErrorToast error={combinedError} onClear={clearError} />

          {jobs.length > 0 && (
            <JobsList
              jobs={jobs}
              onCancelJob={cancelJob}
              onDeleteAll={deleteAllJobs}
            />
          )}

          <StoryJsonEditor
            onRefine={refineStory}
            loading={combinedLoading}
            setLoading={setLoading}
          />

          {refinedStory.length > 0 && (
            <RefinedScenesPreview
              refinedStory={refinedStory}
              onImageClick={openImageModal}
              onRegenerateImageClick={openRegenerateImageModal}
              onVideoClick={openVideoModal}
              onRegenerateVideoClick={openRegenerateVideoModal}
            />
          )}

          {refinedStory.length > 0 && voices.length > 0 && (
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              isPlaying={isPlaying}
              loading={combinedLoading}
              onVoiceChange={handleVoiceChange}
              onToggleAudio={toggleAudio}
              handleGenerateScenes={handleSubmitVoice}
            />
          )}

          {scenes.length > 0 && refinedStory.length > 0 && (
            <VoiceAndCaptionPreview
              onPlayVoice={(b64) => {
                const audio = new Audio(`data:audio/mp3;base64,${b64}`);
                audio.play();
              }}
              onRegenerateClick={generateVoiceCaption}
              onViewCaption={(caption) => {
                /* open modal with caption.segments */
              }}
            />
          )}

          {/* Configuration & Preview Row */}
          {shortConfig &&
            refinedStory.length > 0 &&
            scenes.length > 0 &&
            allScenesReadyForRender && (
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                  <ConfigurationPanel />
                </div>
                <div className="lg:col-span-2">
                  <PreviewPanel onExport={exportRender} />
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
