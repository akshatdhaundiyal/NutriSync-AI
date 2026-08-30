# NutriSync AI — Design System & Theme Tokens

NutriSync AI implements a custom, token-based design system combining the approachable clarity of **Apple Health** with the tactical precision of a quantified-self biohacking telemetry dashboard.

---

## 1. Dual-Theme Color Palettes

The application features instant switching between **Biohacker Dark** and **Clinical Light** palettes via React Native `StyleSheet` tokens (no NativeWind / Tailwind).

### 1.1 Color Tokens Matrix

| Token Name | Biohacker Dark | Clinical Light | Purpose |
| :--- | :--- | :--- | :--- |
| `canvas` | `#0b1420` | `#f8f9ff` | Application background |
| `surface` | `#131f30` | `#ffffff` | Primary card background |
| `surfaceAlt` | `#16233a` | `#eff4ff` | Secondary card background |
| `surfaceTertiary`| `#1c2b40` | `#e5eeff` | Form input & pill backgrounds |
| `text` | `#eaf1ff` | `#0b1c30` | High-contrast body text |
| `textMuted` | `#a9bccf` | `#3c4a42` | Subtitles, labels, rationales |
| `textFaint` | `#6f8296` | `#6c7a71` | Helper hints, timestamps |
| `brand` | `#4edea3` (Emerald) | `#006c49` (Forest) | Primary brand accent, optimal status |
| `brandSoft` | `rgba(78,222,163,0.14)`| `rgba(0,108,73,0.10)` | Soft tinted badge backgrounds |
| `accent` | `#c0c1ff` (Indigo) | `#4648d4` (Royal) | Secondary accent, timeline slots |
| `warning` | `#fbbf24` (Amber) | `#b45309` (Amber) | Recovery state, low stock alert |
| `danger` | `#ffb4ab` (Crimson) | `#ba1a1a` (Crimson) | Stress load, lab deficiency |
| `border` | `#243349` | `#dbe4f0` | Standard card and input border |

---

## 2. Typography

All typography is rendered using static instanced fonts loaded at cold start:
- **Display & Headings**: `HankenGrotesk-Bold` and `HankenGrotesk-SemiBold` (modern clinical editorial aesthetic).
- **Body Text**: `Inter-Regular`, `Inter-Medium`, `Inter-SemiBold` (maximum legibility across mobile & web).
- **Tabular Figures & Metrics**: `HankenGrotesk-Bold` used for readiness scores, stock counters, and biometric deltas.

### Type Scale
```typescript
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 52, // Readiness Ring Score
};
```

---

## 3. Spacing & Radius Tokens

### Spacing Scale
- `xs`: $4\text{px}$
- `sm`: $8\text{px}$
- `md`: $12\text{px}$
- `lg`: $16\text{px}$
- `xl`: $24\text{px}$
- `xxl`: $32\text{px}$
- `xxxl`: $48\text{px}$

### Radius Tokens
- `sm`: $8\text{px}$ (inner badges, food tags)
- `md`: $12\text{px}$ (buttons, inputs, stepper controls)
- `lg`: $16\text{px}$ (data cards, modal containers)
- `xl`: $24\text{px}$ (hero banners)
- `pill`: $999\text{px}$ (floating tab bar, status chips)

---

## 4. Key Component Patterns

### 4.1 Readiness Ring (`<ReadinessRing />`)
- Rendered via `react-native-svg` (`Circle`, `LinearGradient`).
- Features glowing drop-shadows in Dark Mode and crisp high-contrast track in Light Mode.
- Center features an oversized $52\text{px}$ tabular readout with uppercase state chip.

### 4.2 Chrono Timeline (`<ChronoTimeline />`)
- Vertical dotted connector line linking chronological intake events.
- Left-aligned circular node icons with distinct slot colors (Morning: Sun / Gold, Post-Workout: Barbell / Brand, Evening: Moon / Indigo).
- Right-side interactive check-off circle triggering subtle haptic pulses.

### 4.3 Screen Header & Sub-Header Context Line (`<ScreenHeader />`)
- **Top Row**: Persistent App Logo/Avatar ($36\times 36\text{px}$) + App Name (`NutriSync AI` in $17\text{px}$ bold) on left; Circular Sync and Settings buttons ($36\times 36\text{px}$) on right.
- **Context Sub-Line**: Renders below the header with a colored bullet indicator providing contextual details (e.g. `Today · Sunday, Aug 30`, `Cabinet · 4 supplements on shelf`, `Trends · N=1 14-day correlation`).
- **Child Views**: Displays a back arrow button for screens like Settings.

### 4.4 Floating Pill Bottom Navigation (`<FloatingTabBar />`)
- Compact 3-tab pill floating above safe-area insets (`Today`, `Cabinet`, `Trends`).
- Settings is accessible directly via the top header gear icon, keeping the bottom navigation ultra-clean.
- Active tab displays an expanded badge with icon + label (`bg-primaryContainer text-onPrimaryContainer`).

