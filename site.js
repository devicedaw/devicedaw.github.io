"use strict";
// Progressive enhancement for the Device website. Everything here is optional:
// without JavaScript every section is still readable and every link works.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ───────────── Header border once the page scrolls ───────────── */

const header = $(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ───────────── Download for this system ───────────── */

// Without JavaScript the hero button jumps to the downloads and every system shows.
// Here the visitor's own system moves first and the hero button downloads it directly
// (phones and tablets keep the default).
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
    const button = $(".button", mine);
    button.classList.replace("ghost", "primary");
    mine.parentElement.prepend(mine);

    const hero = $("[data-download]");
    hero.href = button.href;
    hero.setAttribute("download", "");
    hero.textContent = button.textContent.trim();
  }
}

/* ───────────── Copy build commands ───────────── */

const copyButton = $("#copy-command");
const copyStatus = $("#copy-status");
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      $("#build-command").textContent.trim(),
    );
    copyButton.textContent = "Copied";
    copyStatus.textContent = "Paste the commands into your terminal.";
    setTimeout(() => (copyButton.textContent = "Copy"), 2400);
  } catch {
    copyStatus.textContent =
      "Copying isn’t available here. Select the commands and copy them.";
  }
});
