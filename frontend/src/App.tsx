import { useState, useEffect } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { HeaderSection } from "./components/HeaderSection";
import { ErrorToast } from "./components/ErrorToast";
import { JobsList } from "./components/JobsList";
import { StoryJsonEditor } from "./components/StoryJsonEditor";
import { RefinedScenesPreview } from "./components/RefinedScenesPreview";
import { VoiceSelector } from "./components/VoiceSelector";
import { ModalImagePreview } from "./components/ModalImagePreview";
import { RegenerateModal } from "./components/RegenerateModal";
import { ConfigurationPanel } from "./components/ConfigurationPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { useRefineStory } from "./hooks/useRefineStory";
import { useExportRender } from "./hooks/useExportRender";
import { useGenerateVoiceCaption } from "./hooks/useGenerateVoiceCaption";
import { useFetchJobs } from "./hooks/useFetchJobs";
import { useFetchVoices } from "./hooks/useFetchVoices";
import { useGenerateImage } from "./hooks/useGenerateImage";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import type { Scene, StoryBlock } from "./types";

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

  const { isPlaying, setAudio, toggleAudio } = useAudioPlayer();

  // Local state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string>("");
  const [isRegenerateModalOpen, setRegenerateIsModalOpen] =
    useState<boolean>(false);

  // Combine all errors
  const combinedError =
    error ||
    jobsError ||
    voicesError ||
    refineStoryError ||
    imageError ||
    renderError ||
    voiceCaptionError;

  const combinedLoading =
    loading ||
    jobsLoading ||
    voicesLoading ||
    refineStoryLoading ||
    imageLoading ||
    renderLoading ||
    voiceCaptionLoading;

  const clearError = () => {
    setError(null);
    setJobsError(null);
    setVoicesError(null);
    setImageError(null);
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

  const openModal = (imageBase64: string) => {
    setModalImage(imageBase64);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage("");
  };

  const openRegenerateModal = (s: StoryBlock) => {
    setSelectedStoryBlock(s);
    setRegenerateIsModalOpen(true);
  };

  const closeRegenerateModal = () => {
    setRegenerateIsModalOpen(false);
    setSelectedStoryBlock(null);
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
          storyBlocks: newRefinedStory,
        },
        null,
        2
      )
    );

    const isUpdated = await generateImage(prompt);
    if (isUpdated) {
      closeRegenerateModal();
    }
  };

  useEffect(() => {
    if (!scenes.length) return;

    const scenesForShort = scenes.map((scene: Scene, index) => ({
      video:
        "https://www.shutterstock.com/shutterstock/videos/3802080493/preview/stock-footage-breathtaking-vertical-video-aspect-ratio-from-a-drone-capturing-the-scenic-view-of-a-river.webm",
      image: "data:image/jpeg;base64," + refinedStory[index].imageBase64,
      voice: {
        url: "data:audio/mp3;base64," + scene.voiceBase64,
        caption: scene.caption,
        duration: scene.duration,
      },
    }));

    const totalDurationInSec = scenes.reduce(
      (acc: number, s: any) => acc + (s.duration || 0),
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
      {isModalOpen && (
        <ModalImagePreview imageBase64={modalImage} onClose={closeModal} />
      )}

      {isRegenerateModalOpen && selectedStoryBlock && (
        <RegenerateModal
          initialPrompt={selectedStoryBlock.imagePrompt || ""}
          loading={combinedLoading}
          onClose={closeRegenerateModal}
          onRegenerate={handleRegenerateImage}
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
              onImageClick={openModal}
              onRegenerateClick={openRegenerateModal}
            />
          )}

          {refinedStory.length > 0 && (
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              isPlaying={isPlaying}
              loading={combinedLoading}
              onVoiceChange={handleVoiceChange}
              onToggleAudio={toggleAudio}
              onGenerateVoiceCaption={generateVoiceCaption}
            />
          )}

          {/* Configuration & Preview Row */}
          {shortConfig && refinedStory.length > 0 && scenes.length > 0 && (
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
