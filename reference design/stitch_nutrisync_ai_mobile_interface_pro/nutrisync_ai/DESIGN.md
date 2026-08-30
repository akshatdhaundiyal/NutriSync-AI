---
name: NutriSync AI
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#bc0b3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff7886'
  on-tertiary-container: '#780021'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-metric:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap: 16px
  card-padding: 24px
  inner-gap: 12px
  section-margin: 32px
---

## Brand & Style
The design system for this health application balances medical credibility with human warmth. It adopts a **Modern-Humanist** style, merging the structured utility of Material Design with the premium, high-contrast depth of high-end mobile operating systems. 

The aesthetic is characterized by expansive whitespace, soft elevation, and a color-coded categorical system that makes complex health data instantly glanceable. The UI should evoke a sense of calm, precision, and proactive care, avoiding the coldness of traditional clinical interfaces in favor of a soft, approachable "living" dashboard.

## Colors
The palette uses a categorical color system to differentiate health pillars. 
- **Light Mode:** Uses a soft gray-blue tint for the canvas (`#F4F6F9`) to allow white cards to pop with subtle 1px borders.
- **Dark Mode:** Employs a "True Black" (`#000000`) background to optimize OLED efficiency and maximize the contrast of metric visualizations.
- **Functional Use:** Primary colors should be used for data visualizations (rings, bars, sparklines) and active states. Soft variants are reserved for card backgrounds or large-scale highlights where high-intensity color would cause visual fatigue.

## Typography
The system uses **Hanken Grotesk** for headings and metrics to provide a modern, tech-forward character with excellent legibility at large scales. **Inter** is used for all functional UI and body text to ensure maximum clarity and accessibility.

- **Metrics:** Use `display-metric` for primary data points (e.g., Step count, Heart Rate).
- **Hierarchy:** Subtext and secondary labels should use `label-md` with the muted color `#64748B` to maintain a clear visual stack within cards.

## Layout & Spacing
The design follows a **Mobile-First Fluid Grid** with a baseline 4px/8px rhythm. 

- **Cards:** The primary layout unit. On mobile, cards usually span the full width minus the 20px container margin.
- **Density:** Use a comfortable 24px padding inside cards to give data room to "breathe."
- **Grouping:** Related metrics should be grouped in 2-column grids (e.g., Sleep and Recovery side-by-side) while high-priority insights take a full-width row.

## Elevation & Depth
This design system utilizes **Tonal Layering** combined with subtle ambient shadows. 

- **Light Mode:** Depth is created through white cards on a light-gray canvas. A very soft, diffused shadow (Blur: 12px, Y: 4px, Opacity: 4%) is applied to cards, supplemented by a 1px border (`#E2E8F0/60`) to define edges.
- **Dark Mode:** Depth is purely tonal. The canvas is `#000000`, primary cards are `#1C1C1E`, and secondary interactive elements (like inputs or nested cards) are `#2C2C2E`. No shadows are used in dark mode; instead, a subtle gray stroke (`#FFFFFF/10`) provides edge definition.

## Shapes
The shape language is extremely soft and approachable. 
- **Primary Cards:** Use a 24px (rounded-3xl) radius to create a "squircle" feel that mimics high-end hardware.
- **Buttons & Inputs:** Use a 16px radius to maintain consistency with the large card corners.
- **Progress Bars:** Use fully pill-shaped (100px) caps for a friendly, modern look.

## Components
- **Buttons:** Primary buttons use a high-saturation fill (e.g., Recovery Green) with white text. Secondary buttons use the "Soft" variant background with colored text for a subtle interactive feel.
- **Health Cards:** These should contain a `label-sm` category header, a `display-metric` value, and a small sparkline or trend indicator.
- **Data Rings:** Use thick strokes (8-12px) with rounded caps. The background track should be the "Soft" color version at 20% opacity.
- **Chips:** Small, pill-shaped tags used for activity types (e.g., "Walking," "HIIT"). Use 12px horizontal padding and 6px vertical.
- **Input Fields:** Large, 56px height fields with the background color matching the surface-tier above the canvas. Use 16px roundedness.
- **Selection Controls:** Use custom-styled radio buttons that look like large tiles for health goals to maximize tap targets.