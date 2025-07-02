from pydantic import BaseModel

class VideoResponse(BaseModel):
    text: str
    imageBase64: str
    videoBase64: str
