# Product-first hero design

## Summary

Replace the current photographic hero with a new product-first hero built from scratch for Comelu. The selected direction is **A · Centro de operaciones**: centered positioning copy followed by accessible product tabs and a wide, dark product preview that begins within the first viewport and continues below the fold.

The implementation must not preserve the current hero structure, background images, bullet list, animation hierarchy, or hero-specific CSS. Existing waitlist and section-navigation actions remain unchanged.

## Goals

- Explain immediately that Comelu centralizes dental-laboratory operations.
- Make the future Comelu product interface the dominant visual element.
- Preserve the waitlist as the primary conversion path.
- Show domain-specific examples without implying that the product is publicly available or that illustrative data represents real customers or outcomes.
- Remain legible, accessible, and performant from 375 px through 1440 px.

## Scope boundaries

This task changes only the landing-page hero and code or assets used exclusively by the discarded hero. It does not redesign the sticky header, downstream landing sections, waitlist form, footer, global shadcn theme, or authenticated application.

No new dependency is required. The implementation will use React, TypeScript, Tailwind, the existing shadcn tabs, native CSS animations, and a decorative SVG.

## Content hierarchy

The hero uses this order:

1. Badge: **Software para laboratorios dentales en Chile**
2. Headline: **Toda la operación de tu laboratorio dental, en un solo lugar.**
3. Supporting copy: **Conecta órdenes, archivos, estados de producción y pagos para seguir cada caso sin reconstruirlo entre planillas y mensajes.**
4. Primary CTA: **Unirme a la lista de espera**
5. Secondary CTA: **Ver qué buscamos resolver**
6. Product tabs: **Clientes**, **Órdenes**, **Producción**, **Pagos**
7. Wide product preview
8. Up to two operational KPI badges on large screens

The current hero bullet list and additional explanatory paragraphs are removed. The primary CTA invokes the existing waitlist action. The secondary CTA invokes the existing problems-section action.

## Layout and visual treatment

The hero is a full-bleed dark section directly below the sticky header. Its centered copy uses a restrained maximum width so the headline remains readable and does not become oversized. Sky is used for subdued borders, focus rings, geometry, and the product accent. Amber is limited to a few mesh nodes and small status accents.

On desktop, the product preview is approximately 1100–1250 px wide and occupies most of the usable viewport. It starts within the first viewport and intentionally extends below the fold. It has a subtle border, design-system radius, soft shadow, and contained radial glow. It must read as a window into the product rather than as a dashboard compressed into a marketing card.

The hero does not use photography, generic illustration, a dental model, a video, Canvas, WebGL, or a product screenshot. The product preview is constructed with React and CSS so all visible information stays crisp, responsive, accessible, and lightweight.

## Component architecture

### `HeroSection.tsx`

Owns the semantic hero section, positioning copy, CTA actions, and shadcn `Tabs` root. It renders the tab list and places the preview inside that root. It does not contain detailed preview markup or duplicate tab state.

### `HeroProductPreview.tsx`

Owns the desktop and mobile product representations and the small, local data structures required to render each tab. It renders one shadcn `TabsContent` panel per product area, so panel visibility and accessibility remain part of the tab component rather than a parallel custom selector. Each tab panel has one clear domain-specific purpose.

### `HeroMeshBackground.tsx`

Renders an `aria-hidden` SVG/CSS background inspired by CAD triangulation, mesh nodes, and technical surfaces. It contains no explicit tooth silhouette. CSS masks and gradients fade the geometry before it competes with content.

No additional abstraction is added unless implementation reveals a repeated unit with a clear independent responsibility.

## Tabs and interaction

The product selector must use the existing shadcn components:

- `Tabs`
- `TabsList`
- `TabsTrigger`
- `TabsContent`

It must not use a custom state-selector control. The default active tab is **Órdenes**, because it most directly communicates the case-based operating model. Pointer activation, arrow-key navigation, focus management, and ARIA relationships come from the existing shadcn/Base UI implementation. Focus-visible styling must remain obvious on the dark surface.

Changing tabs updates the product preview without page navigation or heavy transitions. A short opacity transition is acceptable when motion is allowed; the content change remains immediate with reduced motion.

## Product preview content

All names and values are illustrative interface data. A subtle **Vista conceptual** label in the preview distinguishes the future product representation from a shipped-product claim.

### Clientes

Shows a compact operational directory with entries such as Clínica Los Andes, Centro Dental Orto Sur, and Clínica Santa María. Each row may include a contact and an active-order count or recent status. It does not present the names as confirmed customers.

### Órdenes

Shows domain-specific rows including:

- OT-2048 · Clínica Los Andes · Corona zirconia · En producción
- OT-2043 · Prótesis removible · Entrega 18 ago
- OT-2039 · Puente 3 piezas · Control de calidad

