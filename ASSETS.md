# Asset provenance

Every image of the app on this site was rendered by Device itself, from
[devicedaw/device at bddb701](https://github.com/devicedaw/device/tree/bddb701068b3783a859276080709164f03e5bc37).
No generated or third-party mockups are presented as app screenshots. The views show development review states,
not a finished musical project.

| Website asset                      | Original source                                               |
| ---------------------------------- | ------------------------------------------------------------- |
| `assets/mark.svg`                  | `docs/art/mark.svg`, Device's blue sine-wave mark             |
| `assets/social-preview.png`        | `docs/assets/art/social-preview.png`                          |
| `assets/shots/automation-*.webp`   | `docs/art/shots/automation.png` (`--state review-automation`) |
| `assets/shots/analyzers-1440.webp` | `docs/art/shots/analyzers.png` (`--state review-analyzers`)   |
| `assets/shots/lfo-1440.webp`       | `docs/art/shots/lfo.png` (`--state reference-lfo`)            |
| `assets/shots/arrange-1440.webp`   | rendered with `--state reference-audio-clip`                  |
| `assets/shots/pianoroll-1440.webp` | rendered with `--state review-pr-velocity`                    |
| `assets/shots/recording-1440.webp` | rendered with `--state review-recording`                      |
| `assets/shots/mixer-1440.webp`     | rendered with `--state review-returns`                        |
| `assets/shots/export-1440.webp`    | rendered with `--state review-export-stems`                   |
| `assets/fonts/Inter-*.woff2`       | `crates/dstudio-app/ui/fonts/Inter-*.ttf`, subset to Latin    |

## Regenerating

App views are rendered the way the app's `docs/art/README.md` describes, at 2x with the Linux menu bar cropped:

```sh
SLINT_SCALE_FACTOR=2 SLINT_WGPU_CPU=1 WGPU_BACKEND=vulkan xvfb-run -a -s "-screen 0 3200x2000x24" \
  target/release/device-studio --no-audio --zoom 85 --state review-returns \
  --screenshot /tmp/mixer.png --exit-after-frames 5
magick /tmp/mixer.png -gravity north -chop 0x88 /tmp/mixer-crop.png
```

Then convert to WebP. Only the large product view keeps a 2880-pixel version; the tour images are 1440 pixels wide.

```sh
cwebp -q 88 -m 6 -sharp_yuv -resize 1440 0 /tmp/mixer-crop.png -o assets/shots/mixer-1440.webp
cwebp -q 88 -m 6 -sharp_yuv /tmp/automation.png -o assets/shots/automation-2880.webp
```

Fonts are subset with fontTools (`pip install fonttools brotli`):

```sh
pyftsubset Inter-Bold.ttf --flavor=woff2 --output-file=assets/fonts/Inter-Bold.woff2 \
  --layout-features='kern,liga,calt,tnum,ss01,cv11,case' \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+221E,U+2248,U+2260,U+2264,U+2265,U+00B5,U+03BC,U+2318,U+21E7,U+2713,U+2715,U+00D7"
```

## Licences

Device artwork is covered by the source repository's AGPL-3.0-or-later license. Inter retains its SIL Open Font
License, included beside the font files. The colours are the app's own tokens from
`crates/dstudio-app/ui/tokens.slint`.

## Fine Signal branding texture

`assets/fine-signal.avif` (41,945 bytes) and its WebP fallback (144,974 bytes)
are compressed versions of `devicedaw/device`'s
`docs/art/textures/fine-signal.png`. The original bitmap was generated for
Device with OpenAI image generation on 13 November 2026; its exact prompt is
kept beside the source as `fine-signal-prompt.txt`. It supplies only decorative
blue dots and light falloff behind the website and public artwork. App views,
the logo and desktop app styles are unchanged.

The social preview was rendered from the same repository's HTML artwork with
that texture; the app screenshot inside it remains the app's own output.
The website prefers AVIF through CSS image-set and uses WebP otherwise.
