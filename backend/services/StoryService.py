from models.StoryRequest import StoryRequest
import re

class StoryService:
    def __init__(self):
        print("StoryService initialized")

    def normalize_line(self, line: str) -> str:
        line = line.replace("—", ", ").replace("–", ",")
        line = line.replace("‘", "'").replace("’", "'")
        line = line.replace("“", '"').replace("”", '"')
        return line

    async def refine_story(self, data: StoryRequest):
        scenes = []

        for block in data.story_blocks:
            normalized_text = self.normalize_line(block.text)
            scenes.append({
                "index": block.block,
                "script": normalized_text
            })

        return {"scenes": scenes}
