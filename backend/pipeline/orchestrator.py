import json
import os
import time
from datetime import datetime
from pathlib import Path

from functions import audio, parsing, enrichment

_DEBUG = os.getenv("DEBUG_OUTPUT", "false").lower() == "true"
_LOG_DIR = "pipeline/logs"
_BASE = Path(__file__).parent.parent


def _load_profile(domain: str, user_id: str) -> dict:
    profile_path = _BASE / "users" / domain / user_id / "profile.json"
    if not profile_path.exists():
        raise ValueError(f"Usuario no encontrado: {domain}/{user_id}")
    return json.loads(profile_path.read_text(encoding="utf-8"))


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
    domain = report["raw"]["domain"]
    user_id = report["raw"]["user_id"]

    profile = _load_profile(domain, user_id)
    specialty = profile["specialty"]
    report["raw"]["specialty"] = specialty

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
    report = parsing.run(report, domain, specialty)
    _log(log_path, f"[2] parsing              {time.time() - t0:.1f}s")
    _save("2", "parsing", report)

    t0 = time.time()
    report = enrichment.run(report, domain, user_id)
    _log(log_path, f"[3] enriched             {time.time() - t0:.1f}s")
    _save("3", "enriched", report)

    _log(log_path, f"--- total                {time.time() - pipeline_start:.1f}s")

    return report
