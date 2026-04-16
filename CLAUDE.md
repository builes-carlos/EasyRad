# EasyRad — Contexto del Proyecto

## ¿Qué es?
Pipeline de procesamiento de reportes radiológicos, inspirado en radai.com.
Enriquece la transcripción voz-a-texto del radiólogo usando el súper prompt de Jorge.

## Stack
- Lenguaje: Python
- Transcripción: Groq API (Whisper large-v3) — configurable via .env
- LLM: OpenRouter API (`https://openrouter.ai/api/v1`) — Gemini 2.0 Flash
- Autenticación: variables en `.env`

## Estructura
```
EasyRAD/
├── backend/                     # pipeline Python
│   ├── main.py                  # punto de entrada: python main.py raw/1.json
│   ├── functions/
│   │   ├── audio.py             # transcripción de audio
│   │   ├── parsing.py           # extracción estructurada del dictado
│   │   └── enrichment.py        # enriquecimiento con súper prompt de Jorge
│   ├── pipeline/
│   │   └── orchestrator.py      # orquesta las 3 etapas + logging
│   ├── transcription/client.py  # abstracción de transcripción (groq/local)
│   ├── llm/client.py            # abstracción LLM (parsing/enrichment)
│   ├── prompts/
│   │   ├── rules.txt            # reglas fijas de Jorge
│   │   ├── templates.json       # 47 plantillas por tipo de estudio
│   │   ├── parsing.txt          # instrucciones de extracción
│   │   └── super prompt Jorge.txt # archivo master histórico
│   ├── schemas/report.json      # contrato del reporte
│   ├── config/urgency_levels.json
│   └── raw/1.json               # input de ejemplo
├── frontend/                    # pendiente
├── scripts/
│   └── parse_super_prompt.py    # regenera rules.txt y templates.json
├── .env
└── .gitignore
```

## Ejecutar
```bash
cd backend && python main.py raw/1.json
```

## Fases
- **Fase 1** (actual): pipeline audio → parsing → enrichment con súper prompt de Jorge
- **Fase 2** (pendiente): feedback loop RAG con Supabase + pgvector
