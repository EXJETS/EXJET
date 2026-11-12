"""LLM provider. 'none' is the default; Anthropic is used only when configured.
Output from an LLM is never trusted on its own: callers verify it (see product.quote_ingest)."""
from __future__ import annotations

import json
import os
import re
from typing import Protocol

from ..config import get_settings
from .errors import ProviderError


class LlmUnavailable(ProviderError):
    pass


class LlmProvider(Protocol):
    name: str
    available: bool
    model: str | None

    def complete_json(self, *, system: str, prompt: str, max_tokens: int = 800) -> dict: ...


class NoneLlm:
    name = "none"
    available = False
    model = None

    def complete_json(self, *, system, prompt, max_tokens=800):
        raise LlmUnavailable("no LLM provider configured")


class AnthropicLlm:
    """Anthropic Messages API. The model id comes from EXJET_LLM_MODEL_FAST (fast tier for parsing);
    it is not hardcoded because ids are verified against Anthropic docs when the router lands (DECISIONS #14)."""

    name = "anthropic"

    def __init__(self) -> None:
        s = get_settings()
        self.model = os.environ.get("EXJET_LLM_MODEL_FAST") or None
        self.available = bool(s.anthropic_api_key and self.model)
        self._key = s.anthropic_api_key

    def complete_json(self, *, system, prompt, max_tokens=800):
        if not self.available:
            raise LlmUnavailable("anthropic key or EXJET_LLM_MODEL_FAST not set")
        import anthropic

        client = anthropic.Anthropic(api_key=self._key, timeout=30.0)
        try:
            msg = client.messages.create(model=self.model, max_tokens=max_tokens, system=system,
                                         messages=[{"role": "user", "content": prompt}])
        except anthropic.APIError as e:
            raise ProviderError(f"anthropic call failed: {type(e).__name__}") from e
        text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise ProviderError("llm returned no JSON object")
        try:
            data = json.loads(m.group(0))
        except json.JSONDecodeError as e:
            raise ProviderError("llm returned invalid JSON") from e
        data["_usage"] = {"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens}
        return data
