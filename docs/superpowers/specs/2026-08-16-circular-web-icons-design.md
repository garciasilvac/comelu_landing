# Circular web icons design

## Goal

Make Comelu's browser and installable icons read as a circular brand mark instead of a square tile. Standard multicolor assets use a `sky-700` circle with fully transparent pixels outside the circle, while platform-specific assets keep the format required for reliable rendering.

## Visual treatment

- Replace the square `#015AB5` background in the canonical SVG with a centered circle that touches the four canvas edges.
- Use the current shadcn preset primary color, Tailwind `sky-700` (`#0369A1`), for the circle.
- Preserve the existing amber Comelu “C” geometry and color (`#FCB102`).
- Set every pixel outside the circle to alpha `0`; there is no halo, tint, or partially transparent edge outside normal antialiasing.
- Keep the symbol centered and at its current relative scale so it remains recognizable at 16 px.

## Asset behavior

The circular transparent source is used for:

- `favicon.svg`
- the 16, 32, and 48 px PNG favicons
- every embedded image in `favicon.ico`
- `apple-touch-icon.png`
- the 192 and 512 px Android icons with manifest purpose `any`

Two platform-specific formats intentionally use different source behavior:

- `maskable-icon-192x192.png` and `maskable-icon-512x512.png` keep a full-bleed `sky-700` background and the existing safe-area reduction. Android and Chromium apply their own circle, squircle, or other mask; transparent source corners can create visible gaps.
- `safari-pinned-tab.svg` remains a single-color silhouette of the “C”. Safari supplies the pinned-tab color and does not render the multicolor circular background.

This means the final visible browser or operating-system artifact is circular or platform-masked even when its source file cannot safely contain transparent corners.

## Metadata

- Change the web manifest `theme_color` to `#0369A1`.
- Change HTML `theme-color` and Safari mask link color to `#0369A1`.
- Keep file names and link relationships stable so consumers do not need markup changes beyond the color values.

## Generation and testing

- Regenerate raster and ICO outputs deterministically from the canonical vector geometry.
- Add regression assertions that the canonical SVG has a circle rather than a rectangle and uses the preset sky color.
- Inspect PNG alpha data to prove standard icons have transparent corners and an opaque center.
- Inspect maskable PNG alpha data to prove their corners remain opaque.
- Retain dimension, ICO directory, manifest, and metadata tests.
- Verify the smallest favicon visually, run the full test suite and production build, and confirm each asset is served with a successful HTTP response and correct MIME type.

## Scope boundaries

- Do not change the amber symbol geometry.
- Do not create the deferred horizontal social/Open Graph composition.
- Do not redesign landing-page components.
- Do not change dependencies or introduce a permanent icon-generation dependency.

## Rollback

Reverting the implementation commits restores the previous square icon assets and `#015AB5` metadata without affecting the landing-page redesign.
