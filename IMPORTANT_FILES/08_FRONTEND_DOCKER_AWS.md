# Parts 16-18 — Frontend, Docker, Deployment (Q242-284)

## Part 16 — Frontend (Q242-253)
- 242-243. React 18.2.0 + Vite 5.0.12 + Tailwind 3.4.1 + Recharts 3.10.1 + React Router 6.22.3 + Axios 1.6.7. No redux. VERIFIED (`package.json`).
- 244. Pages/components: Landing, Login, Signup, Dashboard (company welcome + history cards), Predict (single form 6 mandatory (*), 12 optional), BatchAnalysis (drag/paste/file/S3), BatchHistory, BatchResult (overall graphs + 3 segment cards), SegmentPage (churn high/medium/low tables), BatchCustomer, CustomerDetail, Profile, Analytics (static shells), plus Navbar/Sidebar/PrivateRoute. VERIFIED (`frontend/src/` listing).
- 245-247. Calls via `frontend/src/services/api.js` (axios, base from `VITE_API_URL` or localhost:8000). VERIFIED.
- 248-250. Loading: spinner + disabled + hover on all buttons. Errors: inline red banners + 401 auto-redirect to login. Results: CustomerBoard with tier color, prob bar, tenure/contract graphs. VERIFIED.
- 251-253. Auth: token + user JSON in `localStorage` `token`/`user`, `Authorization: Bearer`. Plain.

## Part 17 — Docker (Q254-265)
- 254-255. Why: reproducible ML env. Contents: `python:3.11-slim` → `COPY requirements.txt` → `pip install` → `COPY app` + `COPY ml` → port 8000 → `uvicorn app.main:app`. VERIFIED (`backend/Dockerfile`).
- 256-257. Base slim (CPU torch not needed here — just sklearn). VERIFIED.
- 258-260. Start: `uvicorn --host 0.0.0.0 --port 8000`. Port 8000. Health not in Dockerfile (Render uses /api/health). VERIFIED.
- 261-264. Frontend/backend separate containers in `docker-compose.yml` (backend 8000, frontend nginx 80). Model in image (4KB). Env via `--env-file`. VERIFIED.
- 265. Optimize: already small (sklearn only); .dockerignore present.

## Part 18 — Deployment (Q266-284)
- 266-269. Live: frontend Vercel, backend Render (Docker, Python 3.11, free tier, Virginia) per `README.md:5` + `frontend/.env.production` placeholder. No EC2. VERIFIED (docs).
- 270-273. Render autos from `main` on commit (autoDeploy true). Start uses `$PORT`. Model in image, not S3. DOC CLAIM per `README.md`.
- 274-279. Networking: CORS `CORS_ORIGINS` + frontend `VITE_API_URL`. DB = Aiven MySQL. Ports open: 8000 (backend), 80 (frontend nginx). VERIFIED (`config.py`, `docker-compose.yml`).
- 280-284. Logs: Render dashboard. Crash: Render restarts + health check. Scale: more instances on Render, bigger DB. New version: `git push` → Render redeploy. Arch: Vercel React → Render FastAPI → pickle → Aiven MySQL.
