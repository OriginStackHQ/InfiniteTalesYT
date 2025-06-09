from pydantic import BaseModel
from typing import List

class Word(BaseModel):
    text: str
    start: int
    end: int

class CaptionSegment(BaseModel):
    index: int
    start: int
    end: int
    text: str
    words: List[Word]

class Caption(BaseModel):
    text: str
    segments: List[CaptionSegment]
    language: str

class VoiceCaption(BaseModel):
    index: int
    voiceBase64: str
    contentType: str
    duration: int
    caption: Caption
    
class VoiceCaptionResponse(BaseModel):
    scenes: List[VoiceCaption]