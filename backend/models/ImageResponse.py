from pydantic import BaseModel
from typing import List

class ImageResponse(BaseModel):
    text: str
    imageBase64: str