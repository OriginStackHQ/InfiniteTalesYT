import { z } from "zod";
import { CaptionSchema, CaptionStyleSchema } from "./captionSchema";
import { TransitionSchema } from "./transitionSchema";

export const VideoSourceEnum = z.enum(["Image", "Video"]);

export const VoiceSchema = z.object({
  url: z.string(),
  caption: CaptionSchema,
  duration: z.number(),
});

export const SceneSchema = z.object({
  image: z.string().optional(),
  video: z.string().optional(),
  voice: VoiceSchema,
});

export const ShortConfigSchema = z.object({
  videoSource: VideoSourceEnum.optional(),
  scenes: z.array(SceneSchema).optional(),
  bgSong: z.string().optional(),
  bgSongVol: z.number().optional(),
  captionStyle: CaptionStyleSchema.optional(),
  transition: TransitionSchema.optional(),
  durationInFrames: z.number().optional(),
  applyCaption: z.boolean().optional(),
});
