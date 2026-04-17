"""
Script de una sola ejecucion.
Lee 'prompts/super prompt Jorge.txt' y genera:
  - prompts/rules.txt        (reglas fijas)
  - prompts/templates.json   (47 plantillas con campos estructurados)
"""
import json
import re
import sys
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path

BASE = Path(__file__).parent.parent / "backend" / "prompts"
SOURCE = BASE / "super prompt Jorge.txt"
RULES_OUT = BASE / "rules.txt"
TEMPLATES_OUT = BASE / "templates.json"

SECTION_PATTERNS = [
    ("indicacion", re.compile(r"Indicaci[oó]n:\s*(.*?)(?=\nT[eé]cnica:)", re.DOTALL | re.IGNORECASE)),
    ("tecnica",    re.compile(r"T[eé]cnica:\s*(.*?)(?=\nHallazgos)",      re.DOTALL | re.IGNORECASE)),
    ("hallazgos",  re.compile(r"Hallazgos[^:]*:\s*(.*?)(?=\nOpini[oó]n)", re.DOTALL | re.IGNORECASE)),
    ("opinion",    re.compile(r"Opini[oó]n[^:]*:\s*(.*?)(?=\nNota:|$)",   re.DOTALL | re.IGNORECASE)),
    ("nota",       re.compile(r"\nNota:\s*(.*?)$",                          re.DOTALL | re.IGNORECASE)),
]


def parse_template(body: str) -> dict:
    result = {}
    for field, pattern in SECTION_PATTERNS:
        m = pattern.search(body)
        result[field] = m.group(1).strip() if m else None
    return result


def main():
    if not SOURCE.exists():
        print(f"ERROR: no se encuentra {SOURCE}")
        sys.exit(1)

    text = SOURCE.read_text(encoding="utf-8")

    # --- Extraer reglas ---
    rules = text.split("----PLANTILLAS----")[0].strip()
    RULES_OUT.write_text(rules, encoding="utf-8")
    print(f"rules.txt generado ({len(rules)} chars)")

    # --- Extraer plantillas ---
    templates = {}
    pattern = re.compile(
        r"<<<TEMPLATE\|name=([^|]+)\|[^>]*>>>(.*?)<<<END>>>",
        re.DOTALL,
    )
    for match in pattern.finditer(text):
        name = match.group(1).strip()
        body = match.group(2).strip()
        templates[name] = parse_template(body)

    TEMPLATES_OUT.write_text(
        json.dumps(templates, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"templates.json generado ({len(templates)} plantillas)")
    for name, fields in templates.items():
        missing = [f for f, v in fields.items() if v is None and f != "nota"]
        status = f"  FALTAN: {missing}" if missing else ""
        print(f"  - {name}{status}")


if __name__ == "__main__":
    main()
