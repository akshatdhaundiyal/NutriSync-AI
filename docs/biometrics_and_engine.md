# NutriSync AI — Biometrics & Protocol Engine

This document details the mathematical algorithms, physiological models, and pharmacological guardrails driving NutriSync AI.

---

## 1. Rolling 7-Day Baseline Algorithm

The baseline engine calculates rolling physiological reference points from trailing wearable telemetry:

$$\text{Baseline}(M) = \frac{1}{N} \sum_{i=1}^{N} M_i \quad \text{where } N = \min(\text{available days}, 7)$$

- Evaluated metrics ($M$):
  - **Deep Sleep** (minutes)
  - **Heart Rate Variability (rMSSD)** (milliseconds)
  - **Resting Heart Rate** (beats per minute)
  - **Daily Cardiovascular Strain** (0–21 scale)

---

## 2. Readiness Scoring & State Classification

Readiness represents an integrated autonomic recovery score from `0` to `100`.

### 2.1 Delta Calculations
$$\Delta_{\text{HRV}} = \frac{\text{HRV}_{\text{today}} - \text{HRV}_{\text{baseline}}}{\text{HRV}_{\text{baseline}}} \times 100$$
$$\Delta_{\text{Sleep}} = \frac{\text{Sleep}_{\text{today}} - \text{Sleep}_{\text{baseline}}}{\text{Sleep}_{\text{baseline}}} \times 100$$
$$\Delta_{\text{RHR}} = \text{RHR}_{\text{today}} - \text{RHR}_{\text{baseline}}$$

### 2.2 Score Formula
$$\text{Score} = \text{clamp}\left(65 + 0.6 \cdot \Delta_{\text{HRV}} + 0.4 \cdot \Delta_{\text{Sleep}} - 1.2 \cdot \Delta_{\text{RHR}} - 0.5 \cdot (\text{Strain} - 10), 0, 100\right)$$

### 2.3 State Thresholds

| State | Score Range | Primary Biometric Indicators |
| :--- | :--- | :--- |
| **`optimal`** | $\ge 80$ | $\Delta_{\text{HRV}} \ge +5\%$, $\Delta_{\text{Sleep}} \ge +5\%$, Strain $< 12$, no stress spike. |
| **`balanced`** | $60 - 79$ | Metrics within $\pm 10\%$ of rolling baseline. |
| **`recovery`** | $40 - 59$ | $\Delta_{\text{HRV}} < -10\%$ or $\Delta_{\text{Sleep}} < -15\%$ or Strain $\ge 14$. |
| **`stress`** | $< 40$ | Sedentary sympathetic spike detected (`sedentaryStressSpike = true`) or severe HRV depression. |

---

## 3. Chronobiological Timing Slots

NutriSync AI partitions all recommendations into three biological absorption windows:

```
+-----------------------------------------------------------------------------------+
| MORNING (With Breakfast Fats)                                                     |
| - Fat-soluble compounds & morning cofactors (Vitamin D3 + K2, Omega-3, Vitamin C) |
+-----------------------------------------------------------------------------------+
| POST-WORKOUT (Within 45m Post-Training)                                           |
| - Glycogen & ATP replenishment (Creatine Monohydrate, Electrolytes Na/K/Mg)       |
+-----------------------------------------------------------------------------------+
| EVENING (30-90m Pre-Bed)                                                          |
| - GABA-ergic & sleep architecture agents (Magnesium Glycinate, L-Theanine, Glycine) |
+-----------------------------------------------------------------------------------+
```

---

## 4. Compound Dictionary & Default Targets

| Canonical ID | Compound Name | Default Form | Target Dose | Unit | Slot | Primary Food Sources |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `magnesium` | Magnesium | Glycinate | 200 | mg | Evening | Pumpkin seeds, Spinach, Dark chocolate |
| `creatine` | Creatine | Monohydrate | 5 | g | Post-Workout | Red meat, Salmon, Herring |
| `omega3` | Omega-3 (EPA/DHA) | Triglyceride | 2000 | mg | Morning | Wild salmon, Sardines, Walnuts |
| `vitamin-d3` | Vitamin D3 + K2 | D3 + K2 (MK-7) | 5000 | IU | Morning | Sunlight (15 min), Egg yolk, Fatty fish |
| `l-theanine` | L-Theanine | L-Theanine | 200 | mg | Evening | Green tea, Matcha |
| `ashwagandha` | Ashwagandha | KSM-66 Extract | 600 | mg | Evening | — |
| `glycine` | Glycine | Glycine | 3 | g | Evening | Bone broth, Gelatin |
| `zinc` | Zinc | Bisglycinate | 15 | mg | Evening | Oysters, Beef, Pumpkin seeds |
| `vitamin-c` | Vitamin C | Ascorbate | 500 | mg | Morning | Kiwi, Bell peppers, Citrus |
| `apigenin` | Apigenin | Apigenin | 50 | mg | Evening | Chamomile tea, Parsley, Celery |
| `electrolytes` | Electrolytes | Na/K/Mg blend | 1 | serving | Post-Workout | Coconut water, Sea salt |
| `iron` | Iron | Bisglycinate | 18 | mg | Morning | Red meat, Lentils, Spinach |
| `vitamin-b12` | Vitamin B12 | Methylcobalamin | 1000 | mcg | Morning | Eggs, Salmon, Nutritional yeast |

---

## 5. Clinical & Pharmacological Guardrails

### 5.1 Safe Daily Upper Ceilings (`UPPER_LIMITS`)
The engine warns or reduces dosage if supplemental daily intake exceeds safe thresholds:
- **Magnesium**: $350\text{ mg}$ supplemental elemental ceiling.
- **Zinc**: $40\text{ mg}$ supplemental ceiling.
- **Vitamin D3**: $4,000\text{ IU}$ daily ceiling.
- **Vitamin C**: $2,000\text{ mg}$ daily ceiling.
- **Iron**: $45\text{ mg}$ daily ceiling.

### 5.2 Absorption Competition Pairs (`INTERACTIONS`)
Flags nutrient pairs that compete for uptake when both land in the same daily stack:
1. **Zinc + Magnesium**: Compete for divalent cation transporters $\rightarrow$ *Space at least 2 hours apart.*
2. **Zinc + Iron**: Compete for DMT1 intestinal transporters $\rightarrow$ *Take at different meals.*
3. **Iron + Magnesium**: Inhibits iron absorption $\rightarrow$ *Separate by 2 hours.*
4. **Iron + Vitamin D3**: Fat-soluble D3 interferes with fasted iron absorption $\rightarrow$ *Take separately.*

---

## 6. Shelf Matching & Unit Conversion

When matching a target compound against the user's cabinet, the engine calculates the required discrete unit count:

$$\text{UnitsToTake} = \text{clamp}\left(\text{round}\left(\frac{\text{TargetDose}}{\text{DosePerUnit}_{\text{stash}}}\right), 1, 6\right)$$

*Example*: If target Magnesium dose is $400\text{ mg}$ and the user's Thorne bottle has $200\text{ mg/capsule}$, the engine generates:
> *"Take 2 capsules of your Thorne Magnesium Bisglycinate"*
