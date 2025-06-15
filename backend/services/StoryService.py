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
        
        media_service = MediaService()

        images_base64: List[str] = []
        for block in data.storyBlocks:
            image_prompt = block.imagePrompt
            gen_images_base64: List[str] = await media_service.generate_google_fx(image_prompt)
            images_base64.append(gen_images_base64[0])

        scenes: List[StoryBlock] = []
        for index, block in enumerate(data.storyBlocks):
            normalized_text = self.normalize_line(block.text)

            scenes.append(StoryBlock(
                index=block.index,
                text=normalized_text,
                imageBase64=images_base64[index]
            ))

        return StoryResponse(topic=data.topic, storyBlocks=scenes)
