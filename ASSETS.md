# Asset provenance

Every image of the app on this site was rendered by Device itself, from
[devicedaw/device](https://github.com/devicedaw/device) with its `--showcase` option on the demo song
"Night Drive" that `tools/art/demo_song.py` writes there (36 bars, six tracks and two returns, every
sound synthesised by the script). No generated or third-party mockups are presented as app screenshots.

| Website asset                      | Rendered with                                                |
| ---------------------------------- | ------------------------------------------------------------ |
| `assets/mark.svg`                  | `docs/art/mark.svg`, Device's blue sine-wave mark            |
| `assets/social-preview.png`        | `docs/assets/art/social-preview.png`                         |
| `assets/shots/song-*.webp`         | `--showcase arrange` (also `docs/art/shots/arrange.png`)     |
| `assets/shots/close-pianoroll.webp` | `--showcase pianoroll`, cropped to the piano roll           |
| `assets/shots/close-recording.webp` | `--showcase recording`, cropped to the take on the timeline |
| `assets/shots/close-analyzers.webp` | `--showcase analyzers`, cropped to Tuner and Spectrum       |
| `assets/shots/close-lfo.webp`       | `--showcase lfo`, cropped to the LFO                        |
| `assets/shots/close-mixer.webp`     | `--showcase mixer`, cropped to the channel strips           |
| `assets/shots/close-export.webp`    | `--showcase export`, cropped to the export dialog           |
| `assets/fonts/Inter-*.woff2`       | `crates/dstudio-app/ui/fonts/Inter-*.ttf`, subset to Latin   |

## Regenerating

In the app repository, write the song, then render each view at 2x with the Linux menu bar cropped
(the app's `docs/art/README.md` has the details):

```sh
python3 tools/art/demo_song.py "/tmp/Night Drive"
SLINT_SCALE_FACTOR=2 SLINT_WGPU_CPU=1 WGPU_BACKEND=vulkan xvfb-run -a -s "-screen 0 3200x2000x24" \
  target/release/device-studio --no-audio --zoom 85 --open "/tmp/Night Drive" --timeline-zoom 52 \
  --showcase mixer --screenshot /tmp/mixer.png --exit-after-frames 40
magick /tmp/mixer.png -gravity north -chop 0x88 /tmp/mixer-crop.png
```

Then convert to WebP. The product view keeps 1440- and 2880-pixel versions. Each feature image is a
close-up cut from the 2x render at full resolution (no resizing) and saved at quality 80, so the
interface stays sharp; the crop boxes, in pixels of the 2880 × 1552 render, are pianoroll
500,980–1500,1552; recording 1400,160–2600,900; analyzers 1200,940–2360,1552; lfo 530,990–1430,1552;
mixer 0,800–1220,1552; export 960,420–2080,1120. Close-ups are composed from their top left, which
is the corner the page always shows. Busy views compress less well, so remeasure the page weight
after changing them (README › Performance budget).

```sh
magick /tmp/mixer-crop.png -crop 1220x752+0+800 +repage /tmp/mixer-close.png
cwebp -q 80 -m 6 -sharp_yuv /tmp/mixer-close.png -o assets/shots/close-mixer.webp
cwebp -q 84 -m 6 -sharp_yuv -resize 1440 0 /tmp/arrange-crop.png -o assets/shots/song-1440.webp
cwebp -q 72 -m 6 -sharp_yuv /tmp/arrange-crop.png -o assets/shots/song-2880.webp
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

## Dither material

`assets/dither.png` (5,105 bytes) is `devicedaw/device`'s `docs/art/textures/dither-site.png`, written by
`node tools/art/dither.mjs` in that repository: a bloom toward the lower right quantised to four of the app's
colours with an 8x8 Bayer matrix. It is shown anchored to the lower right with `image-rendering: pixelated`, two
CSS pixels per texel on wide screens and one on screens up to 860 px wide, so every texel stays a crisp square.
`assets/dither-hero.png` (the bloom behind the hero's app view) and `assets/dither-panel.png` (the bloom
behind each feature close-up) are written by `node tools/dither-textures.mjs` in this repository, with
the same palette and matrix. All three are shown at two CSS pixels per texel (one on phones), never
animated.

The social preview is rendered from the same repository's HTML artwork with the dither material; the app screenshot
inside it remains the app's own output.
