import React from "react";
import { Composition } from "remotion";
import ShortComposition from "./compositions/ShortComposition";
import type { ShortConfig } from "./types/shortCompositionType";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortComposition"
        component={ShortComposition}
        durationInFrames={30}
        fps={30}
        width={720}
        height={1280}
        calculateMetadata={({ props }: { props: ShortConfig }) => {
          return {
            durationInFrames: props.durationInFrames,
          };
        }}
      />
    </>
  );
};
