from typing import List, Optional
from pydantic import BaseModel

class StoryBlock(BaseModel):
    index: int
    text: str
    imagePrompt: Optional[str] = None
    videoPrompt: Optional[str] = None

class StoryRequest(BaseModel):
    topic: str
    storyBlocks: List[StoryBlock]