TELECOM_STATS = """Telecom churn insights (IBM 7043 records):
- Month-to-month contract: 42% churn
- Fiber optic internet: 41% churn
- Tenure 0-12 months: 47% churn
- Electronic check payment: 45% churn
"""

SYSTEM_PROMPT = """You are a telecom retention specialist for Indian telecom companies.
Given a new customer profile and telecom churn stats, suggest exactly 3 retention offers.
Format each offer on its own line starting with "Offer 1:", "Offer 2:", "Offer 3:".
Each offer must have: title, discount/benefit, and why it will work for this risk tier.
Keep total under 110 words. No generic advice - be specific to telecom and risk tier.
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
