import json
from llm.client import get_completion

_PROMPT_TEMPLATE = """\
Eres un editor médico especializado en radiología. Recibirás la transcripción \
en bruto de un dictado de radiólogo. El dictado mezcla la lectura de la historia \
clínica del paciente con la descripción de los hallazgos radiológicos, todo con \
muletillas, frases cortadas, siglas sin expandir y puntuación irregular.

Tu tarea es producir un JSON con exactamente estos dos campos:
- "clinical_context": resumen estructurado de los datos clínicos del paciente \
(edad, sexo, diagnósticos, motivo de consulta, antecedentes relevantes). \
Sin hallazgos radiológicos.
- "findings": hallazgos radiológicos limpios y normalizados (puntuación correcta, \
abreviaturas expandidas, sin muletillas). Sin datos de la historia clínica.

NO agregues información que no esté en el dictado original.
Responde ÚNICAMENTE con el JSON, sin explicaciones ni bloques de código.

Transcripción:
{raw_transcription}"""


def run(report: dict) -> dict:
    prompt = _PROMPT_TEMPLATE.format(raw_transcription=report["raw_transcription"])
    raw = get_completion(prompt).strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    parsed = json.loads(raw)
    report["clinical_context"] = parsed["clinical_context"]
    report["findings"] = parsed["findings"]
    print(f'[CLEANING]    OK')
    print(f'  clinical_context: {report["clinical_context"]}')
    print(f'  findings:         {report["findings"]}')
    return report
