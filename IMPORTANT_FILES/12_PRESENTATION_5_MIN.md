# Project Presentation — 5 to 10 Minute Script

## 1. What does it do? (30 sec)
**"RetentionLens AI reads any telecom customer — one by one or 5000 at once from a CSV — and tells the team three things: will this customer stay, does he tend to churn, or will he churn — with a probability."**

## 2. What was the problem? (30 sec)
**"Churn is 26 percent in this data. Month-to-month contracts churn 42 percent, fiber 41 percent. The team could not score single customers and batches in the same place, nor keep a history of who was scored."**

## 3. How we solved it — parts (4 min)
**"I split the solution into 5 parts and connected them one by one."**

**Part 1 — Data.** "IBM Telco 7043 rows, 7021 after median impute on TotalCharges and dedup. Six mandatory drivers kept strict, twelve weak signals made optional with safe defaults."

**Part 2 — Model.** "ColumnTransformer plus LogisticRegression/RF/XGBoost bake-off with 5-fold CV on F1. Logistic won at F1 0.591, ROC-AUC 0.841. Three tiers at 0.40 and 0.65 map probability to Stay, Tends, Will Churn. Pickle 4KB."

**Part 3 — Backend.** "FastAPI with JWT 60 min, mandatory-field validation, batch 20MB/5000 rows plus S3 streaming to 200k, history per user."

**Part 4 — Storage.** "Aiven MySQL: users plus predictions plus batch_runs and batch_items, last 10 singles and last 50 batches, detail tables keep per-row data."

**Part 5 — Screen + Server.** "React dashboard on Vercel, Docker backend on Render t3, model inside the image, MySQL on Aiven."

## 4. Connect the line (1 min)
**"CSV drops on Vercel, Axios posts to Render, fill_defaults, mandatory check, Pipeline predicts, tier maps, MySQL saves, JSON back, board draws the color and graphs — one straight line."**

## 5. Challenges + honesty (1 min)
**"Three real fights: TotalCharges blanks broke the pipeline so we median-filled; optional fields blocked batch uploads so we made them skippable; Render cold start lost the model path so we added three fallbacks. And honestly: single worker, no load test, and no GenAI by choice — we are prediction-only."**

## 6. Closing line (10 sec)
**"One customer in, tier plus probability out — batch or single, history kept, interview-ready."**
