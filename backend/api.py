import copy
import json
import os
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Fijar cwd = backend/ ANTES de importar el pipeline (usa rutas relativas)
_BASE = Path(__file__).parent
os.chdir(_BASE)
load_dotenv()  # encuentra .env en la raíz del proyecto (un nivel arriba)

from pipeline.orchestrator import run_pipeline

_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))
_AUDIO_DIR = _BASE / "pipeline" / "0-raw-audio"
_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="EasyRAD API")
_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process")
def process_report(
    audio: UploadFile = File(...),
    radiologist_id: str = Form(default="dr_web"),
):
    transaction_id = str(uuid.uuid4())
    suffix = Path(audio.filename or "audio.webm").suffix or ".webm"
    audio_filename = f"{transaction_id}{suffix}"
    audio_path = _AUDIO_DIR / audio_filename
    audio_path.write_bytes(audio.file.read())

    report = copy.deepcopy(_SCHEMA)
    report["raw"] = {
        **_SCHEMA["raw"],
        "transaction_id": transaction_id,
        "radiologist_id": radiologist_id,
        "audio_file": f"pipeline/0-raw-audio/{audio_filename}",
    }

    try:
        return run_pipeline(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
