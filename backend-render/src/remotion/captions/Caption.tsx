import React from "react";
import {
  LineCaption,
  WordByWordCaption,
  SpotlightCaption,
  SegmentCaption,
  KaraokeCaption,
} from "./CaptionStyles";
import type { CaptionProps, CaptionType } from "../types/captionType";

const defaultCaptionStyle = {
  captionType: "Spotlight" as CaptionType,
  textColor: "#ffffff",
  bgColor: "#000000",
  font: "Nunito",
  fontSize: 35,
};

const Caption: React.FC<CaptionProps> = ({
  captionStyle = defaultCaptionStyle,
  captionData,
}) => {
  switch (captionStyle?.captionType) {
    case "Line":
      return (
        <LineCaption captionStyle={captionStyle} captionData={captionData} />
      );
    case "WordByWord":
      return (
        <WordByWordCaption
          captionStyle={captionStyle}
          captionData={captionData}
        />
      );
    case "Spotlight":
      return (
        <SpotlightCaption
          captionStyle={captionStyle}
          captionData={captionData}
        />
      );
    case "Segment":
      return (
        <SegmentCaption captionStyle={captionStyle} captionData={captionData} />
      );
    case "Karaoke":
      return (
        <KaraokeCaption captionStyle={captionStyle} captionData={captionData} />
      );
    default:
      return (
        <SpotlightCaption
          captionStyle={captionStyle}
          captionData={captionData}
        />
      );
  }
};

export default Caption;
