import json
import os
import time
from datetime import datetime

from functions import audio, parsing, enrichment

_DEBUG = os.getenv("DEBUG_OUTPUT", "false").lower() == "true"
_LOG_DIR = "pipeline/logs"


def _save(order: str, stage: str, report: dict):
    if not _DEBUG:
        return
    path = f"pipeline/{order}-{stage}/output-{stage}-{report['raw']['transaction_id']}.json"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)


def _log(log_path: str, message: str):
    if not _DEBUG:
        return
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(message + "\n")


def run_pipeline(report: dict) -> dict:
    txn_id = report["raw"]["transaction_id"]

    if _DEBUG:
        os.makedirs(_LOG_DIR, exist_ok=True)

    log_path = f"{_LOG_DIR}/{txn_id}.log"
    pipeline_start = time.time()
    _log(log_path, f"=== Pipeline TXN-{txn_id} | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===")

    t0 = time.time()
    report = audio.run(report)
    _log(log_path, f"[1] audio-transcription  {time.time() - t0:.1f}s")
    _save("1", "audio-transcription", report)

    t0 = time.time()
    report = parsing.run(report)
    _log(log_path, f"[2] parsing              {time.time() - t0:.1f}s")
    _save("2", "parsing", report)

    t0 = time.time()
    report = enrichment.run(report)
    _log(log_path, f"[3] enriched             {time.time() - t0:.1f}s")
    _save("3", "enriched", report)

    _log(log_path, f"--- total                {time.time() - pipeline_start:.1f}s")

    return report
