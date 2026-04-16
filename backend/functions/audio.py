from transcription.client import get_transcription


def run(report: dict) -> dict:
    audio_path = report["raw"]["audio_file"]
    report["raw"]["raw_transcription"] = get_transcription(audio_path)
    preview = report["raw"]["raw_transcription"][:80]
    print(f'[AUDIO]       OK "{preview}..."')
    return report
