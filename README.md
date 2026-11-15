# Device website

The official public website for [Device](https://github.com/devicedaw/device), an open-source digital audio workstation.

**Live site:** https://devicedaw.github.io/

## Run locally

No build step or dependencies are required. From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Edit `index.html`, `styles.css` and `site.js`, then refresh.

## Publishing

GitHub Pages serves `/` from the `main` branch. Pushing to `main` publishes the site using GitHub's Pages build. `.nojekyll` makes this a plain static site. This repository is the organization website, so its name must remain `devicedaw.github.io` for the default root URL.

No paid services, external fonts, analytics, cookies, package installation or custom build workflow are used. `dither.js` draws the hero scope, the footer wave and the 404 line as ordered-dither pixels; `site.js` animates the hero scope and adds the interface markers, the scroll tour, the device filter, mobile navigation and command copying. On phones the hero scope sits in its own band under the headline, and the product shot is cropped to the arrangement. Every section stays readable without JavaScript, and motion is switched off for visitors who ask for reduced motion.

## Keep content accurate

- The site is written for musicians, not developers: lead with what Device does for a song and why it beats paying for a studio, and keep the technology (languages, frameworks, build tools) out of the copy. Building from source stays available, folded away in the Get Device section.
- The app is **pre-alpha**. The website points visitors at the releases page and offers a source build; it does not advertise an available download.
- Claim only features the app README describes, and never name or compare against other studios by name (exporting to an Ableton Live set is a feature, so it is fine to mention).
- `devicedaw/device` is the app repository. Keep its links and clone commands current when the app repository changes location. The November 2026 ownership migration transferred the original repository; it did not recreate it.
- Verify platform support, limitations and contribution policy against the app README before changing claims. Link to the app status table for fast-changing details.
- Screenshots were sourced from app commit `bddb701068b3783a859276080709164f03e5bc37` on 12 November 2026; feature copy was checked against app commit `daa306f` on 15 November 2026. See `ASSETS.md` for asset provenance and how to regenerate the images and fonts.
- The device catalog lists the 44 built-in devices from the app README's table. Update the counts on the filter buttons when it changes.
- If hosting moves, update the canonical URL, Open Graph URL/image, `robots.txt` and `sitemap.xml`.
- Check desktop and mobile layouts (at least 360, 390 and 768 px wide, and a phone held sideways, 844 × 390), keyboard focus, the interface markers, the scroll tour, the device filter, the mobile menu and the copy button before publishing. Run `node --check site.js` and check all local asset paths.

## Performance budget

The page has no third-party requests. Keep the first view under 300 KB transferred (the dither material is a 5 KB palette PNG; remeasure the total when changing assets) and the whole page under 650 KB after scrolling to the end. Screenshots are lossy WebP (quality 72 to 84, see ASSETS.md), fonts are Latin subsets in WOFF2, and the hero scope only animates while it is on screen, at 30 frames a second.

## Structure

| File         | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `index.html` | Content, links, accessible controls and sharing metadata      |
| `styles.css` | Responsive layout, using the app's colour tokens              |
| `site.js`    | Progressive enhancement; no framework or runtime dependencies |
| `dither.js`  | Ordered-dither renderer for the waves (no dependencies)       |
| `assets/`    | App views (`shots/`), the mark, dither texture, social image and fonts |
| `404.html`   | A useful return path for missing pages                        |

## License

AGPL-3.0-or-later, matching the application artwork reused here; see `LICENSE`. Inter is licensed under the SIL Open Font License in `assets/fonts/Inter-OFL-LICENSE.txt`.
