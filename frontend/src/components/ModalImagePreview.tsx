import { Plus } from "lucide-react";

interface ModalImagePreviewProps {
  imageBase64: string;
  onClose: () => void;
}

export function ModalImagePreview({
  imageBase64,
  onClose,
}: ModalImagePreviewProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="relative flex h-full w-full items-center justify-center">
        <button
          className="absolute right-4 top-4 z-[70] text-2xl text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <Plus className="h-8 w-8 rotate-45" />
        </button>
        <div className="group relative flex flex-grow flex-col items-center justify-center">
          <img
            alt="Scene preview"
            className="block h-[80%] max-h-[80vh] w-[80%] max-w-[80vw] rounded-lg object-contain"
            src={"data:image/jpeg;base64," + imageBase64}
          />
        </div>
      </div>
    </div>
  );
}
