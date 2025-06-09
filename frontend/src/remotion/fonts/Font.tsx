import * as Kalam from "@remotion/google-fonts/Kalam";
import * as Poppins from "@remotion/google-fonts/Poppins";
import * as Khand from "@remotion/google-fonts/Khand";
import * as Arya from "@remotion/google-fonts/Arya";
import * as YatraOne from "@remotion/google-fonts/YatraOne";
import * as Hind from "@remotion/google-fonts/Hind";

export const getFontFamily = (font?: string) => {
  switch (font) {
    case "Poppins":
      return Poppins.loadFont("normal", { weights: ["400", "700"] });
    case "Kalam":
      return Kalam.loadFont("normal", { weights: ["400", "700"] });
    case "Khand":
      return Khand.loadFont("normal", { weights: ["400", "700"] });
    case "Arya":
      return Arya.loadFont("normal", { weights: ["400", "700"] });
    case "YatraOne":
      return YatraOne.loadFont("normal", { weights: ["400"] });
    case "Hind":
      return Hind.loadFont("normal", { weights: ["400", "700"] });
    default:
      return Poppins.loadFont("normal", { weights: ["400", "700"] });
  }
};
