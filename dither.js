/* Ordered-dither waves for the hero scope, the footer and the 404 page.
 *
 * Waves are rendered into a low-resolution canvas, one texel per `cell` CSS pixels, then
 * shown at full size with `image-rendering: pixelated`. Each texel's brightness is quantised
 * to four levels with an 8x8 Bayer matrix, the same method tools/art/dither.mjs in the app
 * repository uses for the static material. Only the rows near each wave are evaluated, so a
 * frame costs about one pass over the texels plus a few thousand cheap distance checks.
 */
(() => {
  "use strict";

  // 8x8 Bayer thresholds in (0, 1), flattened row-major.
  const BAYER = (() => {
    let m = [0];
    let size = 1;
    while (size < 8) {
      const next = new Array(size * size * 4);
      for (let y = 0; y < size * 2; y++)
        for (let x = 0; x < size * 2; x++)
          next[y * size * 2 + x] =
            4 * m[(y % size) * size + (x % size)] +
            [0, 2, 3, 1][(y >= size ? 2 : 0) + (x >= size ? 1 : 0)];
      m = next;
      size *= 2;
    }
    return Float32Array.from(m, (v) => (v + 0.5) / 64);
  })();

  // Packs [r, g, b, a] into the canvas's native byte order.
  const LITTLE = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
  const pack = ([r, g, b], a = 255) =>
    LITTLE
      ? ((a << 24) | (b << 16) | (g << 8) | r) >>> 0
      : ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;

  /* A surface wraps one canvas. `resize()` sizes it to its CSS box; `draw(waves)` renders.
   * A wave is { y(x) -> CSS y, ramp: [[r,g,b,a] dim, mid, bright], width, glow, strength }. */
  function surface(canvas, cellCss = 3) {
    const ctx = canvas.getContext("2d");
    let cols = 0;
    let rows = 0;
    let cell = cellCss;
    let image = null;
    let px = null;
    let val = null;
    let owner = null;

    function resize() {
      const dpr = Math.min(3, devicePixelRatio || 1);
      // Whole device pixels per texel keep every square the same size.
      cell = Math.max(1, Math.round(cellCss * dpr)) / dpr;
      const w = canvas.parentElement ? canvas.parentElement.clientWidth : canvas.clientWidth;
      const h = canvas.clientHeight;
      cols = Math.max(1, Math.ceil(w / cell));
      rows = Math.max(1, Math.ceil(h / cell));
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = `${cols * cell}px`;
      image = ctx.createImageData(cols, rows);
      px = new Uint32Array(image.data.buffer);
      val = new Float32Array(cols * rows);
      owner = new Uint8Array(cols * rows);
      return { width: w, height: h };
    }

    function draw(waves) {
      if (!image) return;
      val.fill(0);
      const ys = new Float32Array(cols + 2);
      waves.forEach((w, wi) => {
        for (let c = -1; c <= cols; c++) ys[c + 1] = w.y((c + 0.5) * cell);
        const half = w.width / 2;
        const reach = half + w.glow * 2.2;
        const inv = 1 / (w.glow * w.glow);
        for (let c = 0; c < cols; c++) {
          const yc = ys[c + 1];
          const slope = (ys[c + 2] - ys[c]) / (2 * cell);
          const norm = 1 / Math.sqrt(1 + slope * slope);
          const span = reach / norm;
          const r0 = Math.max(0, Math.floor((yc - span) / cell));
          const r1 = Math.min(rows - 1, Math.ceil((yc + span) / cell));
          for (let r = r0; r <= r1; r++) {
            const d = Math.abs((r + 0.5) * cell - yc) * norm - half;
            const v = d <= 0 ? 1 : w.strength * Math.exp(-d * d * inv);
            const i = r * cols + c;
            if (v > val[i]) {
              val[i] = v;
              owner[i] = wi;
            }
          }
        }
      });
      const colours = waves.map((w) => [0, ...w.ramp.map((c) => pack(c, c[3] ?? 255))]);
      for (let r = 0, i = 0; r < rows; r++) {
        const row = (r & 7) * 8;
        for (let c = 0; c < cols; c++, i++) {
          const v = val[i];
          if (v <= 0) {
            px[i] = 0;
            continue;
          }
          const n = v * 3;
          const base = n | 0;
          const level = Math.min(3, base + (n - base > BAYER[row + (c & 7)] ? 1 : 0));
          px[i] = colours[owner[i]][level];
        }
      }
      ctx.putImageData(image, 0, 0);
    }

    return { resize, draw };
  }

  const BLUE = [
    [39, 82, 245, 110],
    [39, 82, 245],
    [142, 166, 255],
  ];

  // Static waves: the footer's two sine cycles and the 404 page's flat line with one blip.
  const SHAPES = {
    footer: (W, H) => (x) => H / 2 - H * 0.3 * Math.sin((x / W) * Math.PI * 4),
    flatline: (W, H) => (x) => {
      const t = (x / W) * 1200;
      if (t < 520 || t > 680) return H / 2;
      return H / 2 - H * 0.3 * Math.sin(((t - 520) / 160) * Math.PI * 2);
    },
  };

  function mountStatic(host) {
    const shape = SHAPES[host.dataset.ditherWave];
    if (!shape) return;
    const canvas = document.createElement("canvas");
    canvas.className = "dither-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    host.classList.add("is-dithered");
    const s = surface(canvas, 3);
    const paint = () => {
      const { width, height } = s.resize();
      const glow = Math.min(9, height / 9);
      s.draw([{ y: shape(width, height), ramp: BLUE, width: 3, glow, strength: 0.6 }]);
    };
    paint();
    let last = host.clientWidth;
    new ResizeObserver(() => {
      if (host.clientWidth !== last) {
        last = host.clientWidth;
        paint();
      }
    }).observe(host);
  }

  window.Dither = { surface, BLUE };
  document.querySelectorAll("[data-dither-wave]").forEach(mountStatic);
})();
