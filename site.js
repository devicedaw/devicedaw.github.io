"use strict";
document.documentElement.classList.add("js");

const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const closeMenu = () => {
  menu.setAttribute("aria-expanded", "false");
  navigation.dataset.open = "false";
};
menu.addEventListener("click", () => {
  const expanded = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(expanded));
  navigation.dataset.open = String(expanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});

const viewButtons = [...document.querySelectorAll("[data-view]")];
const viewPanels = [...document.querySelectorAll("[data-panel]")];
function showView(view) {
  viewButtons.forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.view === view)),
  );
  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== view;
  });
}
viewButtons.forEach((button) =>
  button.addEventListener("click", () => showView(button.dataset.view)),
);
showView("arrange");

const copyButton = document.querySelector("#copy-command");
const copyStatus = document.querySelector("#copy-status");
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      document.querySelector("#build-command").textContent.trim(),
    );
    copyStatus.textContent = "Copied. Paste these commands into your terminal.";
    copyButton.textContent = "Copied ✓";
  } catch {
    copyStatus.textContent =
      "Copy unavailable. Select the commands above and copy them manually.";
  }
});
