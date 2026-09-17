"""GenAI offer generator - Gemini primary, Groq fallback. No fake data: raises if unconfigured."""
import json
import re
import urllib.request
from .prompts import build_prompt
from app.config import GROQ_API_KEY

try:
    from app.config import GEMINI_API_KEY
except Exception:
    GEMINI_API_KEY = ""

class GenAINotConfigured(Exception):
    pass

def call_gemini(prompt: str) -> str | None:
    if not GEMINI_API_KEY:
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        body = json.dumps({"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.6, "maxOutputTokens": 300}}).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=25) as resp:
            out = json.loads(resp.read().decode())
        return out["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        raise RuntimeError(f"Gemini call failed: {e}")

def call_groq(prompt: str) -> str | None:
    if not GROQ_API_KEY:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=300,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"Groq call failed: {e}")

def clean_offer(line: str) -> str:
    # strip repeated "Offer 1:" / "1." / "-" prefixes so UI heading never duplicates
    cleaned = line.strip()
    for _ in range(3):
        cleaned = re.sub(r"^(offer\s*\d+\s*[:.\-\)]\s*|[\-\*\u2022]\s*|\d+\s*[.)]\s*)", "", cleaned, flags=re.IGNORECASE).strip()
    return cleaned

def split_offers(text: str):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    offers = [clean_offer(l) for l in lines if re.match(r"(?i)^offer\s*\d+", l.strip())]
    if len(offers) < 3:
        rest = [clean_offer(l) for l in lines if clean_offer(l) and clean_offer(l) not in offers]
        offers = (offers + rest)[:3]
    offers = [o for o in offers if o]
    if len(offers) < 3:
        raise RuntimeError("GenAI returned fewer than 3 offers - try again")
    return offers[:3]

def generate_offers(customer: dict, db=None):
    if not GEMINI_API_KEY and not GROQ_API_KEY:
        raise GenAINotConfigured("GenAI keys missing - set GEMINI_API_KEY or GROQ_API_KEY on the server")
    prompt = build_prompt(customer, None)
    text = call_gemini(prompt) if GEMINI_API_KEY else call_groq(prompt)
    if not text:
        raise RuntimeError("GenAI returned empty response - try again")
    offers = split_offers(text)
    return {"offers": offers, "offers_text": "\n".join(f"Offer {i+1}: {o}" for i, o in enumerate(offers)), "history_used": [], "prompt": prompt}
