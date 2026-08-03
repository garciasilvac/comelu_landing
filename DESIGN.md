---
name: Comelu
description: Precise, trustworthy dental-laboratory technology for Chile.
colors:
  navy-deep: "#07111d"
  navy-panel: "#0a1623"
  ink: "#0f172a"
  teal-primary: "#109d8f"
  teal-bright: "#2dd4bf"
  teal-soft: "#81fff2"
  blue-cool: "#7dd3fc"
  paper: "#f4f8fb"
  paper-light: "#f8fafc"
  copy-muted: "#526173"
  error: "#fb7185"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.875rem, 1.5rem + 2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 1.1rem + 1.5vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  compact: "0.75rem"
  control: "0.75rem"
  panel: "1rem"
  pill: "999px"
spacing:
  compact: "0.5rem"
  control: "0.8rem"
  card: "1.3rem"
  section: "5.5rem"
components:
  button-primary:
    backgroundColor: "{colors.teal-primary}"
    textColor: "{colors.navy-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
  field:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.paper-light}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.8rem"
---

# Design System: Comelu

## Overview

**Creative North Star: "Precision at the Bench"**

Comelu combines the measured confidence of a well-calibrated laboratory instrument with the clarity of contemporary product communication. The interface should feel clinically clean and technically fluent without turning sterile, bureaucratic, or futuristic. It earns attention through hierarchy, space, useful imagery, and crisp type—not decorative excess.

The system is a restrained dark-to-light editorial journey: deep navy frames the promise and action, while cool paper surfaces make explanatory content calm and legible. Teal is a precise signal for action, progress, and focus, used sparingly enough to retain its authority. The existing gradients support atmosphere and image legibility; they must remain subdued and never become the primary visual event.

**Key Characteristics:**

- Calm technical credibility rather than generic enterprise formality.
- Warm, specialized clarity rooted in dental laboratory work.
- Layered but legible surfaces, with depth reserved for hierarchy and state.
- Responsive, keyboard-visible, and motion-optional interaction.

## Colors

The palette uses deep navy for confidence, cool paper for clarity, and a limited teal signal for action and operational precision.

### Primary

- **Calibrated Teal:** the primary interactive signal for calls to action, focus, and selected states. Use it to direct attention, not to decorate every surface.
- **Bright Teal:** a high-visibility accent for focus indicators, dark-surface labels, and progress details.

**The Measured Accent Rule.** Teal carries intent. Keep it rare enough that a waitlist action, focus ring, or status cue remains instantly recognizable.

### Secondary

- **Clinical Blue:** a cool supporting accent used with teal only in soft atmospheric or image-supporting roles.

### Neutral

- **Instrument Navy:** the dark anchor for the hero, navigation, form panels, and footer.
- **Cool Paper:** the light reading surface for explanatory sections and comfortable long-form scanning.
- **Graphite Ink:** the primary light-surface text color.
- **Quiet Copy:** muted explanatory text with a softer hierarchy than Graphite Ink.

### Tertiary

- **Clear Error Rose:** reserved for invalid form fields and errors; pair it with text or an icon so color is never the sole signal.

## Typography

**Display Font:** Inter (with system sans-serif fallbacks)

**Body Font:** Inter (with system sans-serif fallbacks)

**Character:** Compact, crisp, and technically calm. Weight and spacing, rather than decorative font pairing, create hierarchy.

### Hierarchy

- **Display:** semibold, fluid from 1.875rem to 3rem, for the hero's central promise.
- **Headline:** semibold, fluid from 1.55rem to 2rem, for section-level orientation.
- **Body:** regular, 1rem with 1.7 line-height, for explanatory Spanish copy and comfortable scanning.
- **Label:** medium, 0.875rem, for form labels and compact controls.
- **Eyebrow:** bold, 0.78rem, uppercase with 0.16em tracking, for occasional section context on dark surfaces.

**The Evidence-First Type Rule.** Headlines state the practical value plainly. Supporting copy explains the workflow; it does not inflate it with hype or generic AI language.

## Layout

