import { Plus } from "lucide-react";
import { Video } from "remotion";

interface ModalVideoPreviewProps {
  videoBase64: string;
  onClose: () => void;
}

export function ModalVideoPreview({
  videoBase64,
  onClose,
}: ModalVideoPreviewProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="relative flex h-full w-full items-center justify-center">
        <button
          className="absolute right-4 top-4 z-[70] text-2xl text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close video preview"
        >
          <Plus className="h-8 w-8 rotate-45" />
        </button>
        <div className="group relative flex flex-grow flex-col items-center justify-center">
          <Video
            src={`data:video/mp4;base64,${videoBase64}`}
            className="block h-[80%] max-h-[80vh] w-[80%] max-w-[80vw] rounded-lg"
            loop={false}
          />
        </div>
      </div>
    </div>
  );
}
