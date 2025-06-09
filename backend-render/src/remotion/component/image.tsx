import { useCurrentFrame, interpolate, useVideoConfig, Img } from "remotion";
import React from "react";

export const ZoomPan: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();

  const durationInFrames = 300;

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.2], {
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(frame, [0, durationInFrames], [0, 30], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, durationInFrames], [0, 30], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      <Img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
};

export const ZoomPulse: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = 4 * fps;
  const pulseDuration = totalFrames;

  // Create a repeating "pulse" pattern (scale up to maxScale and back to minScale)
  const scale = interpolate(frame % pulseDuration, [0, pulseDuration / 2, pulseDuration], [1, 1.1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      <Img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
};
