import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


def _make_client(api_key_var: str, base_url_var: str) -> tuple:
    return (
        OpenAI(
            api_key=os.environ[api_key_var],
            base_url=os.environ[base_url_var],
        ),
        os.environ[api_key_var.replace("API_KEY", "MODEL")],
    )


_parsing_client, _parsing_model = _make_client("PARSING_API_KEY", "PARSING_BASE_URL")
_enrichment_client, _enrichment_model = _make_client("ENRICHMENT_API_KEY", "ENRICHMENT_BASE_URL")


def _complete(client: OpenAI, model: str, prompt: str) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()


def get_parsing_completion(prompt: str) -> str:
    return _complete(_parsing_client, _parsing_model, prompt)


def get_enrichment_completion(prompt: str) -> str:
    return _complete(_enrichment_client, _enrichment_model, prompt)
