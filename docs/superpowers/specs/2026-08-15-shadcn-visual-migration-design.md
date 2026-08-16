# Shadcn Visual Migration Design

## Goal

Migrate the existing Comelu landing page from bespoke controls and raw color styling to the installed shadcn preset `b3t20MAXvW`, making the preset visibly dominant without redesigning the page's content, narrative, section order, or product behavior.

## Approved Direction

Use a Sky-first light visual system with Amber as a restrained secondary accent.

- Sky drives primary actions, links, focus states, selected controls, and high-priority highlights.
- Amber appears in carousel progress, selected supporting details, and small emphasis elements; it does not compete with primary CTAs.
- Neutral preset tokens define page backgrounds, cards, borders, muted surfaces, and body text.
- The photographic dental assets remain unchanged.
- The hero remains the principal dark-contrast moment over the existing image, with its overlay shifted toward preset Neutral/Sky values.
- A broader layout or content redesign is explicitly deferred to a later phase.

## Component Architecture

The landing page will retain its current React state and API behavior while moving presentation into focused components:

- `LandingHeader`: desktop navigation, shadcn buttons, and a `Sheet`-based mobile menu.
- `HeroSection`: shadcn `Badge` and `Button` primitives around the current hero copy and background image.
- `ProblemsSection`: the existing timed carousel behavior inside shadcn `Card` composition, with Amber progress indicators.
- `AudienceSection`: shadcn `Card`, `CardHeader`, `CardContent`, and semantic preset colors.
- `TrustSection`: shadcn card composition around the current trust copy and image placeholder.
- `WaitlistSection`: owns the current form state, validation, Turnstile lifecycle, submission, and feedback. It uses `Field`, `Input`, `NativeSelect`, `Textarea`, `Checkbox`, `Alert`, `Button`, and `Spinner` where appropriate.
- `FaqSection`: uses shadcn `Accordion` while preserving the same questions, answers, and single-item-open behavior.
- `LandingFooter`: uses semantic tokens, shadcn buttons, and `Separator`.

Static content and shared landing types may move into a dedicated data module so individual sections stay readable. No backend contract or payload field changes are permitted.

## Visual System

- Replace raw Slate, teal, and hex UI colors with semantic shadcn tokens whenever the value represents interface state or hierarchy.
- Keep image overlays and highly specific photographic treatments in local CSS, but derive their visible tint from Sky/Neutral-compatible values.
- Use the preset's Oxanium body type and Geist Mono heading type consistently.
- Prefer shadcn variants over component-level color overrides.
- Use layout classes only for spacing, sizing, responsive behavior, and image composition.
- Retain subtle reveal and carousel motion, with the existing `prefers-reduced-motion` behavior unchanged.

## Behavior and Data Flow

- Navigation continues to scroll to the same section IDs and focuses the first waitlist input when requested.
- The problem carousel keeps manual selection and eight-second auto-advance when reduced motion is not requested.
- The form preserves every current field, validation message, maximum-three-interest rule, Turnstile action, request payload, submission endpoint, and success/error state.
- Mobile navigation closes after selecting a destination.
- FAQ behavior remains keyboard accessible and permits at most one expanded item.

## Error Handling and Accessibility

- Field errors use `data-invalid` on `Field` and `aria-invalid` on controls.
- Form-level, Turnstile, and submission feedback use shadcn `Alert` with appropriate live-region semantics.
- The submit button uses `Spinner`, `disabled`, and icon placement attributes instead of a custom loading API.
- The mobile `Sheet` includes an accessible title.
- Focus indicators use the preset ring token.
- Existing reduced-motion behavior remains mandatory.

## Validation

- Characterize the current content, section landmarks, navigation targets, and form contract before the refactor.
- Run TypeScript/Vite production builds after each migration slice.
- Compare before/after screenshots at desktop and 390-pixel mobile widths.
- Exercise desktop navigation, mobile Sheet navigation, carousel selection, FAQ expansion, form validation, maximum-interest selection, and reduced motion.
- Inspect console output and network failures, separating known environment limitations such as a missing local Turnstile key from migration regressions.

## Scope Boundaries

- Do not change visible copy, section order, images, lead payload, Supabase functions, or Turnstile configuration.
- Do not add new marketing sections, social proof, pricing, analytics, theme toggles, or dark-mode controls.
- Do not redesign the information architecture in this phase.
- Do not customize generated shadcn primitives unless an upstream component defect blocks the approved design.

## Rollback

The migration will be delivered in layered commits by surface. Individual section commits can be reverted independently; the whole phase can be rolled back by reverting its commits or PR #25.
