from pydantic import BaseModel
    
class VideoRequest(BaseModel):
    text: str
    imageBase64: str
