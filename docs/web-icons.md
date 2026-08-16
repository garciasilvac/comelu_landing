# Comelu web icon suite

The canonical optimized mark is `public/favicon.svg`. It preserves the supplied geometry and brand colors while reducing the export from nine paths and legacy metadata to one background rectangle and one logo path.

## Brand colors

- Blue: `#015AB5`
- Amber: `#FCB102`

## Assets

| Asset | Purpose |
| --- | --- |
| `favicon.svg` | Modern scalable browser icon and canonical optimized mark |
| `favicon.ico` | Legacy browser/desktop fallback containing 16, 32, and 48 px images |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | Explicit raster browser fallbacks |
| `apple-touch-icon.png` | 180 px iOS/iPadOS Home Screen icon |
| `android-chrome-192x192.png`, `android-chrome-512x512.png` | Standard installable PWA icons |
| `maskable-icon-192x192.png`, `maskable-icon-512x512.png` | Adaptive PWA icons with an additional 10% safe-area reduction |
| `safari-pinned-tab.svg` | Single-layer monochrome Safari pinned-tab mask |
| `site.webmanifest` | Install metadata and icon declarations |

The horizontal/social composition is intentionally excluded. Open Graph and Twitter preview assets will be produced separately from the dedicated horizontal SVG.
