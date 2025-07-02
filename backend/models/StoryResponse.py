import json
from typing import List, Optional
from pydantic import BaseModel

class StoryBlock(BaseModel):
    index: int
    text: str
    imagePrompt: str
    imageBase64: Optional[str] = None
    videoPrompt: str
    videoBase64: Optional[str] = None

class StoryResponse(BaseModel):
    topic: str
    storyBlocks: List[StoryBlock]