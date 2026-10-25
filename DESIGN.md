---
name: Gradelytics
description: An academic workspace for records, progress, and planning.
colors:
  plum: "#3A0F34"
  paper: "#DDE3E8"
  surface: "#F9FAFB"
  surface-alt: "#EFF2F5"
  rail: "#E8EDF1"
  muted: "#6B606E"
  border: "#CBD0D6"
  border-soft: "#E1E3E8"
  on-selected: "#F0EAF0"
  chart: "#76456C"
  apricot: "#EFD0B6"
  warm: "#F1DFD0"
  warm-ink: "#60442E"
  success: "#37674F"
  success-bg: "#E4EDE6"
  danger: "#9B3A3D"
  danger-bg: "#F4E6E5"
  dark-surface: "#471D40"
  dark-surface-alt: "#3E1538"
  dark-rail: "#2C0C28"
  dark-muted: "#C3B4C2"
  dark-border: "#694661"
  dark-border-soft: "#5A3552"
  dark-chart: "#DAB4D1"
typography:
  headline:
    fontFamily: "DM Sans Variable, Segoe UI, sans-serif"
    fontSize: "31px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-1.05px"
  title:
    fontFamily: "DM Sans Variable, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.25px"
  body:
    fontFamily: "DM Sans Variable, Segoe UI, sans-serif"
    fontSize: "13px"
  label:
    fontFamily: "DM Sans Variable, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 550
  metric:
    fontFamily: "DM Sans Variable, Segoe UI, sans-serif"
    fontSize: "37px"
    fontWeight: 550
    lineHeight: 1.1
    letterSpacing: "-1.3px"
rounded:
  badge: "5px"
  field: "6px"
  control: "7px"
  note: "8px"
  panel: "12px"
spacing:
  icon-gap: "8px"
  control-inline: "15px"
  panel-gap: "20px"
  panel-inset: "24px"
  desktop-gutter: "37px"
components:
  button-primary:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.on-selected}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
    typography: "{typography.label}"
    height: "39px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  grade-badge:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.plum}"
    rounded: "{rounded.badge}"
    padding: "4px 6px"
---

# Design System: Gradelytics

## Overview

The interface is an academic workspace in Operate mode. A quiet vertical navigation rail frames working surfaces for records, comparisons, and planning. The design uses pale blue-gray surfaces and deep plum text, with a reversed emphasis in dark mode.

A single sans family carries headings, controls, and data. Tables and data-driven charts do the explanatory work; photographs are not part of this implementation. These rules describe the current frontend preview rather than a claim about a completed university system.

**Key Characteristics:**

- Distinct working surfaces on a gray or plum canvas.
- Credit-weighted figures and semester data presented with tabular numerals.
- Restrained rounded corners, fine separators, and visible control states.
- A contrasting goal panel and separate actual/projected GPA values.

## Colors

The primary pair is pale paper and deep plum. The normative values are in the frontmatter; runtime theme assignments live in `frontend/src/index.css`.

In light mode, paper is the canvas, plum is the main ink and selected-control color, and near-white surfaces contain work. The navigation rail uses a separate cool neutral. Dark mode makes plum the canvas, deepens the rail, lightens working panels, and uses paper for text and selected controls.

Apricot gives the light-mode goal button a warm contrast. The goal panel reverses to paper with plum ink in dark mode. Success and failure have dedicated text/background pairs; grade letters and status wording accompany these colors.

**The Theme Role Rule.** Use semantic runtime variables such as `--surface`, `--ink`, `--selected`, and `--goal-bg` so all states follow the active theme.

## Typography

DM Sans Variable is self-hosted through Fontsource, with Segoe UI and sans-serif fallbacks. One family serves all roles. The headline, title, body-copy, label, and summary-metric roles are extracted above; form labels, metadata, and table details use denser supporting sizes.

The page headline reduces to 27px on small screens. Section titles generally reduce to 15px. Navigation labels use 13px at the full desktop and mobile-drawer sizes, becoming denser with the narrower tablet rail. Grade-point and credit tables use tabular numerals. Large summary figures use tabular numerals and a slightly tighter spacing.

Chart labels scale within the SVG; their source font sizes increase at narrow breakpoints to retain legibility. Do not reuse the SVG's source-size values as ordinary HTML typography.

## Layout

