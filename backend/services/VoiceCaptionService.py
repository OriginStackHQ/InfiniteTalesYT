from typing import List
import base64
import io
import re
import math
import edge_tts
from models.VoiceCaptionRequest import VoiceCaptionRequest
from models.VoiceCaptionResponse import VoiceCaptionResponse, Word, CaptionSegment, Caption, VoiceCaption
from models.VoiceModel import VoiceModel

class VoiceCaptionService:
    def __init__(self):
        print("VoiceCaptionService initialized")

    def time_to_ms(self, t):
        """Convert SRT time format 'HH:MM:SS,ms' to milliseconds (int)."""
        h, m, s_ms = t.split(":")
        s, ms = s_ms.split(",")
        return int(h) * 3600000 + int(m) * 60000 + int(s) * 1000 + int(ms)

    def parse_srt(self, srt_data) -> List[Word]:
        """Parse SRT file into a list of Word objects with timing information."""
        words: List[Word] = []
        blocks = srt_data.strip().split('\n\n')
        for block in blocks:
            lines = block.splitlines()
            if len(lines) >= 3:
                timestamp = lines[1]
                text = ' '.join(lines[2:]).strip()  # Handle multi-line text
                start_str, end_str = timestamp.split(" --> ")
                start = self.time_to_ms(start_str)
                end = self.time_to_ms(end_str)
                word = Word(text=text, start=start, end=end)
                words.append(word)
        return words

    def tokenize_full_text(self, full_text) -> List[str]:
        """Split full text into tokens (words) preserving punctuation."""
        # Improved regex to handle multi-word phrases and punctuation
        return re.findall(r'\b[\w\'-]+\b|\b[\w\'-]+\s[\w\'-]+\b|[.,!?;:]', full_text)

    def align_text_with_srt(self, srt_words: List[Word], original_text: str) -> List[Word]:
        """
        Aligns the original text with SRT words to preserve punctuation.

        Args:
            srt_words: Words parsed from SRT with timing information
            original_text: The original full text with proper punctuation

        Returns:
            List[Word]: Updated word list with punctuation preserved
        """
        # Handle the case where some SRT entries contain multiple words
        expanded_srt_words = []
        for word in srt_words:
            if ' ' in word.text.strip():
                # Split multi-word entries while preserving timing
                parts = word.text.strip().split()
                duration_per_part = (word.end - word.start) // len(parts)
                for i, part in enumerate(parts):
                    start = word.start + i * duration_per_part
                    end = start + duration_per_part
                    expanded_srt_words.append(Word(text=part, start=start, end=end))
            else:
                expanded_srt_words.append(word)

        # Create a corrected version that preserves the timing from SRT but text from original
        corrected_words = []
        srt_index = 0

        # Tokenize the original text properly with punctuation
        # Using simpler tokenization to match the original text more closely
        tokens = re.findall(r'\S+|\s+', original_text)
        tokens = [t for t in tokens if t.strip()]  # Remove whitespace-only tokens

        for token in tokens:
            # If it's punctuation, attach it to the previous word if possible
            if token in ".,!?;:।":
                if corrected_words:
                    # Get the last word and attach punctuation
                    last_word = corrected_words[-1]

                    # Create a new word with the punctuation added
                    corrected_words[-1] = Word(
                        text=last_word.text + token,
                        start=last_word.start,
                        end=last_word.end
                    )
            # Otherwise, it's a word - get timing from SRT
            elif srt_index < len(expanded_srt_words):
                # Get the next available SRT word
                srt_word = expanded_srt_words[srt_index]
                srt_index += 1

                # Create a word with original token but SRT timing
                corrected_words.append(Word(
                    text=token,
                    start=srt_word.start,
                    end=srt_word.end
                ))

        return corrected_words

    def convert_srt_to_caption_json(self, srt_data: str, full_text: str, threshold: int = 10) -> Caption:
        """
        Convert SRT data into a structured caption JSON format with preserved punctuation.

        Args:
            srt_data: SRT format caption data
            full_text: The complete transcript text with proper punctuation
            threshold: Maximum number of words per segment

        Returns:
            Caption: Structured caption data
        """
        # Parse SRT data into word-level entries
        srt_words: List[Word] = self.parse_srt(srt_data)

        # If full_text doesn't exist, reconstruct it from SRT
        if not full_text or len(full_text.strip()) == 0:
            full_text = " ".join([word.text for word in srt_words])

        # Align SRT words with original text to preserve punctuation
        aligned_words = self.align_text_with_srt(srt_words, full_text)

        # Create segments based on punctuation or threshold
        segments: List[CaptionSegment] = []
        current_segment_words: List[Word] = []
        segment_text_parts: List[str] = []

        for i, word_info in enumerate(aligned_words):
            current_segment_words.append(word_info)
            segment_text_parts.append(word_info.text)

            # Check if we should end the segment (punctuation or threshold reached)
            is_last_word = i == len(aligned_words) - 1
            ends_with_punctuation = bool(re.search(r'[.,?!;:।]$', word_info.text))
            segment_full = len(current_segment_words) >= threshold

            if is_last_word or ends_with_punctuation or segment_full:
                segment_text = " ".join(segment_text_parts)
                segment_text = re.sub(r'\s+([.,?!;:।])', r'\1', segment_text)  # Fix spacing before punctuation

                # Create a new caption segment
                segment = CaptionSegment(
                    index=len(segments),
                    start=current_segment_words[0].start,
                    end=current_segment_words[-1].end,
                    text=segment_text,
                    words=current_segment_words
                )
                segments.append(segment)

                # Reset for next segment
                current_segment_words = []
                segment_text_parts = []

        # Create final caption object
        caption_json = Caption(
            text=full_text,
            segments=segments,
            language="hi"
        )

        return caption_json

    async def get_voice_and_caption(self, request: VoiceCaptionRequest) -> VoiceCaptionResponse:
        """
        Generate voice and captions for the provided text.
        """
        voiceCaptions: List[VoiceCaption] = []

        for scene in request.scenes:
            # Generate voice and obtain SRT data.
            submaker = edge_tts.SubMaker()
            communicate = edge_tts.Communicate(scene.text, request.narrator)
            voice_buffer = io.BytesIO()

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    voice_buffer.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    submaker.feed(chunk)

            # Encode voice to base64.
            voice_base64: str = base64.b64encode(voice_buffer.getvalue()).decode("utf-8")
            srt_content: str = submaker.get_srt()

            # Convert SRT to caption (expected to return a Caption object)
            caption_json: Caption = self.convert_srt_to_caption_json(srt_content, scene.text)

            if caption_json.segments:
                duration = int(math.ceil(caption_json.segments[-1].end / 1000))
            else:
                duration = 0

            voiceCaptions.append(VoiceCaption(
                index=scene.block,
                voiceBase64=voice_base64,
                contentType="audio/mpeg",
                duration=duration,
                caption=caption_json
            ))

        return VoiceCaptionResponse(
            scenes=voiceCaptions
        )

    async def get_voices_by_lang_code(self, lang_code: str) -> List[VoiceModel]:
        """
        Finds a voice by language code.

        Args:
            lang_code: The language code of the desired voice.

        Returns:
            A voice matching the given language code.
        """

        voices = await edge_tts.VoicesManager.create()
        return voices.find(Language=lang_code)