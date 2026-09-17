"""GenAI offer generator - Gemini primary, Groq fallback, template last. Always min 3 offers."""
import json
import urllib.request
from .prompts import build_prompt
from app.config import GROQ_API_KEY

try:
    from app.config import GEMINI_API_KEY
except Exception:
    GEMINI_API_KEY = ""

FALLBACK_3 = (
    "Offer 1: Switch to 1-year contract at 20% off - month-to-month churn is 42%, a longer term locks the saving in.\n"
    "Offer 2: Free TechSupport + DeviceProtection for 6 months - cuts support friction for new fiber users.\n"
    "Offer 3: Loyalty data bonus (50GB/month for 3 months) - rewards staying without changing the bill."
)

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
    except Exception:
        return None

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
    except Exception:
        return None

def split_offers(text: str):
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    offers = [l for l in lines if l.lower().startswith("offer")]
    if len(offers) < 3:
        offers = lines[:3] if len(lines) >= 3 else lines
    while len(offers) < 3:
        offers.append(FALLBACK_3.split("\n")[len(offers)])
    return offers[:3]

def generate_offers(customer: dict, db=None):
    prompt = build_prompt(customer, None)
    text = call_gemini(prompt) or call_groq(prompt) or FALLBACK_3
    return {"offers": split_offers(text), "offers_text": text, "history_used": [], "prompt": prompt}
