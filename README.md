# NutriSync AI ⚡💊

> **Chronobiology-Aware On-Device Sports Nutrition & Supplement Intelligence Platform**

NutriSync AI bridges wearable biometric telemetry (Heart Rate Variability, Deep Sleep, Daily Strain) with your personal supplement cabinet to generate personalized, chronobiologically-timed supplement stacks, anti-overdose guardrails, and localized procurement links.

---

## 🌟 Key Features

- **🏠 Daily Command Center**: Circular readiness scoring (Optimal / Balanced / Recovery / Stress), biometric delta pills, interactive chrono-timeline (Morning / Post-Workout / Evening), and zero-pill whole food mode.
- **⚡ Dynamic Context Modes**: One-tap stack switching for **Auto**, **Travel**, **Illness**, and **Deload** protocols.
- **🛡️ Clinical & Safety Guardrails**: Hard daily ceiling checks ($\le 3$ active supplements/day) and absorption-competition warnings (Zinc vs. Iron, Magnesium vs. Calcium).
- **💊 Personal Cabinet Shelf**: Search, filter chips (`Optimal`, `Low Bioavail.`, `Running Low`), quality badges, stock progress bars, and steppers.
- **📷 Vision & Lab OCR**: Snap a supplement bottle to extract facts or import a blood-test report to auto-correct biomarker deficiencies.
- **📈 Quantified-Self Trends**: 14-day Deep Sleep & HRV charts with intake correlation dots and N=1 Efficacy Insight.
- **🫁 Acute Stress Interdiction**: Automated stress spike detection launching a 2-minute cyclic sighing breath pacer.
- **🔒 Privacy & 100% On-Device**: Built-in Offline Mock Engine + Direct BYOK for Gemini & OpenAI stored in the hardware keychain.

---

## 📖 Documentation Suite

Comprehensive technical and architecture documentation is available in the [`docs/`](./docs) directory:

- [**Documentation Hub**](./docs/README.md)
- [**Architecture Overview**](./docs/architecture.md)
- [**Feature Catalog**](./docs/features.md)
- [**Biometrics & Protocol Engine**](./docs/biometrics_and_engine.md)
- [**Backend API Reference**](./docs/api_reference.md)
- [**Design System & Theme Tokens**](./docs/design_system.md)
- [**Local Development & Setup Guide**](./docs/local_development.md)

---

## 🚀 Quick Local Run

### 1. Backend (FastAPI)
```bash
cd backend
uv run uvicorn server:app --host 127.0.0.1 --port 8000
```

### 2. Frontend (Expo Web)
```bash
cd frontend
npm run web
```
Open [http://localhost:8081](http://localhost:8081) in your browser.
