import json
from typing import List, Optional
from pydantic import BaseModel

class StoryBlock(BaseModel):
    block: int
    text: str
    image_prompt: Optional[str] = None
    animation_prompt: Optional[str] = None

class StoryRequest(BaseModel):
    topic: str
    story_blocks: List[StoryBlock]