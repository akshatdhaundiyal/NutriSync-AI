# NutriSync AI — Local Development & Setup Guide

This guide walks you through setting up and running **NutriSync AI** locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v24.x` (verified with Node `v24.14.0` / npm `11.9.0`)
- **Python**: `3.11` to `3.13`
- **uv**: Fast Python package manager (`>= 0.7.x`)

---

## 2. Quick Start

### 2.1 Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment and install dependencies using `uv`:
   ```bash
   uv venv
   uv add fastapi uvicorn python-dotenv pydantic motor pytest requests pillow python-multipart
   ```

3. Ensure `backend/.env` exists:
   ```env
   PORT=8000
   HOST=127.0.0.1
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=nutrisync
   EMERGENT_LLM_KEY=
   ```

4. Start the backend development server:
   ```bash
   uv run uvicorn server:app --host 127.0.0.1 --port 8000
   ```
   *Health Check*: Open [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health) in your browser.

---

### 2.2 Frontend Setup (Expo Web / Mobile)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Ensure `frontend/.env` exists:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
   ```

4. Start Expo in Web mode:
   ```bash
   npm run web
   ```
   *Web App*: Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 3. Running Automated Tests

### Backend Test Suite (Pytest)
The backend test suite validates system health, protocol generation schemas, label OCR parsing, and blood-test biomarker extraction:

```bash
cd backend
uv run pytest -v
```

---

## 4. Troubleshooting & FAQ

### Issue: `'.' is not recognized as an internal or external command` on Windows
- **Cause**: The `package.json` preinstall script called `./scripts/cmd-guard.js` directly in `cmd.exe`.
- **Fix**: Prepend `node`, e.g., `"preinstall": "node ./scripts/cmd-guard.js --preinstall"`.

### Issue: `ModuleNotFoundError: No module named 'emergentintegrations'`
- **Cause**: `emergentintegrations` is an internal cloud library for Emergent Universal keys.
- **Fix**: The local `server.py` implements a graceful fallback so all local endpoints and mock/direct client AI channels work without it.

### Issue: Web Storage Persistence
- On mobile, persistence uses `expo-sqlite` and `expo-secure-store`.
- On web, persistence automatically falls back to `AsyncStorage` backed by browser `IndexedDB`.
