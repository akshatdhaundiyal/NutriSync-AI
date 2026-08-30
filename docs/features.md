# NutriSync AI — Feature Catalog

This document details all user-facing features in NutriSync AI across its five primary application sections: **Dashboard (Today)**, **Cabinet (Stash)**, **Scan & Import**, **Trends (N=1)**, and **Settings & Simulator**.

---

## 1. 🏠 Dashboard (Today)

The primary command center presenting chronobiological supplement recommendations tailored to daily wearable telemetry and personal shelf inventory.

### 1.1 Daily Readiness Score & State Ring
- **Circular SVG Progress Ring**: Visualizes readiness from `0` to `100` with animated SVG gradients.
- **Physiological State Classification**:
  - **Optimal (Green / Emerald)**: High HRV, low resting HR, high deep sleep, low strain.
  - **Balanced (Indigo / Blue)**: Baseline-level recovery and strain.
  - **Recovery (Amber / Warning)**: High strain or reduced HRV/sleep requiring restorative support.
  - **Stress Load (Crimson / Danger)**: Sedentary sympathetic spike or acute autonomic stress.

### 1.2 Biometric Delta Pills
Displays today's biometric readouts compared against the user's 7-day rolling baselines:
- **Deep Sleep**: Formatted in hours and minutes (`Xh Ym`) with percentage delta (`+X%` / `-X%`).
- **Heart Rate Variability (HRV)**: Measured in milliseconds (`ms`) with percentage delta vs. baseline.
- **Daily Strain**: Overall strain score (0–21 scale) indicating training and cardiovascular load.

### 1.3 Protocol Mode Selector
A single tap re-tunes the entire day's supplement protocol based on contextual demands:
- **Auto**: Standard chronobiology mode driven by telemetry and lab deficiencies.
- **Travel**: Focuses on circadian re-syncing, sleep across time zones, travel calming, and hydration.
- **Illness**: Immunomodulatory focus (e.g., Vitamin C, Zinc, Vitamin D3).
- **Deload**: Parasympathetic recovery and training inflammation reduction during recovery weeks (e.g., Omega-3, Glycine, Magnesium).

### 1.4 Adherence Streak Card
- Tracks consecutive days the user consumed their complete daily protocol (or adhered to zero-pill whole food focus).
- Displays **Current Streak**, **All-Time Best Streak**, and real-time status badge (`Complete` vs `Pending`).

### 1.5 Acute Stress Interdiction & Breath Pacer CTA
- Automatically appears when an acute sedentary stress spike is detected (`readiness.state === "stress"`).
- Highlights the physiological down-regulation requirement before taking supplements.
- Features a direct one-tap button to launch the **2-Minute Cyclic Sighing Breath Pacer**.

### 1.6 Anti-Overdose & Interaction Guardrail Card
- Inspects the active daily stack against pharmacological interactions and safe daily limits.
- Alerts user to absorption competition (e.g., *Zinc + Magnesium compete for identical transporters — space 2 hours apart*).
- Flags excessive dosages exceeding safe daily ceilings.

### 1.7 Low-Stock Reorder Card
- Scans user cabinet inventory for items running below 15% capacity (or $\le 10$ units).
- Provides instant one-tap reorder buttons opening localized merchant links in browser.

### 1.8 Bloodwork Signals Card
- Highlights low lab biomarkers detected from blood tests (e.g., Ferritin, Vitamin D, Magnesium).
- Confirms how each deficient marker is actively auto-flowing into the day's protocol stack.
- Allows one-tap clearing of lab data when resolved.

### 1.9 Chrono-Protocol Timeline
- Chronobiological stack partitioned into **Morning**, **Post-Workout**, and **Evening** slots.
- **Product-Specific Dosing**: If an item is in the user's cabinet, calculates the exact capsule/scoop count (e.g., *Take 2 capsules of your Thorne Magnesium Bisglycinate*).
- **Buy New Alternatives**: If not in cabinet, provides the recommended compound dose with one-tap merchant purchase options.
- **Whole-Food Alternatives**: Highlights dietary sources (e.g., pumpkin seeds, wild salmon, kiwi).
- **Interactive Check-Off**: One-tap completion logging with haptic feedback that decrements cabinet inventory and updates adherence history.

### 1.10 Zero-Pill "System Balanced" State
- When biometrics indicate optimal readiness and no lab deficiencies exist, the app suppresses pill intake and presents a **"System Balanced — Whole Food Focus"** recommendation.

---

## 2. 💊 Cabinet (Stash)

A personal supplement inventory manager that bridges abstract nutritional recommendations with physical bottles on the shelf.

### 2.1 Live Search & Fast Filtering
- Real-time search bar filtering across brand names, product names, and active chemical forms.
- Filter chips:
  - **All**: Entire active cabinet inventory.
  - **Optimal**: Highly bioavailable / chelated forms (e.g., Bisglycinate, Monohydrate, MK-7, KSM-66).
  - **Low Bioavail.**: Forms with inferior absorption (e.g., Oxide, Carbonate, Cyanocobalamin).
  - **Running Low**: Items at or below 15% remaining capacity.

