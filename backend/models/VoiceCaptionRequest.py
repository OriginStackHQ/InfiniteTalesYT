from pydantic import BaseModel
from typing import List
    
class SceneItem(BaseModel):
    index: int
    script: str
    
class VoiceCaptionRequest(BaseModel):
    narrator: str
    scenes: List[SceneItem]