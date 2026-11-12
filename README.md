# Device Studio website

The official public website for [Device Studio](https://github.com/devicedaw/device), an open-source digital audio workstation.

**Live site:** https://devicedaw.github.io/

## Run locally

No build step or dependencies are required. From this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Edit `index.html`, `styles.css` and `site.js`, then refresh.

## Publishing

GitHub Pages serves `/` from the `main` branch. Pushing to `main` publishes the site using GitHub's Pages build. `.nojekyll` makes this a plain static site. This repository is the organization website, so its name must remain `devicedaw.github.io` for the default root URL.

No paid services, external fonts, analytics, cookies, package installation or custom build workflow are used. Native browser interactions provide the feature tour, mobile navigation and command copying; the content remains readable without JavaScript.

## Keep content accurate

- The app is **pre-alpha**. The website links to source builds and does not advertise an available release.
- `devicedaw/device` is the app repository. Keep its links and clone commands current when the app repository changes location. The November 2026 ownership migration transferred the original repository; it did not recreate it.
- Verify platform support, limitations and contribution policy against the app README before changing claims. Link to the app status table for fast-changing details.
- Application facts and screenshots were sourced from app commit `52293a1ed939f12ee0db13413e89fefddfd831cd` on 12 November 2026. See `ASSETS.md` for asset provenance.
- If hosting moves, update the canonical URL, Open Graph URL/image, `robots.txt` and `sitemap.xml`.
- Check desktop and mobile layouts, keyboard focus, the three tour buttons, mobile menu, FAQ and copy button before publishing. Run `node --check site.js` and check all local asset paths.

## Structure

| File         | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `index.html` | Content, links, accessible controls and sharing metadata      |
| `styles.css` | Responsive layout and Device's existing visual identity       |
| `site.js`    | Progressive enhancement; no framework or runtime dependencies |
| `assets/`    | Local screenshots, waveform mark, social image and fonts      |
| `404.html`   | A useful return path for missing pages                        |

## License

AGPL-3.0-or-later, matching the application artwork reused here; see `LICENSE`. Inter is licensed under the SIL Open Font License in `assets/fonts/Inter-OFL-LICENSE.txt`.
