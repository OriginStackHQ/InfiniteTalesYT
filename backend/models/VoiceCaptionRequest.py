from pydantic import BaseModel
    
class SceneItem(BaseModel):
    index: int
    text: str
    
class VoiceCaptionRequest(BaseModel):
    index: int
    narrator: str
    scene: SceneItem