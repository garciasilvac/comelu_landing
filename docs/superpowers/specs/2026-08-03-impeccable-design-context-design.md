# Impeccable Design Context

## Purpose

Initialize Impeccable for Comelu's public marketing landing page. The setup gives future design work a stable product brief and an implementation-aware visual-system reference without redesigning the existing page.

## Product context

Comelu is a Spanish (Chile) landing page for a future SaaS product that helps dental laboratories organize work orders, case files, operational status, payments, and receipts. Its immediate conversion goal is qualified waitlist sign-ups.

This is a **brand surface**, not an authenticated product UI. Design should communicate clear positioning, trust, and a modern dental-technology identity to laboratory owners, independent dental technicians, and clinics with in-house laboratories.

The brand voice is **precisa, moderna y confiable**. It should feel specialized, warm, and grounded in dental laboratory work rather than like a generic technology company.

## Direction and boundaries

Directional references are Linear's precision and hierarchy, Stripe's storytelling and composition, Vercel's technical elegance, Apple's calm premium restraint, modern dental CAD/CAM equipment, and premium laboratory instruments. These are attributes to interpret, not brands to imitate.

The system must avoid generic corporate enterprise styling, medical bureaucracy, outdated ERP conventions, cold industrial software, playful startup aesthetics, neon cyberpunk, speculative AI imagery, and social-media visual language. It also rejects heavy gradients, pervasive glassmorphism, excessive animation, busy layouts, low-contrast dark interfaces, bubble-shaped UI, skeuomorphism, and stock-photo-heavy art direction. Copy must avoid salesy, hype-driven, buzzword-heavy, overly technical, casual, humorous, or fear-based language.

## Accessibility requirements

All future design work must target WCAG 2.2 AA: AA contrast; semantic HTML and logical heading order; full keyboard navigation with visible focus; screen-reader labels; clear form validation and errors; non-color-only status indicators; 44 by 44 px touch targets where practical; usable layout and functionality at 200% zoom; Spanish (Chile) language metadata; and responsive behavior from mobile through large desktops. Motion must respect `prefers-reduced-motion` and never be required for comprehension or use.

## Deliverables

- Install Impeccable's Codex project skill into `.agents/skills/` using its official non-interactive installer.
- Add root-level `PRODUCT.md` with the strategic context above.
- Add root-level `DESIGN.md` documenting the current landing page's tokens, typography, component patterns, motion, accessibility guardrails, and the refined visual rules.
- Verify the generated files and run the production build. Do not alter application source, user journeys, or deployed configuration.
