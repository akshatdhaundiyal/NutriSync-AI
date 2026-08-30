# NutriSync AI Documentation

Welcome to the comprehensive documentation for **NutriSync AI** — a chronobiology-aware, on-device sports nutrition and supplement intelligence platform built with React Native (Expo) and FastAPI.

---

## 📚 Documentation Index

| Document | Description |
| :--- | :--- |
| [**Architecture Overview**](./architecture.md) | High-level system design, client-side execution model, state management, storage, and backend proxy layer. |
| [**Feature Catalog**](./features.md) | In-depth breakdown of every user-facing feature across Dashboard, Cabinet, Trends, Scanner, and Settings. |
| [**Biometric & Protocol Engine**](./biometrics_and_engine.md) | Algorithms for 7-day rolling baselines, readiness scoring, chronobiological slotting, anti-overdose ceilings, and interaction guardrails. |
| [**API Reference**](./api_reference.md) | Complete specification of FastAPI proxy endpoints, request/response JSON schemas, and AI provider integrations. |
| [**Design System & Theme Tokens**](./design_system.md) | Theme tokens (Biohacker Dark & Clinical Light), typography scale, spacing tokens, and component design patterns. |
| [**Local Development Guide**](./local_development.md) | Step-by-step setup instructions for running the Expo Web frontend and FastAPI backend locally. |

---

## ⚡ Key Principles

1. **100% Client-Side Intelligence**:
   - Biometric processing, rolling baselines, readiness scoring, and protocol generation run entirely on-device via TypeScript without cloud dependency.
   - Built-in **Offline Mock Engine** works instantly out-of-the-box.
2. **Bring Your Own Key (BYOK) & Privacy-First**:
   - Direct Google Gemini and OpenAI API calls run directly from the device with keys stored in the hardware-backed keychain (`expo-secure-store`). Keys never pass through intermediary servers.
3. **Anti-Overdose & Clinical Guardrails**:
   - Hard daily ceiling enforcement (e.g., max 3 active supplements/day).
   - Dynamic absorption-competition alerts (e.g., zinc vs. iron, magnesium vs. calcium).
   - "Zero-Pill" whole food state when telemetry indicates optimal physiological balance.
4. **Localized Procurement**:
   - Real-time conversion of active deficiencies and protocol recommendations into localized buy links (Amazon, iHerb, Tata 1mg) based on user region.