The hierarchy prioritizes the order ID, client or work type, state, and delivery date.

### Producción

Shows a restrained three-stage workflow: **Por iniciar**, **En producción**, and **Control de calidad**. It uses only a few order cards so the hero does not become a full kanban application.

### Pagos

Shows invoice, balance, and receipt context associated with orders. Example states include **Pendiente**, **Pagada**, and **Comprobante adjunto**. It does not imply payment integrations or accounting capabilities beyond the product scope documented in `PRODUCT.md`.

## KPI badges

At most two small badges may float near the preview on large screens:

- **18 OT activas**
- **3 entregas hoy**

These are illustrative operational counts inside the conceptual product scene, not customer results or marketing claims. They disappear at sizes where they would overlap content, including the 375 px mobile layout.

## Mobile composition

At 375 px the desktop dashboard is not scaled down. The preview becomes a legible order-detail surface containing:

- Orden OT-2048
- Cliente: Clínica Los Andes
- Trabajo: Corona zirconia
- Estado: En producción
- Entrega: 18 ago

Tabs remain the shadcn tab control. Their list fits within the viewport using compact labels and, only if necessary, contained horizontal scrolling without page-level overflow. CTA buttons stack and retain practical touch targets. KPI badges are hidden.

At 768 px the preview may use a simplified tablet table. At 1024 px it transitions to the full dashboard composition. At 1440 px it reaches its maximum width without allowing the headline or preview to stretch excessively.

## Background and motion

`HeroMeshBackground` combines:

- very low-opacity Sky triangulation lines;
- a few Amber nodes;
- a contained radial gradient behind the preview;
- an optional near-imperceptible grain generated in CSS or SVG;
- masks that fade geometry toward the section edges.

The scene is predominantly static. Initial motion uses CSS only:

- badge fades in;
- headline fades from `translateY(8px)`;
- supporting copy follows with a short stagger;
- CTAs fade in;
- product preview fades from `translateY(24px)` and `scale(.985)`.

Durations stay between approximately 400 and 700 ms. After entry, only tab changes, hover/focus feedback, and an almost imperceptible background or border variation are allowed. `prefers-reduced-motion: reduce` removes transforms, stagger, and decorative motion while leaving all content visible.

## Accessibility

- Maintain WCAG 2.2 AA contrast for text, tabs, controls, and state labels.
- Preserve one logical `h1` and semantic section structure.
- Use shadcn tabs for keyboard and screen-reader behavior.
- Keep visible focus styles on both CTA buttons and tab triggers.
- Keep touch targets practical, ideally 44 by 44 px where layout permits.
- Mark the decorative mesh SVG `aria-hidden="true"` and non-focusable.
- Do not rely on color alone for order or payment states.
- Keep the experience functional at 200% zoom and with reduced motion.

## Performance

The hero introduces no raster image request and no animation library. SVG geometry is inline and decorative. Product content is lightweight React markup. This removes the current hero's eager desktop and mobile PNG payloads, which are approximately 1.7 MB and 1.9 MB respectively.

The preview dimensions are stable to avoid layout shift. The implementation must not preload hidden tab media because no tab depends on media. Above-the-fold CSS and markup remain direct and small.

## Old hero cleanup

After the replacement is connected:

- remove the old hero markup from `landing-sections.tsx`;
- remove `landingHeroImages` and `src/lib/landingAssets.ts` if unused;
- remove `HERO_BULLETS` if unused;
- remove old `.hero-panel`, `.hero-panel-inner`, `.hero-grid`, and `.hero-copy` CSS;
- remove `hero-lab-dark.png` and `hero-lab-dark-mobile.png` if no other references remain;
- retain shared reveal utilities and styles used by downstream sections;
- verify package dependencies before removing any dependency, and remove only dependencies proven exclusive to the old hero.

## Testing and verification

Automated tests cover:

- the new headline and CTA contract;
- the presence of four accessible tabs;
- default **Órdenes** content;
- pointer tab changes;
- keyboard tab navigation and active-panel content;
- absence of old hero copy where relevant.

Run the repository test suite, TypeScript/build command, and any available lint command. The repository currently has no separate lint or typecheck script; `pnpm build` runs `tsc -b` before Vite.

Visual verification covers 375, 768, 1024, and 1440 px, including:

- no horizontal overflow;
- readable headline and preview content;
- complete, usable CTA controls;
- tabs with adequate space and visible focus;
- no KPI overlap;
- reduced-motion rendering;
- no console errors.

## Risks and rollback

The main risk is overloading the product preview with too much simulated interface detail. The design mitigates this by limiting each tab to one clear product concept and by using a dedicated mobile composition.

The code will be committed in small, conventional layers so the background, preview structure, integration, and cleanup can be reverted independently. Full rollback is reverting the PR.
