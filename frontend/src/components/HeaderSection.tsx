import { Sparkles } from "lucide-react";

export function HeaderSection() {
  return (
    <div className="text-center py-8">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-red-400 to-green-400 bg-clip-text text-transparent mb-4">
        <Sparkles className="inline-block w-12 h-12 mr-4 text-blue-400" />
        Video Studio Pro
      </h1>

      <p className="text-slate-300 text-lg">
        Create stunning short-form videos with AI-powered tools
      </p>
    </div>
  );
}
