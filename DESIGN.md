# DESIGN.md — Smart Growth Tracker Design System

## 1. Visual Hierarchy & 60-30-10 Color Architecture
- **60% Canvas & Background**:
  - App background: `#F8F9FA` (Warm off-white, soothing, clinical).
  - Cards & Surfaces: `#FFFFFF` (Crisp white with refined `#E2E8F0` border and `shadow-2xs`).
- **30% Structure & Content**:
  - Main Body Text: `#0F172A` (Deep Slate, high-contrast, WCAG AAA).
  - Secondary Text: `#475569` (Slate 600, labels, subheadings).
  - Muted Text: `#64748B` (Slate 500, timestamps, secondary units).
- **10% Intentional Accent**:
  - Primary Brand Accent: `#156E5A` (Deep Medical Teal, WHO/CDC credibility).
  - Primary Hover: `#0E5646`.
  - Accent Background Tint: `#E6F4F1` (Soft clinical teal tint).

## 2. Status Tokens
- **Routine / On Track**:
  - Fill: `#ECFDF5` | Text: `#065F46` | Border: `#A7F3D0`.
- **Caution / Additional Monitoring**:
  - Fill: `#FFFBEB` | Text: `#92400E` | Border: `#FDE68A`.
- **Alert / Action Required**:
  - Fill: `#FEF2F2` | Text: `#991B1B` | Border: `#FECACA`.

## 3. Anti-Slop Enforcements
- 🚫 **NO** generic purple-to-blue AI gradients.
- 🚫 **NO** dark mode toggles or dark slate viewports — strictly parent-friendly Light Theme.
- 🚫 **NO** floating cards without borders or nested borders inside borders.
- 🚫 **NO** small touch targets (everything interactive is $\ge 44\text{px}$).
- 🚫 **NO** decorative animations that do not communicate real state change.

## 4. Mobile Ergonomic Patterns
- **Modals**: Act as **bottom sheet drawers** on screens $< 640\text{px}$ (`rounded-t-3xl` with pull handle), centered modals on $\ge 640\text{px}$ (`rounded-2xl`).
- **Data Tables**: Transform into clean key-value card stacks on mobile (`hidden md:table` / `md:hidden`).
- **Typography**: Fluid root scaling (`16px` mobile $\rightarrow$ `17.5px` tablet $\rightarrow$ `18px` desktop).
- **Micro-interactions**: `active:scale-95` on buttons and cards for tactile haptic feedback.
