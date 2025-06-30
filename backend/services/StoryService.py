from models.StoryRequest import StoryRequest
from models.StoryResponse import StoryResponse, StoryBlock
from typing import List
from services.MediaService import MediaService

class StoryService:
    def __init__(self):
        print("StoryService initialized")

    def normalize_line(self, line: str) -> str:
        line = line.replace("—", ", ").replace("–", ",")
        line = line.replace("‘", "'").replace("’", "'")
        line = line.replace("“", '"').replace("”", '"')
        return line

    async def refine_story(self, data: StoryRequest):

        scenes: List[StoryBlock] = []
        for index, block in enumerate(data.storyBlocks):
            normalized_text = self.normalize_line(block.text)

            scenes.append(StoryBlock(
                index=block.index,
                text=normalized_text,
                imagePrompt=block.imagePrompt,
                animationPrompt=block.animationPrompt,
            ))
        return StoryResponse(topic=data.topic, storyBlocks=scenes)
