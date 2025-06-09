import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionStyleProps } from "../types/captionType";

const containerStyle: React.CSSProperties = {
  position: "absolute",
  left: "10%",
  bottom: 100,
  width: "80%",
  textAlign: "center",
  zIndex: 20,
  padding: "10px 20px",
};

export const LineCaption: React.FC<CaptionStyleProps> = ({
  captionStyle,
  captionData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = Math.floor((frame / fps) * 1000);

  const currentSegment = captionData.segments.find(
    (segment) => currentTimeMs >= segment.start && currentTimeMs <= segment.end
  );

  const currentWordIndex = currentSegment
    ? currentSegment.words.findIndex(
        (word) => currentTimeMs >= word.start && currentTimeMs < word.end
      )
    : -1;

  if (!currentSegment) {
    return null;
  }

  return (
    <div style={containerStyle}>
      {currentSegment.words.map((word, index) => (
        <span
          key={index}
          style={{
            fontSize: captionStyle.fontSize,
            fontWeight: "bold",
            display: "inline-block",
            color:
              index === currentWordIndex ? captionStyle.textColor : "white",
            backgroundColor:
              index === currentWordIndex ? captionStyle.bgColor : "transparent",
            borderRadius: 10,
            margin: "0 4px",
            padding: "5px 5px",
            transition: "all 0.2s ease",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export const WordByWordCaption: React.FC<CaptionStyleProps> = ({
  captionStyle,
  captionData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = Math.floor((frame / fps) * 1000);

  // Find the current segment
  const currentSegment = captionData.segments.find(
    (segment) => currentTimeMs >= segment.start && currentTimeMs <= segment.end
  );

  if (!currentSegment) {
    return null; // No caption at current time
  }

  return (
    <div style={containerStyle}>
      {currentSegment.words.map((word, index) => {
        const isActive =
          currentTimeMs >= word.start && currentTimeMs <= word.end;

        return (
          <span
            key={index}
            style={{
              fontSize: captionStyle.fontSize,
              fontWeight: "bold",
              padding: "0px 6px",
              color: isActive ? captionStyle.textColor : "#FFFFFF",
              marginRight: 8,
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              display: "inline-block",
              WebkitTextStroke: "5px black",
              paintOrder: "stroke",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

// Spotlight caption component that shows the current word
export const SpotlightCaption: React.FC<CaptionStyleProps> = ({
  captionStyle,
  captionData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = Math.floor((frame / fps) * 1000);

  // Find the current word across all segments
  let currentWord = null;

  for (const segment of captionData.segments) {
    for (const word of segment.words) {
      if (currentTimeMs >= word.start && currentTimeMs <= word.end) {
        currentWord = word;
        break;
      }
    }
    if (currentWord) break;
  }

  if (!currentWord) {
    return null; // No word to display at current time
  }

  return (
    <div style={containerStyle}>
      <span
        style={{
          fontSize: captionStyle.fontSize,
          fontWeight: "bold",
          color: captionStyle.textColor,
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          display: "inline-block",
        }}
      >
        {currentWord.text}
      </span>
    </div>
  );
};

// Segment caption component that shows the current segment
export const SegmentCaption: React.FC<CaptionStyleProps> = ({
  captionStyle,
  captionData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = Math.floor((frame / fps) * 1000);

  // Find the current segment
  const currentSegment = captionData.segments.find(
    (segment) => currentTimeMs >= segment.start && currentTimeMs <= segment.end
  );

  if (!currentSegment) {
    return null; // No caption at current time
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontSize: captionStyle.fontSize,
          fontWeight: "bold",
          color: captionStyle.textColor,
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
          backgroundColor: `${captionStyle.bgColor}70`,
          padding: "10px 20px",
          borderRadius: 10,
          display: "inline-block",
        }}
      >
        {currentSegment.text}
      </div>
    </div>
  );
};

// Karaoke-style caption that shows the current segment with current words highlighted as they progress
export const KaraokeCaption: React.FC<CaptionStyleProps> = ({
  captionStyle,
  captionData,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = Math.floor((frame / fps) * 1000);

  // Find the current segment
  const currentSegment = captionData.segments.find(
    (segment) => currentTimeMs >= segment.start && currentTimeMs <= segment.end
  );

  if (!currentSegment) {
    return null; // No caption to display if there's no current segment
  }

  // Process words in the current segment for styling
  const wordElements: React.ReactNode[] = [];
  let wordIndex = 0;

  currentSegment.words.forEach((word) => {
    const isActive = currentTimeMs >= word.start && currentTimeMs <= word.end;
    const isPast = currentTimeMs > word.end;

    wordElements.push(
      <span
        key={wordIndex++}
        style={{
          color: isPast
            ? "#ffffff"
            : isActive
            ? captionStyle.textColor
            : "#9C9C9C",
          fontWeight: "bold",
          opacity: isActive ? 1 : isPast ? 0.9 : 0.7,
          display: "inline-block",
          margin: "0 2px",
        }}
      >
        {word.text}
      </span>
    );

    // Add a space after each word except the last one
    if (
      currentSegment.words.indexOf(word) !==
      currentSegment.words.length - 1
    ) {
      wordElements.push(<span key={`space-${wordIndex}`}> </span>);
    }
  });

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontSize: captionStyle.fontSize,
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
        }}
      >
        {wordElements}
      </div>
    </div>
  );
};
