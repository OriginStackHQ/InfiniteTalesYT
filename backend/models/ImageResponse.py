from pydantic import BaseModel

class ImageResponse(BaseModel):
    text: str
    imageBase64: str