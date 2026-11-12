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

No paid services, external fonts, analytics, cookies, package installation or custom build workflow are used. `site.js` adds the hero scope, the interface markers, the scroll tour, the device filter, mobile navigation and command copying. Every section stays readable without JavaScript, and motion is switched off for visitors who ask for reduced motion.

## Keep content accurate

- The app is **pre-alpha**. The website links to source builds and does not advertise an available release.
- `devicedaw/device` is the app repository. Keep its links and clone commands current when the app repository changes location. The November 2026 ownership migration transferred the original repository; it did not recreate it.
- Verify platform support, limitations and contribution policy against the app README before changing claims. Link to the app status table for fast-changing details.
- Application facts and screenshots were sourced from app commit `bddb701068b3783a859276080709164f03e5bc37` on 12 November 2026. See `ASSETS.md` for asset provenance and how to regenerate the images and fonts.
- The device catalog lists the 44 built-in devices from the app README's table. Update the counts on the filter buttons when it changes.
- If hosting moves, update the canonical URL, Open Graph URL/image, `robots.txt` and `sitemap.xml`.
- Check desktop and mobile layouts, keyboard focus, the interface markers, the scroll tour, the device filter, the mobile menu and the copy button before publishing. Run `node --check site.js` and check all local asset paths.

## Performance budget

The page has no third-party requests. Keep the first view under 300 KB transferred (it is about 270 KB on a 2x desktop screen and 210 KB on a phone) and the whole page under 600 KB after scrolling to the end. Screenshots are lossy WebP at quality 88, fonts are Latin subsets in WOFF2, and the hero scope only animates while it is on screen.

## Structure

| File         | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `index.html` | Content, links, accessible controls and sharing metadata      |
| `styles.css` | Responsive layout, using the app's colour tokens              |
| `site.js`    | Progressive enhancement; no framework or runtime dependencies |
| `assets/`    | App views (`shots/`), the mark, the social image and fonts    |
| `404.html`   | A useful return path for missing pages                        |

## License

AGPL-3.0-or-later, matching the application artwork reused here; see `LICENSE`. Inter is licensed under the SIL Open Font License in `assets/fonts/Inter-OFL-LICENSE.txt`.
