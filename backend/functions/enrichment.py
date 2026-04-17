import json
import copy
import re
from pathlib import Path
from llm.client import get_enrichment_completion

_BASE = Path(__file__).parent.parent
_ENRICHMENT_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))["enrichment"]
_URGENCY_LEVELS = json.loads((_BASE / "config" / "urgency_levels.json").read_text(encoding="utf-8"))

_urgency_options = "\n".join(f'  - "{k}": {v}' for k, v in _URGENCY_LEVELS.items())

_JSON_WRAPPER = f"""
---
INSTRUCCIONES DE SALIDA (no son parte del reporte):

Genera el reporte en el campo "report" exactamente como Jorge lo escribiría —
listo para copiar y pegar en el RIS. Respeta el formato de la plantilla al pie de la letra.
No incluyas marcadores, etiquetas, JSON ni explicaciones dentro del report.

Además extrae:
- "urgency": nivel de urgencia clínica. Usa exactamente uno de:
{_urgency_options}
- "followup": lista de acciones de seguimiento de la sección Opinión.

Responde ÚNICAMENTE con este JSON (sin bloques de código):
{{schema}}"""


def _template_to_text(t: dict) -> str:
    parts = [
        f"Indicación: {t['indicacion']}",
        f"Técnica:\n{t['tecnica']}",
        f"Hallazgos:\n{t['hallazgos']}",
        f"Opinión:\n{t['opinion']}",
    ]
    if t.get("nota"):
        parts.append(f"Nota:\n{t['nota']}")
    return "\n\n".join(parts)


def run(report: dict, domain: str, user_id: str) -> dict:
    profile_path = _BASE / "users" / domain / user_id / "profile.json"
    if not profile_path.exists():
        raise ValueError(f"Usuario no encontrado: {domain}/{user_id}")
    profile = json.loads(profile_path.read_text(encoding="utf-8"))
    specialty = profile["specialty"]

    rules = (_BASE / "domains" / domain / specialty / "rules.txt").read_text(encoding="utf-8")
    templates = json.loads((_BASE / "domains" / domain / specialty / "templates.json").read_text(encoding="utf-8"))

    style_path = _BASE / "users" / domain / user_id / "style.txt"
    style = style_path.read_text(encoding="utf-8").strip() if style_path.exists() else ""

    study_type = report["parsing"].get("study_type", "")
    raw_template = templates.get(study_type)
    template = _template_to_text(raw_template) if raw_template else None

    preamble = (
        "INSTRUCCIÓN DE SISTEMA: Eres un sistema de generación de reportes radiológicos. "
        "A continuación recibirás reglas de estilo, una plantilla y los datos del estudio. "
        "Genera el reporte INMEDIATAMENTE sin confirmar ni esperar más instrucciones.\n\n"
    )

    style_section = f"\n\n---\nESTILO DEL MÉDICO:\n{style}\n---" if style else ""

    if template:
        print(f'[ENRICHED]    Plantilla: "{study_type}"')
        prompt_body = (
            f"{preamble}{rules}{style_section}\n\n"
            f"---\nPLANTILLA A USAR:\n{template}\n---\n\n"
            f"Dictado normalizado:\n{report['parsing']['normalized_text']}"
        )
    else:
        print(f'[ENRICHED]    Sin plantilla para "{study_type}" — usando reglas base')
        prompt_body = (
            f"{preamble}{rules}{style_section}\n\n"
            f"Dictado normalizado:\n{report['parsing']['normalized_text']}"
        )

    schema = copy.deepcopy(_ENRICHMENT_SCHEMA)
    full_prompt = prompt_body + "\n\n" + _JSON_WRAPPER.format(
        schema=json.dumps(schema, ensure_ascii=False, indent=2)
    )

    raw = get_enrichment_completion(full_prompt).strip()
    if "```" in raw:
        raw = raw.split("```", 1)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0].strip()
    elif "{" in raw:
        raw = raw[raw.index("{"):]
    raw = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', raw)
    parsed = json.loads(raw)

    report["enrichment"]["report"] = parsed["report"]
    report["enrichment"]["urgency"] = parsed["urgency"]
    report["enrichment"]["followup"] = parsed["followup"]

    print(f'  urgency:  {report["enrichment"]["urgency"]}')
    print(f'  report:\n{report["enrichment"]["report"]}')
    print(f'  followup:')
    for item in report["enrichment"]["followup"]:
        print(f'    - {item}')
    return report
