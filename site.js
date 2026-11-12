"use strict";
// Progressive enhancement for the Device website. Everything here is optional:
// without JavaScript every section is still readable and every link works.

const root = document.documentElement;
root.classList.add("js");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ───────────── Mobile navigation ───────────── */

const menu = $(".menu-toggle");
const nav = $("#navigation");
const closeMenu = () => {
  menu.setAttribute("aria-expanded", "false");
  nav.dataset.open = "false";
};
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.dataset.open = String(open);
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});

/* ───────────── Scroll: header playhead, product tilt ───────────── */

const ruler = $(".scroll-ruler");
const appWindow = $(".app-window");
let ticking = false;
function onScroll() {
  ticking = false;
  const max = root.scrollHeight - innerHeight;
  ruler.style.setProperty(
    "--progress",
    max > 0 ? (scrollY / max).toFixed(4) : 0,
  );
  if (!reduceMotion) {
    const r = appWindow.getBoundingClientRect();
    // 1 while the window's top is near the bottom of the viewport, 0 once it's well in view.
    const t = Math.min(
      1,
      Math.max(0, (r.top - innerHeight * 0.18) / (innerHeight * 0.62)),
    );
    appWindow.style.setProperty("--tilt", t.toFixed(3));
  }
}
addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
addEventListener("resize", onScroll, { passive: true });
onScroll();

// Highlight the nav link of the section in view.
const navLinks = $$('#navigation a[href^="#"]');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a) =>
        a.getAttribute("href") === "#" + entry.target.id
          ? a.setAttribute("aria-current", "true")
          : a.removeAttribute("aria-current"),
      );
    }
  },
  { rootMargin: "-45% 0px -50% 0px" },
);
navLinks.forEach((a) => {
  const target = $(a.getAttribute("href"));
  if (target) sectionObserver.observe(target);
});

/* ───────────── Fade-in on scroll ───────────── */

const revealTargets = $$(
  ".section-head, .device-filter, .device-grid, .plugin-band, .stack, .deadline, .principles, .open-grid > *, .status-board, .platforms, .build-grid > *",
);
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  revealTargets.forEach((el) => {
    // Only hide what is still below the fold, so nothing flashes.
    if (el.getBoundingClientRect().top > innerHeight) {
      el.setAttribute("data-reveal", "");
      io.observe(el);
    }
  });
}

/* ───────────── Product hotspots ───────────── */

const spots = $$(".hotspots li");
spots.forEach((li) =>
  $("button", li).addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !li.classList.contains("open");
    spots.forEach((s) => s.classList.remove("open"));
    li.classList.toggle("open", open);
  }),
);
document.addEventListener("click", () =>
  spots.forEach((s) => s.classList.remove("open")),
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  spots.forEach((s) => s.classList.remove("open"));
  if (menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});

/* ───────────── Count-up numbers ───────────── */

const counters = $$("[data-count]");
if (!reduceMotion) {
  const countIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countIo.unobserve(entry.target);
      const el = entry.target;
      const end = Number(el.dataset.count);
      if (!end) continue;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 1100);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });
  counters.forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) countIo.observe(el);
  });
}

/* ───────────── Tour chapters ───────────── */

const chapters = $$(".chapter");
const media = $$(".media-frame img");
const progress = $(".chapter-media");
function activate(chapter) {
  const name = chapter.dataset.chapter;
  chapters.forEach((c) => c.classList.toggle("is-active", c === chapter));
  media.forEach((img) => {
    const on = img.dataset.media === name;
    if (on && img.loading === "lazy") img.loading = "eager";
    img.classList.toggle("is-active", on);
  });
  progress.style.setProperty("--step", chapters.indexOf(chapter) + 1);
  progress.style.setProperty(
    "--active",
    getComputedStyle(chapter).getPropertyValue("--c"),
  );
}
const chapterIo = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) activate(entry.target);
  },
  { rootMargin: "-48% 0px -48% 0px" },
);
chapters.forEach((c) => chapterIo.observe(c));
activate(chapters[0]);
// Warm the next images once the tour is close, so swaps never wait on the network.
new IntersectionObserver(
  (entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) {
      media.forEach((img) => (img.loading = "eager"));
      obs.disconnect();
    }
  },
  { rootMargin: "400px 0px" },
).observe($(".chapters"));

/* ───────────── Device filter ───────────── */

