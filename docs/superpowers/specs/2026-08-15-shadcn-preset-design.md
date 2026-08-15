# Shadcn Preset Migration Design

## Goal

Apply shadcn preset `b3t20MAXvW` to the existing Vite application as the single source of truth for the UI system, including its component style, color tokens, theme, typography, icon library, radius, and related dependencies.

## Scope

- Reinitialize shadcn with `--force --reinstall` so existing shadcn-like components are replaced by the preset versions.
- Install the complete official component catalog with `add --all --overwrite`.
- Preserve the landing page's product behavior, content, assets, form submission flow, Turnstile integration, and motion accessibility behavior.
- Update application imports or component usage only where the generated preset API requires it.
- Do not redesign landing-page sections or introduce unrelated product changes.

## Architecture

The shadcn CLI owns `components.json`, the design tokens in the existing global Tailwind CSS entrypoint, generated files under `src/components/ui`, shared hooks, utilities, and dependency declarations. The landing page remains the only application consumer and continues to import only the UI primitives it actually renders, allowing the bundler to tree-shake the rest of the installed catalog.

## Validation

- Run the existing production build before and after migration.
- Inspect shadcn project metadata after installation to confirm the preset configuration and component inventory.
- Run a local browser smoke check for rendering, responsive behavior, keyboard focus, console errors, and reduced-motion compatibility.

## Risks and Rollback

The broad overwrite intentionally replaces local edits in UI primitives and adds many source files and dependencies. Application-specific code remains outside the generated UI directory. Rollback is a revert of the migration commits or the full PR.
