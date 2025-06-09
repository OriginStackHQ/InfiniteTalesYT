// src/index.ts
import { bundle } from "@remotion/bundler";
import { ensureBrowser } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs/promises";
import { setupApp } from "./app";

const { PORT = 3001, REMOTION_ENTRY_POINT = "src/remotion/index.ts" } =
  process.env;

async function ensureDirectories() {
  const rendersDir = path.resolve("renders");
  try {
    await fs.access(rendersDir);
  } catch {
    await fs.mkdir(rendersDir, { recursive: true });
    console.info("📁 Created renders directory");
  }
}

async function main() {
  console.info("🚀 Starting video render service...");

  try {
    // Ensure required directories exist
    await ensureDirectories();

    // Ensure browser is available
    console.info("🌐 Ensuring browser is available...");
    await ensureBrowser();

    // Bundle Remotion project or use provided URL
    let remotionBundleUrl: string;

    console.info("📦 Bundling Remotion project...");
    remotionBundleUrl = await bundle({
      entryPoint: path.resolve(REMOTION_ENTRY_POINT),
      onProgress(progress) {
        const percentage = Math.round(progress * 100);
        if (percentage % 10 === 0) {
          // Log every 10%
          console.info(`📦 Bundling progress: ${percentage / 100}%`);
        }
      },
    });
    console.info("✅ Remotion project bundled successfully");

    // Setup Express app
    const app = setupApp({ remotionBundleUrl });

    // Start server
    app.listen(PORT, () => {
      console.info(`🎬 Video render service is running on port ${PORT}`);
      console.info(`📊 Health check: http://localhost:${PORT}/health`);
      console.info(`🎥 Render endpoint: http://localhost:${PORT}/api/renders`);
      console.info(`📁 Rendered videos: http://localhost:${PORT}/api/renders/`);
    });
  } catch (error) {
    console.error("❌ Failed to start service:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.info("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.info("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

main().catch((error) => {
  console.error("💥 Unhandled error in main:", error);
  process.exit(1);
});
