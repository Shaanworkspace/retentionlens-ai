"""Customer records - handles per-company customer storage."""
def format_customer_for_prompt(row: dict, churn_prob: float) -> dict:
    row["churn_prob"] = churn_prob
    return row
