from pydantic import BaseModel
    
class ImageRequest(BaseModel):
    index: int
    text: str
