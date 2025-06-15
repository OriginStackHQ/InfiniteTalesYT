from fastapi import  Depends,  HTTPException, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.StoryService import StoryService
from models.StoryRequest import StoryRequest
from models.VoiceCaptionRequest import VoiceCaptionRequest
from models.VoiceCaptionResponse import VoiceCaptionResponse
from services.MediaService import MediaService
from utils.response import response
from typing import List
from fastapi.exceptions import RequestValidationError
from utils.exceptions import http_exception_handler, validation_exception_handler
import uvicorn

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

@app.get("/")
async def root():
    return {"message": "Server is running"}

def get_story_service():
    return StoryService()

@app.post("/refine-story", response_model=StoryRequest)
async def refine_story(data: StoryRequest, story_service: StoryService = Depends(get_story_service)):
    try:
        data = await story_service.refine_story(data)
        return response(message="Story refined successfully", data=data)
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def get_media_service():
    return MediaService()

@app.post("/voice-and-caption", response_model=VoiceCaptionResponse)
async def generate_voice_and_caption(request: VoiceCaptionRequest, media_service: MediaService = Depends(get_media_service)):
    try:
        data = await media_service.generate_voice_and_caption(request)
        return response(message="Voice and caption generated successfully", data=data)
    
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/voices")
async def get_voices(media_service: MediaService = Depends(get_media_service)):
    try:
        data = await media_service.get_voices()
        return response(message="Voices fetched successfully", data=data)
    
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)