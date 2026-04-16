import json
import copy
from pathlib import Path
from llm.client import get_parsing_completion

_BASE = Path(__file__).parent.parent
_PARSING_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))["parsing"]
_PROMPT_TEMPLATE = (_BASE / "prompts" / "parsing.txt").read_text(encoding="utf-8")

_templates = json.loads((_BASE / "prompts" / "templates.json").read_text(encoding="utf-8"))
_TEMPLATE_NAMES = "\n".join(f'  - "{name}"' for name in _templates)


def run(report: dict) -> dict:
    schema = copy.deepcopy(_PARSING_SCHEMA)
    prompt = _PROMPT_TEMPLATE.format(
        schema=json.dumps(schema, ensure_ascii=False, indent=2),
        raw_transcription=report["raw"]["raw_transcription"],
        template_names=_TEMPLATE_NAMES,
    )
    raw = get_parsing_completion(prompt).strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    parsed = json.loads(raw)
    report["parsing"]["patient_info"] = parsed["patient_info"]
    report["parsing"]["clinical_data"] = parsed["clinical_data"]
    report["parsing"]["study_type"] = parsed["study_type"]
    report["parsing"]["findings"] = parsed["findings"]
    print("[PARSING]     OK")
    print(f'  study_type:    {report["parsing"]["study_type"]}')
    print(f'  patient_info:  {report["parsing"]["patient_info"]}')
    print(f'  clinical_data: {report["parsing"]["clinical_data"]}')
    print(f'  findings:      {report["parsing"]["findings"]}')
    return report
