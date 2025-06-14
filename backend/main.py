from fastapi import  Depends,  HTTPException, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.StoryService import StoryService
from models.StoryRequest import StoryRequest
from models.VoiceCaptionRequest import SceneItem, VoiceCaptionRequest
from models.VoiceCaptionResponse import Caption, VoiceCaptionResponse
from models.VoiceModel import VoiceModel
from services.MediaService import MediaService
from services.VoiceCaptionService import VoiceCaptionService
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

def get_voice_caption_service():
    return VoiceCaptionService()

@app.post("/voice-and-caption", response_model=VoiceCaptionResponse)
async def generate_voice_and_caption(request: VoiceCaptionRequest, voice_caption_service: VoiceCaptionService = Depends(get_voice_caption_service)):
    try:
        # Validate input
        if not request.narrator:
            raise HTTPException(status_code=400, detail="Narrator cannot be empty")
        
        if not request.scenes:
            raise HTTPException(status_code=400, detail="Scenes cannot be empty")

        data = await voice_caption_service.get_voice_and_caption(request)
        return response(message="Voice and caption generated successfully", data=data)
    
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def get_media_service():
    return MediaService()

@app.post("/captions", response_model=VoiceCaptionResponse)
async def generate_voice_and_caption(request: VoiceCaptionRequest, media_service: MediaService = Depends(get_media_service)):
    try:
        data = await media_service.generate_voice_and_caption(request, "Nh2zY9kknu6z4pZy6FhD","sk_d3510a26ed4a5ffdb0409add38b39a37da6a4e08bb5310af")
        return response(message="Voice and caption generated successfully", data=data)
    
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/voices/", response_model=List[VoiceModel])
async def get_voices(lang_code: str, voice_caption_service: VoiceCaptionService = Depends(get_voice_caption_service)):
    try:
        data = await voice_caption_service.get_voices_by_lang_code(lang_code)
        return response(message="Voices fetched successfully", data=data)
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)