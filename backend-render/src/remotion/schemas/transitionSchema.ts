import { z } from "zod";

export const TransitionTypeEnum = z.enum(["Fade", "Wipe", "Slide", "Flip", "ClockWipe"]);

export const TransitionParamsSchema = z.object({
  slideDirection: z.enum(["from-left", "from-top", "from-right", "from-bottom"]).optional(),
  wipeDirection: z.enum(['from-left', 'from-top-left', 'from-top', 'from-top-right', 'from-right', 'from-bottom-right', 'from-bottom', 'from-bottom-left']).optional(),
  flipDirection: z.enum(['from-left', 'from-right', 'from-top', 'from-bottom']).optional(),
});

export const TransitionSchema = z.object({
  transitionDuration: z.number(),
  transitionType: TransitionTypeEnum,
  params: TransitionParamsSchema,
});
