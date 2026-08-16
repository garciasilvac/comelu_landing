# Comelu web icon suite

The canonical optimized mark is `public/favicon.svg`. It preserves the supplied logo geometry while using a circular preset-aligned background with fully transparent outer corners.

## Brand colors

- Sky 700: `#0369A1`
- Amber: `#FCB102`

## Assets

| Asset | Purpose |
| --- | --- |
| `favicon.svg` | Modern scalable browser icon and canonical circular mark |
| `favicon.ico` | Legacy browser/desktop fallback containing 16, 32, and 48 px images |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | Explicit raster browser fallbacks |
| `apple-touch-icon.png` | 180 px iOS/iPadOS Home Screen icon |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Standard installable PWA icons |
| `maskable-icon-192x192.png`, `maskable-icon-512x512.png` | Full-bleed adaptive PWA icons with an additional 10% safe-area reduction |
| `safari-pinned-tab.svg` | Single-layer monochrome Safari pinned-tab mask |
| `site.webmanifest` | Install metadata and icon declarations |

Standard SVG, PNG, ICO, Apple Touch, and Android `purpose: any` assets use the circular sky background and alpha `0` outside it. Maskable sources intentionally remain opaque because Android and Chromium apply their own platform shape; transparent corners can leave visible gaps. Safari's pinned-tab file remains a single-color silhouette because Safari provides its display color.

Regenerate the committed raster and ICO assets on macOS after editing the canonical SVG:

```bash
node scripts/generate-web-icons.mjs
```

The horizontal/social composition is intentionally excluded. Open Graph and Twitter preview assets will be produced separately from the dedicated horizontal SVG.
