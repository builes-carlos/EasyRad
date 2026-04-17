import copy
import json
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Fijar cwd = backend/ ANTES de importar el pipeline (usa rutas relativas)
_BASE = Path(__file__).parent
os.chdir(_BASE)
load_dotenv()  # encuentra .env en la raíz del proyecto (un nivel arriba)

from pipeline.orchestrator import run_pipeline

_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))
_AUDIO_DIR = _BASE / "pipeline" / "0-raw-audio"
_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
_TEMPLATES_PATH = _BASE / "prompts" / "templates.json"
_RULES_PATH = _BASE / "prompts" / "rules.txt"


def _load_templates() -> dict:
    return json.loads(_TEMPLATES_PATH.read_text(encoding="utf-8"))


def _save_templates(templates: dict):
    _TEMPLATES_PATH.write_text(json.dumps(templates, ensure_ascii=False, indent=2), encoding="utf-8")


class TemplateBody(BaseModel):
    indicacion: Optional[str] = None
    tecnica: Optional[str] = None
    hallazgos: Optional[str] = None
    opinion: Optional[str] = None
    nota: Optional[str] = None


class PromptBody(BaseModel):
    content: str

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


@app.get("/templates")
def list_templates():
    return list(_load_templates().keys())


@app.get("/templates/{name}")
def get_template(name: str):
    templates = _load_templates()
    if name not in templates:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    return {"name": name, **templates[name]}


@app.put("/templates/{name}")
def update_template(name: str, body: TemplateBody):
    templates = _load_templates()
    if name not in templates:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    templates[name] = body.model_dump()
    _save_templates(templates)
    return {"ok": True}


class NewTemplateBody(TemplateBody):
    name: str


@app.post("/templates")
def create_template(body: NewTemplateBody):
    templates = _load_templates()
    if body.name in templates:
        raise HTTPException(status_code=409, detail="Ya existe una plantilla con ese nombre")
    templates[body.name] = body.model_dump(exclude={"name"})
    _save_templates(templates)
    return {"ok": True, "name": body.name}


@app.delete("/templates/{name}")
def delete_template(name: str):
    templates = _load_templates()
    if name not in templates:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    del templates[name]
    _save_templates(templates)
    return {"ok": True}


@app.get("/prompt")
def get_prompt():
    return {"content": _RULES_PATH.read_text(encoding="utf-8")}


@app.put("/prompt")
def update_prompt(body: PromptBody):
    _RULES_PATH.write_text(body.content, encoding="utf-8")
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.api:app", host="0.0.0.0", port=port)
