# DropSpot — Limited Stock & Waitlist Platform
Project start time: 202511101556
Overview
--------
This repository is an implementation for the Alpaco DropSpot case. It contains:
- `backend/` — Node.js + Express API using SQLite (better-sqlite3)
- `frontend/` — Minimal React app for manual testing and demo
Seed and priority scoring
-------------------------
As required, a seed is produced from the git remote, the first commit epoch, and the project start time. The computed seed for this run is stored at `backend/SEED.txt` and is:
```
ec7c492318bb
```

Coefficients A/B/C are derived from the seed and used to compute a deterministic `priority_score` for waitlist ordering. See `backend/config.js` for the exact derivation and `backend/seed.js` for the seed generation method.

Quick start
-----------

Backend:

1. cd backend
2. npm install
3. npm run start

Frontend:

1. cd frontend
2. npm install
3. npm start

Notes
-----
- The project start time (used for seed generation) is `202511101556` (YYYYMMDDHHmm).

Local development notes
-----------------------
- Node version: use Node 18 (LTS) for local development and CI. `better-sqlite3` is a native addon and currently requires a Node version with compatible V8 headers. The included CI uses Node 18 so tests and native modules build.

Admin authentication
--------------------
- Admin endpoints accept either `?admin=true` (convenience) or an Authorization header using a bearer token:
	- Header: `Authorization: Bearer <ADMIN_TOKEN>`
	- Set `ADMIN_TOKEN` as an environment variable locally or in CI secrets for production use. The server checks the token before allowing admin CRUD operations.

See the `backend/` and `frontend/` READMEs for more details, and the main case README to be finalized with screenshots and tests.