const filterButtons = $$("[data-filter]");
const deviceItems = $$(".device-grid li");
filterButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const kind = button.dataset.filter;
    filterButtons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    deviceItems.forEach(
      (li) => (li.hidden = kind !== "all" && li.dataset.kind !== kind),
    );
  }),
);

/* ───────────── Copy build commands ───────────── */

const copyButton = $("#copy-command");
const copyStatus = $("#copy-status");
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#build-command").textContent.trim());
    copyButton.textContent = "Copied ✓";
    copyStatus.textContent = "Copied. Paste the commands into your terminal.";
    setTimeout(() => (copyButton.textContent = "Copy"), 2400);
  } catch {
    copyStatus.textContent =
      "Copying isn’t available here. Select the commands and copy them.";
  }
});

/* ───────────── Hero scope and the playable sketch ───────────── */

const canvas = $(".hero-scope");
const ctx2d = canvas.getContext("2d");
const hero = $(".hero");
const BARS = 16;
const BPM = 120;
const BAR_SEC = (60 / BPM) * 4;
const LOOP_SEC = BAR_SEC * BARS;
// The synth cutoff automation the sketch follows: [bar, Hz]. Drawn as the yellow lane.
const CUTOFF = [
  [0, 260],
  [4, 420],
  [8, 900],
  [11, 2600],
  [12, 3200],
  [14, 1200],
  [16, 260],
];
const cutoffAt = (bar) => {
  for (let i = 1; i < CUTOFF.length; i++) {
    const [b1, v1] = CUTOFF[i];
    const [b0, v0] = CUTOFF[i - 1];
    if (bar <= b1) {
      const t = (bar - b0) / (b1 - b0);
      return v0 * Math.pow(v1 / v0, t); // exponential, like a real filter sweep
    }
  }
  return CUTOFF[0][1];
};

let W = 0;
let H = 0;
let dpr = 1;
let pointerX = -1;
let pointerY = -1;
let heroVisible = true;
let rafId = 0;
function resize() {
  dpr = Math.min(2, devicePixelRatio || 1);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (reduceMotion && !audio.playing) draw(0);
}
addEventListener("resize", resize, { passive: true });
hero.addEventListener(
  "pointermove",
  (e) => {
    const r = canvas.getBoundingClientRect();
    pointerX = e.clientX - r.left;
    pointerY = e.clientY - r.top;
  },
  { passive: true },
);
hero.addEventListener("pointerleave", () => (pointerX = -1));

function strokeWave(fn, color, width, alpha, glow) {
  ctx2d.beginPath();
  const step = W > 900 ? 3 : 2;
  for (let x = 0; x <= W + step; x += step) {
    const y = fn(x);
    x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
  }
  ctx2d.globalAlpha = alpha;
  ctx2d.strokeStyle = color;
  ctx2d.lineWidth = width;
  ctx2d.lineJoin = "round";
  ctx2d.lineCap = "round";
  ctx2d.shadowColor = glow ? color : "transparent";
  ctx2d.shadowBlur = glow ? 18 : 0;
  ctx2d.stroke();
  ctx2d.globalAlpha = 1;
  ctx2d.shadowBlur = 0;
}

// One cycle that morphs from a sine (the mark) towards a saw, by mixing harmonics.
const morph = (phase, m) => {
  let v = Math.sin(phase);
  for (let k = 2; k <= 6; k++)
    v += (m * Math.sin(k * phase) * (k % 2 ? 1 : -1)) / k;
  return v / (1 + m * 0.75);
};

