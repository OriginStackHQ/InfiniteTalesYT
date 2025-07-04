import { Sparkles } from "lucide-react";

export function HeaderSection() {
  return (
    <div className="text-center py-4">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-red-400 to-green-400 bg-clip-text text-transparent">
        <Sparkles className="inline-block w-12 h-12 mr-4 text-blue-400" />
        Video Studio
      </h1>
      <p className="text-slate-300 text-lg">Feel Every Moment</p>
    </div>
  );
}