The page uses a centered content container with a 1160px maximum width and responsive gutters of 1rem on mobile, 1.5rem from 640px, and 2rem from 1024px. Sections establish an editorial rhythm with 5.5rem of top padding, reduced on compact screens. The hero is intentionally full-bleed, while its copy remains aligned to the shared container.

On small screens, controls and calls to action stack without hiding content; on larger screens, the hero gains a two-column grid at 1024px. Keep text columns constrained and avoid dense multi-column card grids. The page must remain functional and readable at 200% zoom.

## Elevation & Depth

Depth is layered and quiet. Dark sections use tonal navy shifts and muted ambient light; light panels rely on thin cool-gray borders, light interior highlights, and broad low-contrast shadows. Shadows communicate containment or interactivity, never luxury gloss.

**The Layered-Not-Glossy Rule.** One subtle atmospheric gradient or soft shadow can establish hierarchy. Do not stack effects until cards read as glass tiles.

## Shapes

Panels use gently rounded corners (1rem), while controls and compact rows use 0.75rem. Pills are reserved for short labels, progress tracks, and tightly bounded metadata. Corners should feel engineered and approachable—not inflated, bubbly, or playful. Borders remain fine and low-contrast except where focus or validation demands a clear state.

## Components

### Buttons

- **Shape:** restrained rounded rectangle (0.75rem), semibold 0.875rem label, and comfortable touch padding.
- **Primary:** Calibrated Teal carries the waitlist action with dark text. A subtle lift and shadow are permitted only when motion is available.
- **Secondary:** transparent white treatment on dark surfaces, defined by a light border and plain text hierarchy.
- **Hover / Focus:** use a visible Bright Teal focus ring with a contrasting offset. Motion is supplemental and removed for `prefers-reduced-motion`.

### Cards / Containers

- **Corner Style:** 1rem for major panels, 0.95rem for smaller cards, and 0.75rem for compact rows.
- **Background:** cool paper gradients on light sections; tonal navy layers on dark sections.
- **Border:** a fine, low-contrast border separates surfaces without turning the page into a grid of boxes.
- **Internal Padding:** begin at 1.3rem and grow only when the content requires more breathing room.

### Inputs / Fields

- **Style:** dark, lightly translucent fields with light text and a 0.75rem corner radius.
- **Focus:** a Bright Teal border and three-pixel halo make keyboard focus obvious.
- **Error:** Clear Error Rose changes the border and focus halo; visible descriptive error text supplies the meaning.
- **Validation:** labels, help text, and error associations must remain programmatic and understandable without color.

### Navigation

- **Style:** a sticky Instrument Navy bar with quiet secondary links and a clearly labeled mobile-menu control.
- **States:** hover brightens text; keyboard focus adds a high-contrast teal ring; compact navigation becomes a vertical list on mobile.

### Carousel Progress

- **Style:** slim pill tracks with a teal progress fill.
- **State:** each segment remains focusable and uses a visible outline. Animated progress is disabled when reduced motion is requested.

## Do's and Don'ts

### Do:

- **Do** use dark navy to frame the brand promise and light paper to make explanatory content easy to scan.
- **Do** use teal to identify action, focus, selection, and progress with disciplined restraint.
- **Do** pair every interactive state with visible focus, semantic labeling, and non-color-only feedback.
- **Do** keep animation short, subtle, and optional; preserve the content and interaction when motion is disabled.
- **Do** choose imagery that feels specific to laboratory work, equipment, materials, or real operational context.

### Don't:

- **Don't** turn the system into generic enterprise software, hospital bureaucracy, an outdated ERP, a playful startup app, a consumer social feed, neon cyberpunk, or a speculative AI aesthetic.
- **Don't** introduce heavy gradients, pervasive glassmorphism, low-contrast dark surfaces, rounded bubble UI, skeuomorphism, busy layouts, or stock-photo-heavy composition.
- **Don't** use salesy, hype-driven, buzzword-heavy, overly technical, casual, humorous, or fear-based copy.
- **Don't** rely on color, hover, animation, or fine pointer precision as the only way to understand or operate the page.
