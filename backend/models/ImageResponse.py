from pydantic import BaseModel

class ImageResponse(BaseModel):
    index: int
    text: str
    imageBase64: str