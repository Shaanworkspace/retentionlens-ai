TELECOM_STATS = """Telecom churn insights (IBM 7043 records):
- Month-to-month contract: 42% churn
- Fiber optic internet: 41% churn
- Tenure 0-12 months: 47% churn
- Electronic check payment: 45% churn
"""

SYSTEM_PROMPT = """You are a telecom retention specialist for Indian telecom companies.
Given a new customer and past success cases, suggest exactly 2 retention offers.
Each offer must have: title, discount/benefit, and why it will work.
Keep total under 70 words. No generic advice - be specific to telecom.
"""

def build_prompt(customer, history):
    if history:
        context = "\n".join([f"- {h}" for h in history])
        history_block = f"Past retained customers (similar segment):\n{context}"
    else:
        history_block = "Past history: No prior retained cases for this exact segment. Use telecom stats."

    customer_block = f"""New customer:
- Contract: {customer['Contract']}, Internet: {customer['InternetService']}, Tenure: {customer['tenure']} months
- Monthly: ₹{customer['MonthlyCharges']}, Total: ₹{customer['TotalCharges']}
- Payment: {customer['PaymentMethod']}, Churn risk: {customer['churn_prob']:.0%}
"""

    return f"{SYSTEM_PROMPT}\n{TELECOM_STATS}\n{history_block}\n\n{customer_block}\nGive 2 offers now:"
