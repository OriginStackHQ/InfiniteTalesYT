import type { z } from "zod";
import type {
  TransitionTypeEnum,
  TransitionParamsSchema,
} from "../schemas/transitionSchema";
import { TransitionSchema } from "../schemas/transitionSchema";

export type TransitionType = z.infer<typeof TransitionTypeEnum>;
export type Transition = z.infer<typeof TransitionSchema>;
export type TransitionParams = z.infer<typeof TransitionParamsSchema>;
