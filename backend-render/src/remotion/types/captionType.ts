import { z } from "zod";

import {
  CaptionTypeEnum,
  WordSchema,
  SegmentSchema,
  CaptionSchema,
  CaptionStyleSchema,
  CaptionPropsSchema,
  CaptionStylePropsSchema,
} from "../schemas/captionSchema";

export type CaptionType = z.infer<typeof CaptionTypeEnum>;
export type Word = z.infer<typeof WordSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Caption = z.infer<typeof CaptionSchema>;
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;
export type CaptionProps = z.infer<typeof CaptionPropsSchema>;
export type CaptionStyleProps = z.infer<typeof CaptionStylePropsSchema>;
