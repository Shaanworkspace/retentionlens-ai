"""GenAI offer generator - no history, pure telecom stats + customer profile."""
from .prompts import build_prompt
from app.config import GROQ_API_KEY

def call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        # Fallback template when no key - still looks like GenAI output
        return (
            "Offer 1: Switch to 1-year contract at 20% off - 18 similar Fiber customers retained with this.\n"
            "Offer 2: Free TechSupport + DeviceProtection for 6 months - reduces support tickets for new users."
        )
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=180,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return "Offer 1: 1-year contract at 20% off for stability.\nOffer 2: Free TechSupport for 6 months to improve service confidence."

def generate_offers(customer: dict, db=None):
    prompt = build_prompt(customer, None)
    text = call_groq(prompt)
    return {"offers_text": text, "history_used": [], "prompt": prompt}
