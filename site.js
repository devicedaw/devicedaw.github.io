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
// The hero and the band between sections clear the highlight.
sectionObserver.observe($("#top"));
sectionObserver.observe($(".numbers"));

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
    const open = !li.classList.contains("is-open");
    spots.forEach((s) => s.classList.remove("is-open"));
    li.classList.toggle("is-open", open);
  }),
);
document.addEventListener("click", () =>
  spots.forEach((s) => s.classList.remove("is-open")),
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  spots.forEach((s) => s.classList.remove("is-open"));
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

/* ───────────── Download for this system ───────────── */

// Without JavaScript every download shows and the Mac one leads. Here the visitor's own
// system moves to the top and gets the primary button (phones and tablets keep the default).
{
  const platform = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    ""
  ).toLowerCase();
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const os = mobile
    ? ""
    : platform.startsWith("mac")
      ? "mac"
      : platform.startsWith("win")
        ? "windows"
        : platform.includes("linux")
          ? "linux"
          : "";
  const mine = os && $('.download[data-os="' + os + '"]');
  if (mine) {
    for (const b of $$(".download .button")) {
      b.classList.replace("primary", "ghost");
    }
    $(".button", mine).classList.replace("ghost", "primary");
    mine.classList.add("is-yours");
    mine.parentElement.prepend(mine);
  }
}

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

/* ───────────── Hero scope ───────────── */

const canvas = $(".hero-scope");
const hero = $(".hero");
// Waves are drawn dithered: one texel per 3 CSS px, quantised with a Bayer matrix (dither.js).
const scope = window.Dither.surface(canvas, 3);

let W = 0;
let H = 0;
let pointerX = -1;
let pointerY = -1;
let heroVisible = true;
let rafId = 0;
let lastFrame = -1e9;
function resize() {
  ({ width: W, height: H } = scope.resize());
  draw(reduceMotion ? 0 : performance.now());
}
addEventListener("resize", () => W && resize(), { passive: true });
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

// One cycle that morphs from a sine (the mark) towards a saw, by mixing harmonics.
const morph = (phase, m) => {
  let v = Math.sin(phase);
  for (let k = 2; k <= 6; k++)
    v += (m * Math.sin(k * phase) * (k % 2 ? 1 : -1)) / k;
  return v / (1 + m * 0.75);
};

// Track colours as dim, mid and bright dither levels (the last value is alpha).
const PINK = [
  [236, 92, 159, 70],
  [236, 92, 159, 150],
  [244, 150, 192, 200],
];
const ORANGE = [
  [222, 126, 54, 60],
  [222, 126, 54, 130],
  [236, 168, 112, 180],
];

function draw(now) {
  const t = now / 1000;
  const mid = H * 0.52;
  // A short band (the phone layout) gets taller waves for its size.
  const amp = H < 260 ? H * 0.26 : Math.min(H * 0.14, 120);
  const spread = Math.min(1, H / 300);
  // A soft bump that follows the pointer, as if you were bending the signal.
  const bump = (x) =>
    pointerX < 0
      ? 0
      : Math.exp(-((x - pointerX) ** 2) / (2 * 110 ** 2)) *
        ((pointerY - mid) / H) *
        0.9;
  const m = 0.5 - 0.5 * Math.cos(t * 0.35);
  const k = (Math.PI * 2 * 2.2) / Math.max(W, 1);
  const drift = t * 1.1;
  scope.draw([
    // Two quieter "tracks" behind the main signal, in the app's track colours.
    {
      y: (x) => mid + 40 * spread + Math.sin(x * k * 1.5 - drift * 0.8 + 1) * amp * 0.35,
      ramp: PINK,
      width: 1.5,
      glow: 5,
      strength: 0.35,
    },
    {
      y: (x) =>
        mid - 30 * spread + morph(x * k * 0.75 - drift * 0.6 + 2, 1 - m) * amp * 0.5,
      ramp: ORANGE,
      width: 1.5,
      glow: 5,
      strength: 0.35,
    },
    {
      y: (x) =>
        mid +
        morph(x * k - drift, m) * amp * (1 + bump(x)) -
        bump(x) * amp * 0.4,
      ramp: window.Dither.BLUE,
      width: 3,
      glow: 9,
      strength: 0.6,
    },
  ]);
}

// 30 frames a second is plenty for a dithered scope and halves the work on phones.
function frame(now) {
  if (now - lastFrame >= 32) {
    lastFrame = now;
    draw(now);
  }
  rafId = requestAnimationFrame(frame);
}
function startLoop() {
  if (W && !rafId && heroVisible && !document.hidden && !reduceMotion) {
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
document.addEventListener("visibilitychange", () =>
  document.hidden ? stopLoop() : startLoop(),
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
