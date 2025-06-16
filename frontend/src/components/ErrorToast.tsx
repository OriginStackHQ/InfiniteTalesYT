import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

interface ErrorToastProps {
  error: string | null;
  onClear: () => void;
}

export function ErrorToast({ error, onClear }: ErrorToastProps) {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => onClear(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClear]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs p-2 backdrop-blur-xl bg-white/5 border border-red-700 rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <TriangleAlert className="w-6 h-6 text-red-700" />
        <p className="text-red-100">{error}</p>
      </div>
    </div>
  );
}