### 2.2 Icon-Tile Supplement Cards
- Distinct compound icons (e.g., moon for Magnesium, flash for Creatine, water for Omega-3).
- Chemical-form quality badges (`Optimal`, `Good`, `Low Bioavailability`).
- Real-time stock progress bar (turns amber/warning when running low).
- Interactive `+` / `-` stock steppers to quickly adjust remaining count.
- Soft-delete trash button with instant undo/toast notification.

### 2.3 "Recommended · Not in Cabinet" Card
- Automatically identifies high-priority protocol recommendations that the user currently lacks in their cabinet.
- Provides a one-tap localized **Buy** button configured to the user's active region.

---

## 3. 📷 Scanner & OCR Lab Import

Multi-modal capture capabilities powered by Gemini Vision and fallback extraction.

### 3.1 Supplement Label OCR
- Snap a picture of any supplement bottle label using the device camera or photo library.
- Extracts brand, product name, active compound, chemical form, dose per unit, dose unit, unit type, and total units per container.
- Automatically grades the chemical form quality and pre-fills the addition form for review.

### 3.2 Blood-Test Panel OCR
- Snap or upload a photo of a diagnostic lab report (e.g., Quest, Labcorp, local diagnostics).
- Extracts key biomarkers: Ferritin, Vitamin D (25-OH), Magnesium (RBC), Vitamin B12, and their status (`low`, `normal`, `high`).
- Flags `low` markers directly into the dosing engine so protocols prioritize deficiency correction.

### 3.3 Manual Entry Fallback
- Full-featured manual form to input custom brands, doses, units, and forms without camera access.

---

## 4. 📈 Trends (N=1 Correlation)

Quantified-self analysis correlating supplement compliance with biometric recovery.

### 4.1 14-Day Dual-Metric Charts
- Interactive SVG line charts tracking **Deep Sleep Duration** (minutes) and **Heart Rate Variability** (ms).
- Overlay markers: Filled dots indicate days the protocol was taken vs. unfilled dots on off-days.

### 4.2 N=1 Efficacy Insight Engine
- Calculates mathematical lift comparing biometric averages on protocol days vs. unsupplemented days (e.g., *"+12m Deep Sleep on stack days"*).
- Visualizes 7-day rolling baselines directly beneath the chart.

---

## 5. ⚙️ Settings & Simulator

Full customization of themes, stores, AI backends, and telemetry simulators.

### 5.1 Appearance & Dual Theme
- Seamless toggle between **System**, **Biohacker Dark**, and **Clinical Light** modes.
- Instant token switching without app reload.

### 5.2 Region & Localized Store
- Selects target region: **United States (`US`)**, **India (`IN`)**, **United Kingdom (`UK`)**, **Europe (`EU`)**, or **Global (`GLOBAL`)**.
- Dynamically routes procurement links to local merchants (Amazon.com, Amazon.in, Tata 1mg, iHerb, Amazon.co.uk, Amazon.de).

### 5.3 AI Engine Configuration
- **Offline Mock Engine (Default)**: 100% deterministic, instant on-device protocol generator.
- **Gemini Direct**: Uses user's Google Gemini API key stored in secure hardware keychain.
- **OpenAI Direct**: Uses user's OpenAI API key stored in secure hardware keychain.
- **Emergent GPT-5.4 / Gemini 3.1 Pro**: Cloud proxy via Emergent Universal Key.

### 5.4 Biometric Data Source Switcher
Allows seamless switching between synthetic simulation and real-world device integration:
- **Mock Simulator**: Select from authentic physiological scenarios (**Heavy Leg Day**, **Acute Stress Spike**, **Optimal Readiness**) to test chronobiology responses and stack tuning deterministically.
- **Live Health Connect**: Direct hardware integration channel with Android Health Connect service:
  - Connects to `com.google.android.apps.healthdata` in native builds (`Native Ready`).
  - Employs an intelligent dev-bridge in browser preview mode (`Bridge Mode`).
  - Reads Sleep Stages, RMSSD Heart Rate Variability, Resting Heart Rate, and Exercise Strain.
  - Interactive **"Sync Live Data Now"** action with real-time biometric ingestion into the recommendation engine.

### 5.5 Health Connect Permissions
- Dedicated controls for **Sleep Stages**, **Heart Rate Variability**, and **Workouts & Strain** permissions.

### 5.6 Custom Biometric Targets
- **Target Baseline HRV (ms)**: Configurable personal reference point for optimal parasympathetic recovery.
- **Minimum Deep Sleep Target (min)**: Daily slow-wave sleep threshold triggering GABA-ergic restorative protocols when breached.
- **Max Daily Strain Ceiling**: Threshold for elevated exertion triggering phosphocreatine and electrolyte replenishment.

### 5.7 Data Backup, Export & Restore
- **JSON Backup Export**: One-tap download of the complete on-device database (stash, 14-day telemetry, intake history, adherence streaks, lab blood markers, settings).
- **CSV Telemetry Export**: Download 14-day telemetry rows as CSV for spreadsheet analytics (Excel, Google Sheets).
- **JSON Restore Modal**: In-app restoration interface to paste and recover data from prior backups.

