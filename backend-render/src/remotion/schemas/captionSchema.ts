import { z } from "zod";

export const CaptionTypeEnum = z.enum([
  "Line",
  "WordByWord",
  "Spotlight",
  "Segment",
  "Karaoke",
]);

export const WordSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export const SegmentSchema = z.object({
  index: z.number(),
  start: z.number(),
  end: z.number(),
  text: z.string(),
  words: z.array(WordSchema),
});

export const CaptionSchema = z.object({
  text: z.string(),
  segments: z.array(SegmentSchema),
  language: z.string(),
});

export const CaptionStyleSchema = z.object({
  captionType: CaptionTypeEnum,
  textColor: z.string(),
  bgColor: z.string(),
  font: z.string(),
  fontSize: z.number(),
});

export const CaptionPropsSchema = z.object({
  captionStyle: CaptionStyleSchema.optional(),
  captionData: CaptionSchema,
});

export const CaptionStylePropsSchema = z.object({
  captionStyle: CaptionStyleSchema,
  captionData: CaptionSchema,
});
