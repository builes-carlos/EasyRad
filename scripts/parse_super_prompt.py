"""
Script de una sola ejecucion.
Lee 'prompts/super prompt Jorge.txt' y genera:
  - prompts/rules.txt        (reglas fijas)
  - prompts/templates.json   (47 plantillas indexadas por nombre)
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
        templates[name] = body

    TEMPLATES_OUT.write_text(
        json.dumps(templates, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"templates.json generado ({len(templates)} plantillas)")
    for name in templates:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
