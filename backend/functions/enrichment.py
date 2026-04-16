import json
import copy
from pathlib import Path
from llm.client import get_enrichment_completion

_BASE = Path(__file__).parent.parent
_ENRICHMENT_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))["enrichment"]
_URGENCY_LEVELS = json.loads((_BASE / "config" / "urgency_levels.json").read_text(encoding="utf-8"))
_RULES = (_BASE / "prompts" / "rules.txt").read_text(encoding="utf-8")
_TEMPLATES = json.loads((_BASE / "prompts" / "templates.json").read_text(encoding="utf-8"))

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


def run(report: dict) -> dict:
    study_type = report["parsing"].get("study_type", "")
    template = _TEMPLATES.get(study_type)

    preamble = (
        "INSTRUCCIÓN DE SISTEMA: Eres un sistema de generación de reportes radiológicos. "
        "A continuación recibirás reglas de estilo, una plantilla y los datos del estudio. "
        "Genera el reporte INMEDIATAMENTE sin confirmar ni esperar más instrucciones.\n\n"
    )

    if template:
        print(f'[ENRICHED]    Plantilla: "{study_type}"')
        prompt_body = (
            f"{preamble}{_RULES}\n\n"
            f"---\nPLANTILLA A USAR:\n{template}\n---\n\n"
            f"Datos del paciente:\n{json.dumps(report['parsing']['patient_info'], ensure_ascii=False)}\n\n"
            f"Datos clínicos:\n{json.dumps(report['parsing']['clinical_data'], ensure_ascii=False)}\n\n"
            f"Hallazgos dictados:\n{report['parsing']['findings']}"
        )
    else:
        print(f'[ENRICHED]    Sin plantilla para "{study_type}" — usando reglas base')
        prompt_body = (
            f"{preamble}{_RULES}\n\n"
            f"Datos del paciente:\n{json.dumps(report['parsing']['patient_info'], ensure_ascii=False)}\n\n"
            f"Datos clínicos:\n{json.dumps(report['parsing']['clinical_data'], ensure_ascii=False)}\n\n"
            f"Hallazgos dictados:\n{report['parsing']['findings']}"
        )

    schema = copy.deepcopy(_ENRICHMENT_SCHEMA)
    full_prompt = prompt_body + "\n\n" + _JSON_WRAPPER.format(
        schema=json.dumps(schema, ensure_ascii=False, indent=2)
    )

    raw = get_enrichment_completion(full_prompt).strip()
    # Extraer JSON aunque haya texto previo (ej: "Cargado y listo.\n\n```json\n{...}")
    if "```" in raw:
        raw = raw.split("```", 1)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rsplit("```", 1)[0].strip()
    elif "{" in raw:
        raw = raw[raw.index("{"):]
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
