import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import type { Transition } from "../types/transitionType";

const defaultTransition: Transition = {
  transitionDuration: 15,
  transitionType: "Fade",
  params: {
    slideDirection: "from-right",
    wipeDirection: "from-right",
    flipDirection: "from-bottom"
  },
};

export const getPresentation = (transition: Transition | undefined = undefined, width: number, height: number) => {
  if (!transition) {
    transition = defaultTransition;
  }
  switch (transition.transitionType) {
    case "Fade":
      return fade();
    case "Slide":
      return slide({
        direction: transition.params.slideDirection,
      });
    case "Wipe":
      return wipe({
        direction: transition.params.wipeDirection,
      });
    case "Flip":
      return flip({
        direction: transition.params.flipDirection,
      });
    case "ClockWipe":
      return clockWipe({
        width: width,
        height: height,
      });
    default:
      return fade();
  }
};
