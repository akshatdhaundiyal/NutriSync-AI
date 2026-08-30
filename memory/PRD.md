# NutriSync AI — Product Requirements & Build Log

## Original Problem Statement
Build "NutriSync AI", a modern, 100% client-side React Native + Expo mobile app. It interfaces with (simulated) Android Health Connect telemetry, manages a personal supplement cabinet stash, computes 7-day rolling baselines locally, and connects to Google Gemini + OpenAI to generate chronobiologically-timed, product-specific supplement protocols with localized buy links. Dual theme (Biohacker Dark / Clinical Light / System). Differentiators: (1) cabinet stash + product-specific dosing engine, (2) localized smart procurement, (3) dynamic chrono-nutrition timeline, (4) acute stress interdiction + anti-overdose guardrails (≤3 active supplements/day, zero-pill "System Balanced" state).

## User Choices
- AI: Offline Mock Engine out-of-the-box + user-pasted Gemini/OpenAI direct keys + Emergent Universal Key option (GPT-5.4 & Gemini 3.1 Pro, both selectable in-app). OCR via Gemini 3 Flash (Emergent).
- Health Connect: simulator-driven + stubbed permission flow for later native build.
- Storage: expo-secure-store (API keys) + expo-sqlite for data (AsyncStorage fallback on web).
- Photo scanning: real camera/library capture + Gemini Vision OCR, with mock fallback.
- Theme default: System.
- Design language: Apple Health / Google Health inspired (Geist + GeistMono fonts).

## Architecture
- **Frontend**: Expo SDK 54, expo-router (file-based), Zustand store, react-native-svg (rings/charts), react-native-reanimated (motion), expo-image-picker (scanner), expo-secure-store, expo-sqlite (native) / AsyncStorage (web), react-native-keyboard-controller. StyleSheet-based dual-theme token system (no NativeWind).
- **Backend**: FastAPI thin proxy for the Emergent Universal Key path only (`emergentintegrations` LlmChat): `/api/ai/generate-protocol` (gpt-5.4 / gemini-3.1-pro-preview) and `/api/ai/ocr-label` (gemini-3-flash-preview). Direct Gemini/OpenAI + mock engine run fully client-side.
- **On-device computation**: 7-day rolling baseline + readiness score + dosing engine + procurement links all local in TypeScript.

## User Personas
- Quantified-self biohacker tracking HRV/sleep/strain who wants a data-driven, no-fluff daily supplement protocol tied to their actual cabinet inventory.
- Privacy-conscious user who wants everything on-device and brings their own LLM key (or uses the managed Emergent key).

## Core Requirements (static)
- Dual theme with instant toggle + system sync.
- Readiness ring (0-100) with Deep Sleep / HRV / Strain deltas vs baseline.
- Chrono-stack timeline (Morning / Post-Workout / Evening) with product-specific dosage, rationale, food alternatives, In-Stash vs Buy-New badges + merchant links, one-tap check-offs.
- Acute stress interdiction banner + 2-min cyclic-sighing breath pacer.
- Anti-overdose guardrail: ≤3 active supplements/day; zero-pill "System Balanced — Whole Food Focus" when optimal.
- Cabinet stash with chemical-form quality badges + stock counters + vision scanner.
- N=1 trends: 14-day HRV/Deep Sleep chart with intake markers + efficacy insight.
- Settings: region/store, theme, AI provider, secure API keys, telemetry simulator presets, Health Connect toggles.

## Implemented (2026-06)
- [x] Dual-theme token system (Biohacker Dark / Clinical Light) + Geist/GeistMono fonts (static-instanced).
- [x] 4-tab navigation (Today / Stash / Trends / Settings) with iOS26 NativeTabs gate + classic Tabs fallback.
- [x] Dashboard: readiness ring, delta tags, stress banner, chrono cards, sync & re-analyze.
- [x] Breath pacer modal (cyclic sighing, phase machine, timer, pause/resume).
- [x] Cabinet Stash: filters, quality badges, stock steppers, soft-delete, FAB scanner.
- [x] Vision scanner / manual add modal (camera + library + Gemini OCR + mock fallback).
- [x] Trends: 14-day SVG chart (HRV/Deep Sleep) with intake markers + N=1 efficacy insight.
- [x] Settings: theme, region (US/IN/UK/EU/Global) buy-link switching, 5 AI providers, secure API keys, 3 simulator presets, Health Connect mock toggles.
- [x] Local baseline + readiness + dosing engine; procurement link generator.
- [x] Backend Emergent proxy (generate-protocol + ocr-label). Verified live (GPT-5.4, Gemini 3.1 Pro, Gemini 3 Flash).
- [x] Full test pass: backend 6/6 pytest PASS; all frontend flows verified.

## Backlog (prioritized)
- P1: Stack adherence streak + in-app low-stock reorder cards.
- P1: Supplement interaction / daily-ceiling guardrail warnings (anti-overdose depth).
- P2: Travel / illness / deload protocol modes.
- P2: Blood-test panel import → auto-flag deficiencies into protocol.
- P2: Migrate RN-web-deprecated style props (pointerEvents, shadow*, useNativeDriver) — cosmetic.
- P2: Verify StressBanner→/breath router.push in a native/production build (works via route + direct URL).

## Next Tasks
- Await user direction on backlog; recommend adherence streak + interaction guardrails next.
