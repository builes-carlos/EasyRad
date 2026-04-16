import os
from dotenv import load_dotenv

load_dotenv()

_ffmpeg_path = os.getenv("FFMPEG_PATH")
if _ffmpeg_path:
    os.environ["PATH"] = _ffmpeg_path + os.pathsep + os.environ.get("PATH", "")

_PROVIDER = os.getenv("TRANSCRIPTION_PROVIDER", "local")
_MODEL = os.getenv("TRANSCRIPTION_MODEL", "small")
_LANGUAGE = os.getenv("TRANSCRIPTION_LANGUAGE", "es")


def _load_local():
    import whisper
    return whisper.load_model(_MODEL)


if _PROVIDER == "local":
    _engine = _load_local()
elif _PROVIDER == "groq":
    from groq import Groq
    _engine = Groq(api_key=os.environ["GROQ_API_KEY"])
else:
    raise ValueError(f"TRANSCRIPTION_PROVIDER '{_PROVIDER}' no soportado")


def get_transcription(audio_path: str) -> str:
    if _PROVIDER == "local":
        result = _engine.transcribe(audio_path, language=_LANGUAGE)
        return result["text"].strip()

    if _PROVIDER == "groq":
        with open(audio_path, "rb") as f:
            result = _engine.audio.transcriptions.create(
                file=(os.path.basename(audio_path), f.read()),
                model=_MODEL,
                language=_LANGUAGE,
            )
        return result.text.strip()

    raise ValueError(f"TRANSCRIPTION_PROVIDER '{_PROVIDER}' no soportado")
