// Writes the site's ordered-dither textures (no dependencies).
//
//   node tools/dither-textures.mjs
//
// Same palette and 8x8 Bayer matrix as the app repository's tools/art/dither.mjs, with fields
// shaped for this page: a bloom rising behind the hero's app view, and a corner bloom for the
// feature panels. Show every texel as a crisp square (`image-rendering: pixelated`).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const PALETTE = [
  [0x0b, 0x0c, 0x0e],
  [0x15, 0x24, 0x5f],
  [0x27, 0x52, 0xf5],
  [0x8e, 0xa6, 0xff],
];

function bayer(n = 8) {
  let m = [[0]];
  for (let size = 1; size < n; size *= 2) {
    const next = [];
    for (let y = 0; y < size * 2; y++) {
      next.push([]);
      for (let x = 0; x < size * 2; x++) {
        const q = 4 * m[y % size][x % size];
        next[y].push(q + [0, 2, 3, 1][(y >= size ? 2 : 0) + (x >= size ? 1 : 0)]);
      }
    }
    m = next;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / (n * n)));
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Hero: an elliptical bloom centred low, rising behind the app view.
function hero(u, v, aspect) {
  const dx = (u - 0.5) * aspect * 0.55;
  const dy = (v - 0.92) * 1.15;
  const r = Math.hypot(dx, dy);
  let t = 0.86 * (1 - smooth(0.0, 0.7, r)) ** 1.4;
  return Math.min(1, t);
}

// Feature panel: a bloom rising from the bottom centre, glowing around the close-up.
function panel(u, v, aspect) {
  const r = Math.hypot((u - 0.5) * aspect * 0.42, (v - 1.0) * 1.0);
  return Math.min(1, 0.95 * (1 - smooth(0.05, 1.0, r)) ** 1.3);
}

function field(width, height, tone) {
  const m = bayer(8);
  const levels = PALETTE.length - 1;
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const n = tone((x + 0.5) / width, (y + 0.5) / height, width / height) * levels;
      const base = Math.floor(n);
      out[y * width + x] = Math.min(levels, base + (n - base > m[y & 7][x & 7] ? 1 : 0));
    }
  return out;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(width, height, idx) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([2, 3, 0, 0, 0], 8); // 2-bit palette
  const stride = Math.ceil(width / 4);
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      raw[y * (stride + 1) + 1 + (x >> 2)] |= idx[y * width + x] << (6 - 2 * (x & 3));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("PLTE", Buffer.from(PALETTE.flat())),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const [name, w, h, tone] of [
  ["assets/dither-hero.png", 960, 480, hero],
  ["assets/dither-panel.png", 480, 300, panel],
]) {
  writeFileSync(new URL("../" + name, import.meta.url), png(w, h, field(w, h, tone)));
  console.log(name, w + "x" + h);
}