const timeData = new Float32Array(2048);
function draw(now) {
  const t = now / 1000;
  ctx2d.clearRect(0, 0, W, H);
  const mid = H * 0.52;
  const amp = Math.min(H * 0.14, 120);

  // The cutoff automation lane across the 16 ruler bars.
  ctx2d.beginPath();
  for (let x = 0; x <= W; x += 6) {
    const c = cutoffAt((x / W) * BARS);
    const y = H * 0.94 - (Math.log(c / 200) / Math.log(4000 / 200)) * H * 0.32;
    x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
  }
  ctx2d.strokeStyle = "rgba(228,198,74,0.28)";
  ctx2d.lineWidth = 1.5;
  ctx2d.setLineDash([2, 6]);
  ctx2d.stroke();
  ctx2d.setLineDash([]);

  // Pointer: a soft bump that follows the cursor, as if you were bending the signal.
  const bump = (x) =>
    pointerX < 0
      ? 0
      : Math.exp(-((x - pointerX) ** 2) / (2 * 110 ** 2)) *
        ((pointerY - mid) / H) *
        0.9;

  if (audio.playing) {
    audio.analyser.getFloatTimeDomainData(timeData);
    // Start from a rising zero crossing so the trace stands still like a scope.
    let start = 0;
    for (let i = 1; i < 1024; i++) {
      if (timeData[i - 1] < 0 && timeData[i] >= 0) {
        start = i;
        break;
      }
    }
    const span = 1024;
    // Automatic gain, like a scope's auto-range, so quiet bars still read.
    let peak = 0;
    for (let i = start; i < start + span; i++)
      peak = Math.max(peak, Math.abs(timeData[i]));
    audio.range = Math.max(peak, (audio.range || 0.1) * 0.97, 0.02);
    const gain = 0.95 / audio.range;
    strokeWave(
      (x) =>
        mid -
        Math.max(
          -1.2,
          Math.min(1.2, timeData[start + Math.floor((x / W) * span)] * gain),
        ) *
          amp,
      "#8ea6ff",
      2.5,
      1,
      true,
    );
    // Playhead across the ruler.
    const pos = ((audio.ctx.currentTime - audio.t0) % LOOP_SEC) / LOOP_SEC;
    const px = pos * W;
    ctx2d.fillStyle = "#2752f5";
    ctx2d.shadowColor = "#2752f5";
    ctx2d.shadowBlur = 14;
    ctx2d.fillRect(px - 1, 0, 2, H);
    ctx2d.shadowBlur = 0;
    // The point on the automation lane the filter is reading.
    const c = cutoffAt(pos * BARS);
    const cy = H * 0.94 - (Math.log(c / 200) / Math.log(4000 / 200)) * H * 0.32;
    ctx2d.beginPath();
    ctx2d.arc(px, cy, 5, 0, Math.PI * 2);
    ctx2d.fillStyle = "#e4c64a";
    ctx2d.fill();
  } else {
    const m = 0.5 - 0.5 * Math.cos(t * 0.35);
    const k = (Math.PI * 2 * 2.2) / Math.max(W, 1);
    const drift = t * 1.1;
    // Three quieter "tracks" behind the main signal, in the app's track colours.
    strokeWave(
      (x) => mid + 40 + Math.sin(x * k * 1.5 - drift * 0.8 + 1) * amp * 0.35,
      "#ec5c9f",
      1.5,
      0.35,
    );
    strokeWave(
      (x) =>
        mid - 30 + morph(x * k * 0.75 - drift * 0.6 + 2, 1 - m) * amp * 0.5,
      "#de7e36",
      1.5,
      0.3,
    );
    strokeWave(
      (x) =>
        mid +
        morph(x * k - drift, m) * amp * (1 + bump(x)) -
        bump(x) * amp * 0.4,
      "#2752f5",
      3,
      1,
      true,
    );
  }
}

function frame(now) {
  draw(now);
  rafId = requestAnimationFrame(frame);
}
function startLoop() {
  if (!W) return;
  if (
    !rafId &&
    heroVisible &&
    !document.hidden &&
    (!reduceMotion || audio.playing)
  ) {
    rafId = requestAnimationFrame(frame);
  }
}
function stopLoop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
}
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  heroVisible ? startLoop() : stopLoop();
}).observe(hero);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopLoop();
    if (audio.playing) audio.stop();
  } else startLoop();
});

/* The sketch: four chords over sixteen bars, scheduled ahead on the audio clock. */

const AC = window.AudioContext || window.webkitAudioContext;
const playButton = $(".play-sketch");
const playText = $(".play-text");
const sketchNote = $(".sketch-note");
const audio = { playing: false };

if (AC) {
  playButton.hidden = false;
  playButton.setAttribute("aria-pressed", "false");
}

// A minor, F, C, G. Bass roots and chord tones in Hz.
const PROG = [
  { root: 55.0, chord: [220.0, 261.63, 329.63] },
  { root: 43.65, chord: [220.0, 261.63, 349.23] },
  { root: 65.41, chord: [196.0, 261.63, 329.63] },
  { root: 49.0, chord: [196.0, 246.94, 293.66] },
];

