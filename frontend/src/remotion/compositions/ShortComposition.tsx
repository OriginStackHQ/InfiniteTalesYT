import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  useVideoConfig,
  Sequence,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import Caption from "../captions/Caption";
import { getFontFamily } from "../fonts/Font";
import type { ShortConfig } from "../types/shortCompositionType";
import { ZoomPulse } from "../component/image";

export const ShortComposition: React.FC<ShortConfig> = (props) => {
  const { fps } = useVideoConfig();
  const font = getFontFamily(props.captionStyle?.font);

  // Calculate scene timings with 0.5s padding at start and end of each scene
  const scenesWithTiming = useMemo(() => {
    return (
      props.scenes?.map((scene) => {
        const audioDurationInFrames = Math.round(scene.voice.duration * fps);
        const totalSceneDurationInFrames = Math.round(
          (scene.voice.duration + 1) * fps
        ); // Add 1 second for padding
        const audioStartFrame = Math.round(0.5 * fps); // Start audio 0.5s after scene start

        return {
          ...scene,
          totalDurationInFrames: totalSceneDurationInFrames,
          audioDurationInFrames,
          audioStartFrame,
        };
      }) || []
    );
  }, [props.scenes, fps]);

  // Very short transition duration (2 frames) to eliminate black frames
  const transitionDurationInFrames = 2;

  // Render the AI image-based video with minimal transitions
  const renderImageVideo = () => (
    <AbsoluteFill style={{ fontFamily: font.fontFamily }}>
      <TransitionSeries>
        {scenesWithTiming.map((scene, index) => (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence
              durationInFrames={scene.totalDurationInFrames}
            >
              <ZoomPulse src={scene.image || ""} />

              {/* Audio with 0.5s delay */}
              <Sequence
                from={scene.audioStartFrame}
                durationInFrames={scene.audioDurationInFrames}
              >
                <Audio src={scene.voice.url} />
                {/* Captions with 0.5s delay if enabled */}
                {props.applyCaption && (
                  <Caption
                    captionStyle={props.captionStyle}
                    captionData={scene.voice.caption}
                  />
                )}
              </Sequence>
            </TransitionSeries.Sequence>

            {/* Add minimal transition between scenes (except for the last scene) */}
            {index < scenesWithTiming.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: transitionDurationInFrames,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Background music plays throughout the entire video */}
      {props.bgSong && (
        <Audio src={props.bgSong} volume={props.bgSongVol} startFrom={0} />
      )}
    </AbsoluteFill>
  );

  // Render the video-based content with minimal transitions
  const renderVideoContent = () => (
    <AbsoluteFill style={{ fontFamily: font.fontFamily }}>
      <TransitionSeries>
        {scenesWithTiming.map((scene, index) => (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence
              durationInFrames={scene.totalDurationInFrames}
            >
              <OffthreadVideo src={scene.video || ""} startFrom={0} />

              {/* Audio with 0.5s delay */}
              <Sequence
                from={scene.audioStartFrame}
                durationInFrames={scene.audioDurationInFrames}
              >
                <Audio src={scene.voice.url} />
                {/* Captions with 0.5s delay if enabled */}
                {props.applyCaption && (
                  <Caption
                    captionStyle={props.captionStyle}
                    captionData={scene.voice.caption}
                  />
                )}
              </Sequence>
            </TransitionSeries.Sequence>

            {/* Add minimal transition between scenes (except for the last scene) */}
            {index < scenesWithTiming.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({
                  durationInFrames: transitionDurationInFrames,
                })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Background music plays throughout the entire video */}
      {props.bgSong && (
        <Audio src={props.bgSong} volume={props.bgSongVol} startFrom={0} />
      )}
    </AbsoluteFill>
  );

  // Render the default/fallback view
  const renderDefault = () => (
    <AbsoluteFill
      style={{
        fontFamily: font.fontFamily,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: 64,
          textAlign: "center",
          color: "#ffffff",
          marginBottom: 20,
        }}
      >
        Short
      </h1>
      <p
        style={{
          fontSize: 24,
          opacity: 0.7,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        Please select a video source type
      </p>
    </AbsoluteFill>
  );

  // Determine which rendering method to use based on videoSource prop
  switch (props.videoSource) {
    case "Image":
      return renderImageVideo();
    case "Video":
      return renderVideoContent();
    default:
      return renderDefault();
  }
};

export default ShortComposition;
