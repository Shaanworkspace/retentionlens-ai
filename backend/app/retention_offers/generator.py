"""GenAI offer generator - Gemini only. No fake data: raises if unconfigured or failing."""
import json
import re
import urllib.request
import urllib.error
from .prompts import build_prompt
from app.config import GEMINI_API_KEY

MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

class GenAINotConfigured(Exception):
    pass

def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise GenAINotConfigured("GenAI key missing - set GEMINI_API_KEY on the server")
    last_error = "unknown error"
    for model in MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            body = json.dumps({"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.6, "maxOutputTokens": 600}}).encode()
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=25) as resp:
                out = json.loads(resp.read().decode())
            text = out["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text:
                return text
            last_error = f"{model} returned empty response"
        except urllib.error.HTTPError as e:
            try:
                detail = e.read().decode()[:200]
            except Exception:
                detail = ""
            last_error = f"{model}: HTTP {e.code} {detail}"
        except Exception as e:
            last_error = f"{model}: {e}"
    raise RuntimeError(f"Gemini call failed: {last_error}")

def clean_offer(line: str) -> str:
    cleaned = line.strip()
    cleaned = re.sub(r"^```[a-z]*", "", cleaned, flags=re.IGNORECASE).strip()
    for _ in range(4):
        cleaned = re.sub(r"^(\*{1,2}\s*offer\s*\d+\s*\*{1,2}\s*[:.\-\)]\s*|offer\s*\d+\s*[:.\-\)]\s*|[\-\*\u2022]\s*|\d+\s*[.)]\s*|\*{1,2})", "", cleaned, flags=re.IGNORECASE).strip()
    return cleaned

def split_offers(text: str):
    raw = text.replace("\r", "").strip().strip("`").strip()
    # 1) split wherever a new "Offer N" marker starts (even mid-line, even with **bold**)
    parts = re.split(r"(?i)(?=\*{0,2}offer\s*\d+\s*[:.\-\)])", raw)
    offers = [clean_offer(p) for p in parts]
    offers = [o for o in offers if len(o) >= 12]
    # 2) fallback: split into sentences and group into 3 chunks
    if len(offers) < 3:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", raw) if len(s.strip()) >= 12]
        if len(sentences) >= 3:
            n = len(sentences)
            chunks = [" ".join(sentences[i::3]) for i in range(3)]
            offers = [clean_offer(c) for c in chunks if clean_offer(c)]
    offers = [o for o in offers if o]
    if len(offers) < 2:
        snippet = (text[:160] + "...") if len(text) > 160 else text
        raise RuntimeError(f"Gemini gave an unclear reply ({snippet.strip() or 'empty'}) - tap generate again")
    return offers[:3]

def generate_offers(customer: dict, db=None):
    prompt = build_prompt(customer, None)
    text = call_gemini(prompt)
    offers = split_offers(text)
    return {"offers": offers, "offers_text": "\n".join(f"Offer {i+1}: {o}" for i, o in enumerate(offers)), "history_used": [], "prompt": prompt}
