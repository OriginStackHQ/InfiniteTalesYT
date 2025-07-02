export interface VoiceModel {
  VoiceId: string;
  Name: string;
  PreviewUrl: string;
  Gender?: string;
  Accent?: string;
  Age?: string;
  Descriptive?: string;
  Language?: string;
  UseCase?: string;
}

export interface Job {
  id: string;
  title: string;
  status: "queued" | "in-progress" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  videoUrl?: string;
  fileSize?: number;
}

export interface StoryBlock {
  index: number;
  text: string;
  imageBase64: string | null;
  imagePrompt: string;
  videoBase64: string | null;
  videoPrompt: string;
}

export interface ParsedStory {
  topic: string;
  storyBlocks: StoryBlockRaw[];
}

export interface StoryBlockRaw {
  index: number;
  text: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface FullParsedStory {
  topic: string;
  storyBlocks: StoryBlock[];
}

export interface Word {
  text: string;
  start: number;
  end: number;
}

export interface CaptionSegment {
  index: number;
  start: number;
  end: number;
  text: string;
  words: Word[];
}

export interface Caption {
  text: string;
  segments: CaptionSegment[];
  language: string;
}

export interface Scene {
  index: number;
  voiceBase64: string;
  contentType: string;
  duration: number;
  caption: Caption;
}

export interface CaptionStyle {
  captionType: "Line" | "WordByWord" | "Spotlight" | "Segment" | "Karaoke";
  textColor: string;
  bgColor: string;
  font: string;
  fontSize: number;
}

export interface SceneForShort {
  video: string;
  image: string;
  voice: {
    url: string;
    caption: Caption;
    duration: number;
  };
}

export interface ShortConfig {
  videoSource: "Image" | "Video";
  bgSong: string;
  bgSongVol: number;
  scenes: SceneForShort[];
  applyCaption: boolean;
  durationInFrames: number;
  captionStyle: CaptionStyle;
}

export interface ExpandedSections {
  video: boolean;
  captions: boolean;
  transitions: boolean;
}
