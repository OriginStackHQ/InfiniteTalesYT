import base64
import os
import re
import json
import datetime
import requests
import io
import math
import subprocess
import urllib.request
import zipfile
import unicodedata
from tempfile import NamedTemporaryFile
from pathlib import Path
from models.ImageRequest import ImageRequest
from models.ImageResponse import ImageResponse
from models.VoiceCaptionRequest import SceneItem, VoiceCaptionRequest
from models.VoiceCaptionResponse import VoiceCaption, VoiceCaptionResponse, Word, CaptionSegment, Caption
from models.VoiceModel import VoiceModel
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

# Try to import Vosk components
try:
    from vosk import Model, KaldiRecognizer
except ImportError:
    Model = None
    KaldiRecognizer = None

# Try to import ElevenLabs
try:
    from elevenlabs import ElevenLabs
except ImportError:
    ElevenLabs = None


class MediaService:
    def __init__(self):
        print("MediaService initialized")
        self.file_path = Path(os.path.dirname(os.path.abspath(__file__))) / "data.json"
        self.model_folder_path = Path(os.path.dirname(os.path.abspath(__file__))) / "vosk-model-hi"
        # Regular expression to extract runs of Devanagari letters
        self.WORD_RE = re.compile(r"[\u0900-\u097F]+")
        self.eleven_labs_api_key = os.getenv("ELEVEN_LABS_API_KEY")
        self.voice_ids = ["Nh2zY9kknu6z4pZy6FhD","zT03pEAEi0VHKciJODfn","d0grukerEzs069eKIauC"]

    async def generate_google_fx(self, prompt: str, image_count: int = 1, 
                            aspect_ratio: str = "IMAGE_ASPECT_RATIO_PORTRAIT", 
                            max_retries: int = 2) -> List[str]:
        """
        Generate images using Google ImageFX API.
        
        Args:
            prompt: Text prompt for image generation
            image_count: Number of images to generate (default: 1)
            aspect_ratio: Aspect ratio for generated images
            max_retries: Maximum number of retry attempts for auth failures
            
        Returns:
            List of base64-encoded images
            
        Raises:
            Exception: If API call fails or returns invalid response
        """
        
        for attempt in range(max_retries + 1):
            try:
                # Load and validate config
                config_data = await self._load_and_validate_config()
                
                # Prepare request
                headers = {
                    "Authorization": f"Bearer {config_data['image_fx_key']}",
                    "Content-Type": "application/json",
                }

                request_body = {
                    "userInput": {
                        "candidatesCount": image_count,
                        "prompts": [prompt],
                    },
                    "clientContext": {
                        "tool": "IMAGE_FX",
                    },
                    "modelInput": {
                        "modelNameType": "IMAGEN_3_5",
                    },
                    "aspectRatio": aspect_ratio,
                }

                # Make API call with proper JSON serialization
                response = requests.post(
                    "https://aisandbox-pa.googleapis.com/v1:runImageFx", 
                    headers=headers, 
                    json=request_body,  # Use json parameter instead of data
                    timeout=30  # Add timeout for better error handling
                )

                response.raise_for_status()
                json_response = response.json()

                # Validate and extract images
                return self._extract_images_from_response(json_response)

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 401 and attempt < max_retries:
                    print(f"Authentication failed (attempt {attempt + 1}/{max_retries + 1}), refreshing token...")
                    await self.update_auth_token_image_fx()
                    continue  # Retry with new token
                else:
                    # Log the full error response for debugging
                    error_details = ""
                    if e.response is not None:
                        try:
                            error_details = e.response.json()
                        except:
                            error_details = e.response.text
                    
                    raise Exception(f"ImageFX API error (HTTP {e.response.status_code}): {error_details}")
                    
            except requests.exceptions.RequestException as e:
                raise Exception(f"Network error calling ImageFX API: {str(e)}")
            
            except Exception as e:
                if "Invalid response from ImageFX" in str(e):
                    raise e  # Re-raise our custom validation errors
                raise Exception(f"Unexpected error in ImageFX generation: {str(e)}")
        
        raise Exception(f"Failed to generate images after {max_retries + 1} attempts")

    async def _load_and_validate_config(self) -> Dict[str, Any]:
        """Load config and refresh token if needed."""
        try:
            with open(self.file_path) as f:
                config_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            raise Exception(f"Failed to load config file: {str(e)}")

        # Check if token exists and is valid
        if not config_data.get("image_fx_key") or not config_data.get("image_fx_key_expiry"):
            await self.update_auth_token_image_fx()
            with open(self.file_path) as f:
                config_data = json.load(f)
        else:
            # Check token expiry
            try:
                expiry_time = datetime.datetime.fromisoformat(config_data["image_fx_key_expiry"]).timestamp()
                current_time = datetime.datetime.now().timestamp()
                
                # Refresh token if it expires within the next 5 minutes (buffer time)
                if current_time > (expiry_time - 300):
                    await self.update_auth_token_image_fx()
                    with open(self.file_path) as f:
                        config_data = json.load(f)
            except (ValueError, KeyError) as e:
                raise Exception(f"Invalid token expiry format: {str(e)}")
        
        return config_data

    def _extract_images_from_response(self, json_response: Dict[str, Any]) -> List[str]:
        """Extract base64 images from API response."""
        if not json_response.get("imagePanels"):
            raise Exception("Invalid response from ImageFX: missing imagePanels")

        base64_images = []
        for panel in json_response["imagePanels"]:
            for image in panel.get("generatedImages", []):
                if image.get("encodedImage"):
                    base64_images.append(image["encodedImage"])
        
        if not base64_images:
            raise Exception("Invalid response from ImageFX: no images found in response")
        
        return base64_images

    async def update_auth_token_image_fx(self):
        """Update ImageFX authentication token using requests (synchronous)."""
        try:
            print("Updating ImageFX authentication token...")
            with open(self.file_path) as f:
                config_data = json.load(f)

            cookie = config_data.get("image_fx_cookie")
            if not cookie:
                raise Exception("Google ImageFX cookie is missing")

            # Use requests instead of httpx for consistency
            response = requests.get(
                "https://labs.google/fx/api/auth/session",
                headers={
                    "cookie": f"__Secure-next-auth.session-token={cookie};"
                },
                timeout=30
            )
            
            response.raise_for_status()
            auth_data = response.json()
            
            if auth_data.get("error"):
                raise Exception(f"Authentication error: {auth_data['error']}")
                
            if not auth_data.get("access_token") or not auth_data.get("expires"):
                raise Exception("Access token or expiry missing from response")

            # Update the existing config data instead of replacing it
            config_data.update({
                "image_fx_key": auth_data["access_token"],
                "image_fx_key_expiry": auth_data["expires"],
                "image_fx_cookie": cookie
            })

            with open(self.file_path, 'w') as f:
                json.dump(config_data, f, indent=2)

            print("ImageFX authentication token updated successfully")

        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error updating auth token: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to update auth token: {str(e)}")
    
    async def generate_image(self, request: ImageRequest ) -> ImageResponse:
        gen_images_base64: List[str] = await self.generate_google_fx(request.text)
        return ImageResponse(text=request.text, imageBase64=gen_images_base64[0])

    def normalize_line(self, line: str) -> str:
        """
        Replace or remove symbols that may confuse TTS engines (e.g., ElevenLabs).
        - Replace Hindi/em dash (—) and en dash (–) with a comma.
        - Replace smart quotes with straight quotes.
        """
        if not line:
            return ""
            
        # Replace em dash and en dash with comma
        line = line.replace("—", ", ").replace("–", ", ")
        # Replace smart single quotes with straight single quote
        line = line.replace("'", "'").replace("'", "'")
        # Replace smart double quotes with straight double quote
        line = line.replace(""", '"').replace(""", '"')
        return line
    
    def split_into_sentences(self, line: str) -> List[str]:
        """
        Splits a single line into separate sentences based on Hindi danda (।), 
        period (.), question mark (?), or exclamation (!).
        """
        if not line.strip():
            return []
            
        # Split on whitespace following any of '। . ! ?'
        parts = re.split(r'(?<=[।\.,!?])\s+', line.strip())
        return [p.strip() for p in parts if p.strip()]

    def chunk_sentence_by_words(self, sentence: str, max_words: int) -> List[str]:
        """
        Breaks a sentence into chunks of up to max_words words each.
        """
        if not sentence.strip():
            return []
            
        words = sentence.split()
        chunks = []
        for i in range(0, len(words), max_words):
            chunk = " ".join(words[i:i + max_words])
            chunks.append(chunk)
        return chunks

    def process_text(self, input_line: str, max_words: int) -> str:
        """
        Process text line into JSON format with segments.
        """
        if not input_line.strip():
            return json.dumps({"text": "", "segments": []}, ensure_ascii=False)
            
        line = input_line.strip()
        sentences = self.split_into_sentences(line)
        
        all_chunks = []
        for sent in sentences:
            chunks = self.chunk_sentence_by_words(sent, max_words)
            all_chunks.extend(chunks)
            
        return json.dumps({
            "text": line,
            "segments": [{"text": chunk} for chunk in all_chunks]
        }, ensure_ascii=False)

    def generate_tts_audio_from_json(
        self,
        line: str,
        voice_id: str,
        api_key: str,
        model_id: str = "eleven_multilingual_v2",
    ) -> io.BytesIO:
        """
        Generate Hindi TTS audio (MP3) from ElevenLabs.
        """
        if ElevenLabs is None:
            raise Exception("ElevenLabs library is not installed")
            
        if not line.strip():
            raise Exception("No text found in line")
            
        try:
            elevenlabs = ElevenLabs(api_key=api_key)
            audio_generator = elevenlabs.text_to_speech.convert(
                text=line,
                voice_id=voice_id,
                model_id=model_id,
                output_format="mp3_44100_128",
            )
            audio_data = b"".join(chunk for chunk in audio_generator)
            return io.BytesIO(audio_data)
        except Exception as e:
            raise Exception(f"Failed to generate audio: {e}")

    def convert_mp3_to_wav(self, mp3_data: io.BytesIO) -> io.BytesIO:
        """
        Use ffmpeg to convert MP3 → WAV (16 kHz, mono).
        """
        try:
            with NamedTemporaryFile(suffix=".mp3", delete=False) as mp3_file:
                mp3_file.write(mp3_data.getvalue())
                mp3_file.flush()
                
                cmd = [
                    "ffmpeg",
                    "-y",
                    "-i", mp3_file.name,
                    "-ar", "16000",
                    "-ac", "1",
                    "-loglevel", "error",
                    "-f", "wav",
                    "-"
                ]
                
                output = subprocess.check_output(cmd)
                return io.BytesIO(output)
                
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to convert MP3 to WAV: {e}")
        except Exception as e:
            raise Exception(f"Error in MP3 to WAV conversion: {e}")
        
    def download_and_extract_vosk_model(self):
        """
        Download the Vosk Hindi model and extract it.
        """
        if self.model_folder_path.exists():
            return

        model_url = "https://alphacephei.com/vosk/models/vosk-model-hi-0.22.zip"
        zip_path = self.model_folder_path.parent / "vosk-model-hi-0.22.zip"

        try:
            print("Downloading Vosk model...")
            urllib.request.urlretrieve(model_url, str(zip_path))
        except Exception as e:
            raise Exception(f"Failed to download Vosk model: {e}")

        try:
            print("Extracting Vosk model...")
            with zipfile.ZipFile(str(zip_path), "r") as zf:
                zf.extractall(str(self.model_folder_path.parent))
        except Exception as e:
            raise Exception(f"Failed to extract Vosk model: {e}")

        # Rename extracted folder
        extracted_folder = self.model_folder_path.parent / "vosk-model-hi-0.22"
        if extracted_folder.exists():
            extracted_folder.rename(self.model_folder_path)
        else:
            raise Exception(f"Failed to find extracted Vosk model folder: {extracted_folder}")

        # Clean up zip file
        # if zip_path.exists():
        #     zip_path.unlink()

    def run_vosk_recognition(self, wav_data: io.BytesIO) -> Dict[str, Any]:
        """
        Run Vosk recognizer on WAV data and return the JSON result.
        """
        if Model is None or KaldiRecognizer is None:
            raise Exception("Vosk is not installed")

        self.download_and_extract_vosk_model()
        try:
            model = Model(str(self.model_folder_path))
        except Exception as e:
            raise Exception(f"Failed to load Vosk model: {e}")

        rec = KaldiRecognizer(model, 16000.0)
        rec.SetWords(True)

        result_list = []
        wav_data.seek(0)  # Reset to beginning
        
        # Skip WAV header
        wav_data.read(44)
        
        while True:
            data = wav_data.read(4000)
            if not data:
                break
            if rec.AcceptWaveform(data):
                res = rec.Result()
                j = json.loads(res)
                if "result" in j:
                    result_list.extend(j["result"])

        # Final partial
        final_res = json.loads(rec.FinalResult())
        if "result" in final_res:
            result_list.extend(final_res["result"])
            
        return {"result": result_list}

    @staticmethod
    def ms_from_float(seconds_f: float) -> int:
        """Convert float seconds to integer milliseconds."""
        return math.floor(seconds_f * 1000)

    @staticmethod
    def strip_diacritics(txt: str) -> str:
        """
        Normalize to NFD and drop all combining marks.
        """
        normalized = unicodedata.normalize("NFD", txt)
        return "".join(ch for ch in normalized if not unicodedata.category(ch).startswith("M"))

    def tokenize_transcript_line(self, line: str) -> List[str]:
        """
        Extract all runs of Devanagari letters from the line.
        """
        return self.WORD_RE.findall(line)

    def map_words_to_lines(self, json_data: Dict[str, Any], vosk_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Map Vosk word-level timing to transcript lines, token-by-token.
        """
        # Read all nonempty transcript lines
        segments = json_data.get("segments", [])
        lines = [seg["text"].strip() for seg in segments if seg.get("text", "").strip()]
        
        if not lines:
            raise Exception("No lines found in json data")

        # Flatten Vosk's recognition results
        vosk_words = vosk_result.get("result", [])
        if not vosk_words:
            raise Exception("No words found in Vosk result")

        # Convert Vosk words into timing data
        word_timings = [
            {
                "token": w["word"], 
                "start": math.floor(float(w["start"]) * 1000),
                "end": math.ceil(float(w["end"]) * 1000),
            }
            for w in vosk_words
        ]

        karaoke_lines = []
        word_idx = 0
        total_words = len(word_timings)

        for line_idx, line_text in enumerate(lines):
            transcript_tokens = self.tokenize_transcript_line(line_text)
            
            if not transcript_tokens:
                karaoke_lines.append({
                    "index": line_idx,
                    "start": 0,
                    "end": 0,
                    "text": line_text,
                    "words": []
                })
                continue

            current_words = []
            line_start_ms = None
            line_end_ms = None

            # Align transcript tokens with Vosk tokens
            for tok in transcript_tokens:
                if word_idx >= total_words:
                    break
                
                w = word_timings[word_idx]
                if line_start_ms is None:
                    line_start_ms = w["start"]
                line_end_ms = w["end"]

                current_words.append({
                    "text": tok,
                    "start": w["start"],
                    "end": w["end"]
                })
                word_idx += 1

            # Handle unmatched tokens
            unmatched_count = len(transcript_tokens) - len(current_words)
            if unmatched_count > 0:
                fallback_time = line_end_ms if line_end_ms is not None else 0
                for rem_tok in transcript_tokens[len(current_words):]:
                    current_words.append({
                        "text": rem_tok,
                        "start": fallback_time,
                        "end": fallback_time
                    })

            # Set defaults if nothing matched
            if line_start_ms is None:
                line_start_ms = 0
                line_end_ms = 0

            karaoke_lines.append({
                "index": line_idx,
                "start": line_start_ms,
                "end": line_end_ms,
                "text": line_text,
                "words": current_words
            })

        return karaoke_lines

    def ms_to_srt_timestamp(self, ms: int) -> str:
        """
        Convert milliseconds to SRT timestamp format 'HH:MM:SS,mmm'.
        """
        h = ms // 3_600_000
        ms %= 3_600_000
        m = ms // 60_000
        ms %= 60_000
        s = ms // 1000
        ms %= 1000
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    def write_srt(self, karaoke_lines: List[Dict[str, Any]]) -> io.StringIO:
        """
        Generate SRT file content from karaoke data.
        """
        srt_file = io.StringIO()
        for entry in karaoke_lines:
            idx = entry["index"] + 1
            start_ts = self.ms_to_srt_timestamp(entry["start"])
            end_ts = self.ms_to_srt_timestamp(entry["end"])
            text_line = entry["text"]
            srt_file.write(f"{idx}\n{start_ts} --> {end_ts}\n{text_line}\n\n")
        srt_file.seek(0)
        return srt_file
            
    async def get_voice_and_caption(self, request: SceneItem, voice_id: str, api_key: str) -> List[Caption]:
        """
        Generate voice and captions for the provided scenes.
        """
        normalized_text = self.normalize_line(request.text)
        json_data_str = self.process_text(normalized_text, 4)
        json_data = json.loads(json_data_str)

        
        mp3_data = self.generate_tts_audio_from_json(
            normalized_text, voice_id, api_key
        )
        
        wav_data = self.convert_mp3_to_wav(mp3_data)

        vosk_result = self.run_vosk_recognition(wav_data)

        karaoke_lines = self.map_words_to_lines(json_data, vosk_result)
        
        # Convert to proper format
        segments = []
        for line in karaoke_lines:
            words = [
                Word(text=w["text"], start=w["start"], end=w["end"]) 
                for w in line["words"]
            ]
            segments.append(CaptionSegment(
                index=line["index"],
                start=line["start"],
                end=line["end"],
                text=line["text"],
                words=words
            ))
        
        caption = Caption(
            text=normalized_text,
            segments=segments,
            language="hi"
        )
        return mp3_data, caption
    
    async def generate_voice_and_caption(self, request: VoiceCaptionRequest) -> VoiceCaptionResponse:
        """
        Generate voice and captions for the provided text.
        """
        voiceCaptions: List[VoiceCaption] = []

        voice_id = request.narrator

        for scene in request.scenes:
            # Generate voice and captions
            mp3_data, caption = await self.get_voice_and_caption(scene, voice_id, self.eleven_labs_api_key)

            if caption.segments:
                duration = int(math.ceil(caption.segments[-1].end / 1000))
            else:
                duration = 0

            # Encode voice to base64.
            voice_base64: str = base64.b64encode(mp3_data.getvalue()).decode("utf-8")

            voiceCaptions.append(VoiceCaption(
                index=scene.index,
                voiceBase64=voice_base64,
                contentType="audio/mp3",
                duration=duration,
                caption=caption
            ))

        return VoiceCaptionResponse(
            scenes=voiceCaptions
        )

    async def get_voices(self):
        try:
            voice_infos : List[VoiceModel] = []

            for vid in self.voice_ids:
                response = requests.get(
                    f"https://api.elevenlabs.io/v1/voices/{vid}",
                    headers={
                        "xi-api-key": self.eleven_labs_api_key  # Note: lowercase key name as expected by API
                    },
                    timeout=30
                )

                response.raise_for_status()
                voice = response.json()

                # Case 1: Voice is already labeled as Hindi
                if voice.get("labels", {}).get("language") == "hi":
                    preview_url = voice.get("preview_url")
                
                # Case 2: Check inside verified_languages
                for lang in voice.get("verified_languages", []):
                    if lang.get("language") == "hi":
                        preview_url =  lang.get("preview_url")

                voice_infos.append(VoiceModel(
                    VoiceId=voice["voice_id"],
                    Name=voice["name"],
                    PreviewUrl=None if preview_url is None else preview_url,
                    Gender=voice.get("labels", {}).get("gender"),
                    Accent=voice.get("labels", {}).get("accent"),
                    Age=voice.get("labels", {}).get("age"),
                    Descriptive=voice.get("labels", {}).get("descriptive"),
                    Language=voice.get("labels", {}).get("language"),
                    UseCase=voice.get("labels", {}).get("use_case"),
                ))

            return voice_infos
        
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get voices: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to get voices: {e}")
