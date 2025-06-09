import { z } from "zod";
import type {
  ShortConfigSchema,
  SceneSchema,
  VideoSourceEnum,
  VoiceSchema,
} from "../schemas/shortSchema";

export type VideoSource = z.infer<typeof VideoSourceEnum>;
export type Scene = z.infer<typeof SceneSchema>;
export type Voice = z.infer<typeof VoiceSchema>;
export type ShortConfig = z.infer<typeof ShortConfigSchema>;
