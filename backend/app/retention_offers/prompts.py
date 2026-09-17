TELECOM_STATS = """Telecom churn insights (IBM 7043 records):
- Month-to-month contract: 42% churn
- Fiber optic internet: 41% churn
- Tenure 0-12 months: 47% churn
- Electronic check payment: 45% churn
"""

SYSTEM_PROMPT = """You are a telecom retention specialist for Indian telecom companies.
Reply with EXACTLY 3 lines and nothing else. Each line must start with "Offer 1:", "Offer 2:", "Offer 3:".
Each offer: a title plus discount/benefit plus one reason it fits this risk tier. Under 35 words per offer.
No intro line, no bullet points, no conclusion. Telecom-specific only.
"""

def build_prompt(customer, history=None):
    # No history mode - pure GenAI with telecom stats
    customer_block = f"""New customer:
- Contract: {customer['Contract']}, Internet: {customer['InternetService']}, Tenure: {customer['tenure']} months
- Monthly: ₹{customer['MonthlyCharges']}, Total: ₹{customer['TotalCharges']}
- Payment: {customer['PaymentMethod']}, Churn risk: {customer['churn_prob']:.0%} ({customer.get('risk_label','')})
- Risk Tier: {customer.get('risk_label','')} - {customer.get('risk_detail','')}
"""

    return f"{SYSTEM_PROMPT}\n{TELECOM_STATS}\n{customer_block}\nGive 3 offers now:"