function buildGraph() {
  const ctx = new AC({ latencyHint: "interactive" });
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 4;
  comp.attack.value = 0.005;
  comp.release.value = 0.2;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  master.connect(comp).connect(analyser).connect(ctx.destination);

  // A dotted-eighth delay as a return track for the chords.
  const send = ctx.createGain();
  send.gain.value = 0.32;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = (60 / BPM) * 0.75;
  const fb = ctx.createGain();
  fb.gain.value = 0.34;
  const damp = ctx.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 2400;
  send.connect(delay).connect(damp).connect(fb).connect(delay);
  damp.connect(master);

  // Bass: one saw through a lowpass that reads the cutoff automation.
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = "lowpass";
  bassFilter.Q.value = 7;
  bassFilter.frequency.value = CUTOFF[0][1];
  const bassBus = ctx.createGain();
  bassBus.gain.value = 0.42;
  bassFilter.connect(bassBus).connect(master);

  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const ch = noise.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;

  return { ctx, master, analyser, send, bassFilter, noise };
}

function envGain(ctx, t, peak, attack, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function kick(a, t) {
  const o = a.ctx.createOscillator();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  const g = envGain(a.ctx, t, 0.9, 0.003, 0.32);
  o.connect(g).connect(a.master);
  o.start(t);
  o.stop(t + 0.4);
}

function hat(a, t, level) {
  const s = a.ctx.createBufferSource();
  s.buffer = a.noise;
  const hp = a.ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7500;
  const g = envGain(a.ctx, t, level, 0.002, 0.05);
  s.connect(hp).connect(g).connect(a.master);
  s.start(t);
  s.stop(t + 0.08);
}

function bass(a, t, freq, len) {
  const o = a.ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = freq;
  const g = envGain(a.ctx, t, 0.8, 0.006, len);
  o.connect(g).connect(a.bassFilter);
  o.start(t);
  o.stop(t + len + 0.05);
}

function stab(a, t, notes) {
  const g = envGain(a.ctx, t, 0.09, 0.004, 0.32);
  const lp = a.ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(3400, t);
  lp.frequency.exponentialRampToValueAtTime(700, t + 0.3);
  lp.connect(g);
  g.connect(a.master);
  g.connect(a.send);
  for (const f of notes) {
    for (const detune of [-7, 7]) {
      const o = a.ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = detune;
      o.connect(lp);
      o.start(t);
      o.stop(t + 0.4);
    }
  }
}

const SIXTEENTH = 60 / BPM / 4;
function schedule() {
  const a = audio;
  while (a.nextTime < a.ctx.currentTime + 0.12) {
    const step = a.step % (BARS * 16);
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const t = a.nextTime;
    const p = PROG[bar % 4];

    a.bassFilter.frequency.linearRampToValueAtTime(cutoffAt(step / 16), t);
    if (s % 4 === 0) kick(a, t);
    if (s % 2 === 0) bass(a, t, s % 4 === 2 ? p.root * 2 : p.root, 0.3);
    if (bar >= 4 && (s === 3 || s === 6 || s === 10 || s === 14))
      stab(a, t, p.chord);
    if (bar >= 8) hat(a, t, s % 4 === 2 ? 0.16 : 0.05);

    a.step++;
    a.nextTime += SIXTEENTH;
  }
  a.timer = setTimeout(schedule, 25);
}

audio.start = async () => {
  if (!audio.ctx) Object.assign(audio, buildGraph());
  await audio.ctx.resume();
  const now = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(0.0001, now);
  audio.master.gain.exponentialRampToValueAtTime(0.7, now + 0.08);
  audio.step = 0;
  audio.t0 = now + 0.05;
  audio.nextTime = audio.t0;
  audio.playing = true;
  schedule();
  playButton.setAttribute("aria-pressed", "true");
  playText.textContent = "Stop the sketch";
  sketchNote.hidden = false;
  startLoop();
};
audio.stop = () => {
  clearTimeout(audio.timer);
  const now = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(audio.master.gain.value, now);
  audio.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  audio.playing = false;
  playButton.setAttribute("aria-pressed", "false");
  playText.textContent = "Play a sketch";
  setTimeout(() => !audio.playing && audio.ctx.suspend(), 250);
  if (reduceMotion) {
    stopLoop();
    draw(0);
  }
};
playButton.addEventListener("click", () =>
  audio.playing ? audio.stop() : audio.start(),
);

// Draw the scope only after the first paint, so it never delays the text.
const initScope = () => {
  resize();
  canvas.classList.add("is-on");
  startLoop();
};
if (document.readyState === "complete")
  requestAnimationFrame(() => setTimeout(initScope, 0));
else
  addEventListener("load", () => requestAnimationFrame(initScope), {
    once: true,
  });
