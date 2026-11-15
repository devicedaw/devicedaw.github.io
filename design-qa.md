# Dither design QA

Final result: passed

Reviewed 15 November 2026: the fine-dot material and the vector/glow waves were replaced by an ordered-dither
material and dithered waves, compared side by side with the site at 932c5e5.

## Evidence

- [Desktop hero, before](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/before-desktop-hero.png) and [after](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/after-desktop-hero.png)
- [Phone hero, before](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/before-phone-hero.png) and [after](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/after-phone-hero.png)
- [Footer wave, after](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/after-desktop-site-footer.png), [404 line, after](https://raw.githubusercontent.com/devicedaw/devicedaw.github.io/5238d57e8134e8ddb65c00ca8be65697bd4f039f/dither/after-desktop-404.png)

## What changed

- `assets/dither.png` (5 KB palette PNG, from the app repository's `tools/art/dither.mjs`) replaces the 42 KB AVIF
  and 145 KB WebP dot texture. Texels are crisp squares: 2 CSS px on wide screens, 1 CSS px up to 860 px.
- `dither.js` renders the hero scope, the footer wave and the 404 line with an 8x8 Bayer matrix at 3 CSS px per
  texel. Without JavaScript the footer and 404 keep their SVG waves.

## Checks

- No horizontal overflow at 360, 390, 768, 844×390 and 1440 px (document width equals viewport), home and 404.
- No console errors. `node --check` passes for `site.js` and `dither.js`.
- Hero scope, 4x CPU throttle: 4.3 ms a frame at 1440×900 and 1.4 ms on a 390 px phone, drawn at 30 frames a second.
  Main thread busy over 5 s with the hero on screen: 99% → 53% desktop, 93% → 39% phone (the old glow strokes were
  costly to paint).
- Reduced motion draws one still frame.
