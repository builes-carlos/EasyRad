import json
import copy
from pathlib import Path
from llm.client import get_parsing_completion

_BASE = Path(__file__).parent.parent
_PARSING_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))["parsing"]


def run(report: dict, domain: str, specialty: str) -> dict:
    prompt_template = (_BASE / "domains" / domain / "parsing.txt").read_text(encoding="utf-8")
    templates = json.loads((_BASE / "domains" / domain / specialty / "templates.json").read_text(encoding="utf-8"))
    template_names = "\n".join(f'  - "{name}"' for name in templates)

    schema = copy.deepcopy(_PARSING_SCHEMA)
    prompt = prompt_template.format(
        schema=json.dumps(schema, ensure_ascii=False, indent=2),
        raw_transcription=report["raw"]["raw_transcription"],
        template_names=template_names,
    )
    raw = get_parsing_completion(prompt).strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    parsed = json.loads(raw)
    report["parsing"]["study_type"] = parsed["study_type"]
    report["parsing"]["normalized_text"] = parsed["normalized_text"]
    print("[PARSING]     OK")
    print(f'  {report["parsing"]["study_type"]}')
    print(f'  {report["parsing"]["normalized_text"]}')
    return report
