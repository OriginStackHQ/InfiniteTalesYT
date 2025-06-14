from pydantic import BaseModel
from typing import List
    
class SceneItem(BaseModel):
    block: int
    text: str
    
class VoiceCaptionRequest(BaseModel):
    narrator: str
    scenes: List[SceneItem]