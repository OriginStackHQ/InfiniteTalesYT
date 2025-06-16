from pydantic import BaseModel
from typing import List
    
class ImageRequest(BaseModel):
    text: str
