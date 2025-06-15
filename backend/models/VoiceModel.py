from pydantic import BaseModel
from typing import Optional

class VoiceModel(BaseModel):
    VoiceId: str
    Name: str
    PreviewUrl: str
    Gender: Optional[str] = None
    Accent: Optional[str] = None
    Age: Optional[str] = None
    Descriptive: Optional[str] = None
    Language: Optional[str] = None
    UseCase: Optional[str] = None