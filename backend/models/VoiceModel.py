from pydantic import BaseModel
from typing import List

class VoiceTag(BaseModel):
    ContentCategories: List[str]
    VoicePersonalities: List[str]

class VoiceModel(BaseModel):
    Name: str
    ShortName: str
    Gender: str
    Locale: str
    SuggestedCodec: str
    FriendlyName: str
    Status: str
    VoiceTag: VoiceTag
    Language: str