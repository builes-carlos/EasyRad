from llm.client import get_completion

# TODO: reemplazar con el súper prompt de Jorge
_PROMPT_TEMPLATE = """\
Eres un radiólogo experto. A partir de los siguientes hallazgos radiológicos, \
genera una impresión diagnóstica concisa y clínicamente relevante en español. \
Responde únicamente con la impresión, sin encabezados ni explicaciones adicionales.

Hallazgos:
{findings}

Impresión:"""


def run(report: dict) -> dict:
    prompt = _PROMPT_TEMPLATE.format(findings=report["findings"])
    report["impression"] = get_completion(prompt)
    print(f'[IMPRESSION]  OK "{report["impression"]}"')
    return report