The full desktop rail is fixed at 238px. It narrows to 210px below 1200px and 190px below 1000px. At 760px and below it becomes a 238px off-canvas drawer; the main content no longer reserves rail space. The drawer has an explicit close control, Escape handling, focus containment, and inert background content.

The working container has a maximum width of 1630px with desktop horizontal gutters of 37px. Gutters reduce through tablet sizes to 17px on small screens. The overview uses four compact summary columns, followed by a wider chart and narrower goal panel. At mobile widths the summary becomes two columns and major panels stack.

Tables scroll inside their own region. Full record tables retain their columns; the compact overview table hides credits and status on small screens. Mobile improvement banners place their action below the copy. The standard panel gap is 20px; panel interiors commonly use 24px insets. Forms use grouped fields and visible labels.

**The Local Overflow Rule.** Wide academic tables scroll within their working surface; the page itself should remain within the viewport.

## Elevation & Depth

Depth comes from tonal surfaces and fine separators. Resting panels do not use shadows. The floating notification uses a soft downward shadow (`0 6px 25px #16051225`) to distinguish transient feedback from the page. The mobile drawer uses a dark scrim.

Control feedback begins with a 170ms press to 0.965 scale and return, followed after 30ms by a 220ms ink reveal expanding from the control center. Selection ink fills navigation items from the center over 190ms and contracts on deselection. Sun and moon rotate/crossfade over 220ms. Workspace pages exit over 90ms and enter over 170ms with only 6px of travel; rapid navigation skips superseded transitions. Charts draw in over 300ms, and progress fills enter over 280ms. The mobile drawer retains its 220ms transform and notification entry its 180ms feedback. Reduced-motion preferences disable spatial effects and preserve the final readable state. Source: `frontend/src/motion.css` and `frontend/src/lib/usePressFeedback.ts`.

## Shapes

Working panels have softly rounded corners using the panel radius. Controls are tighter: buttons and navigation selections use the control radius; fields use the field radius. Grade badges use compact rounded rectangles rather than pill silhouettes. Circular shapes are reserved for avatars, status dots, and step markers.

Inputs and secondary buttons use thin strokes. Selected navigation and primary actions use filled surfaces. The consistent icon vocabulary comes from Lucide with restrained stroke weights.

## Components

### Buttons

Primary buttons use the selected/on-selected theme pair and compact inline icon spacing. Secondary buttons use the working surface with a border; subtle actions are transparent. The goal button uses its own theme pair. Hover states change tone or brightness, keyboard focus uses a visible two-pixel outline with a four-pixel offset, and disabled controls reduce opacity.

### Inputs / Fields

Text inputs use surface backgrounds, one-pixel borders, field-radius corners, and visible labels. Native selects have an adjacent noninteractive chevron. Inputs are generally 40px tall. Error feedback is textual and placed in the working flow. Range controls and checkboxes inherit the selected theme color.

### Navigation

The active destination uses a filled selected surface. Inactive items remain transparent and gain a tonal hover surface. Navigation uses real links with hash destinations and exposes the current page. Mobile navigation preserves the same labels and icon vocabulary.

### Cards / Containers

Panels contain task-oriented material: a course table, chart, editor, comparison, or curriculum list. Section headings group a title, explanatory line, and optional action. Panels rely on tonal depth rather than shadows.

### Grade badges and tables

Grade labels remain visible. Failure uses its danger pair and pass-only outcomes use the success pair. Full records allow inline grade changes; points and credits remain aligned as tabular data. Zero-credit requirements retain explicit course metadata.

### Planning and projection

The target panel contrasts with the surrounding working surfaces. The simulator presents current and projected GPA separately, alongside the scenario's credit effect and assumptions. Its projection styling is illustrative and must not imply that a hypothetical grade has changed the actual record.

## Do's and Don'ts

### Do:

- Do preserve the paper/plum emphasis reversal across both themes.
- Do use semantic color variables for new controls and states.
- Do keep grade labels, point values, credits, and calculation assumptions visible.
- Do stack narrow-screen actions when the alternative squeezes academic copy.
- Do preserve keyboard focus and reduced-motion behavior.

### Don't:

- Don't introduce the Taste skill or its generated tooling into this project.
- Don't treat a chart or projected GPA as decorative content detached from its data.
- Don't convey pass/fail status through color alone.
- Don't present sample curriculum rules as verified university requirements.

The tooling sidecar is stored outside the repository under the preview artifacts directory, following the user's global-tooling preference. This file documents the actual implementation; it does not add generated skill sources or credentials to the project.
