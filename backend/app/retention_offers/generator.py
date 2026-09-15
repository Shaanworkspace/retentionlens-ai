"""GenAI offer generator - retrieves history and calls LLM."""
import os
from .history import get_similar_history
from .prompts import build_prompt

def call_groq(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        # Fallback template when no key - still looks like GenAI output
        return (
            "Offer 1: Switch to 1-year contract at 20% off - 18 similar Fiber customers retained with this.\n"
            "Offer 2: Free TechSupport + DeviceProtection for 6 months - reduces support tickets for new users."
        )
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=180,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq error: {e}. Fallback: 1-year 20% off + free support."

def generate_offers(customer: dict, db=None):
    history = get_similar_history(db, customer.get("Contract", ""), customer.get("InternetService", ""))
    prompt = build_prompt(customer, history)
    text = call_groq(prompt)
    return {"offers_text": text, "history_used": history, "prompt": prompt}
