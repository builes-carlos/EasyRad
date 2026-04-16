import sys
import json
import copy
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

from pipeline.orchestrator import run_pipeline

_BASE = Path(__file__).parent
_SCHEMA = json.loads((_BASE / "schemas" / "report.json").read_text(encoding="utf-8"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python main.py raw/1.json")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        raw_input = json.load(f)

    report = copy.deepcopy(_SCHEMA)
    report["raw"] = {**_SCHEMA["raw"], **raw_input}

    run_pipeline(report)
