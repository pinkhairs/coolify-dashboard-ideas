// expandable-cards.js
export function initExpandableCards({
  selector = ".card, .project-card, .server-card",
  detailsSelector = ".details-body",
  colSpanOpen = ["lg:col-span-2", "xl:col-span-3"],
  accordion = false, // set true if you want only one open at a time
} = {}) {
  const cards = Array.from(document.querySelectorAll(selector));

  // Helpers: slideDown / slideUp using max-height + opacity
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function slideDown(el) {
    if (!el) return;
    el.classList.remove("hidden");
    if (prefersReduced) {
      el.style.removeProperty("max-height");
      el.style.removeProperty("opacity");
      return;
    }
    el.style.overflow = "hidden";
    el.style.maxHeight = "0px";
    el.style.opacity = "0";
    // force reflow
    void el.offsetHeight;
    el.style.transition = "max-height 200ms ease, opacity 200ms ease";
    el.style.maxHeight = el.scrollHeight + "px";
    el.style.opacity = "1";
    el.addEventListener(
      "transitionend",
      () => {
        el.style.removeProperty("overflow");
        el.style.removeProperty("max-height");
        el.style.removeProperty("opacity");
        el.style.removeProperty("transition");
      },
      { once: true }
    );
  }

  function slideUp(el) {
    if (!el) return;
    if (prefersReduced) {
      el.classList.add("hidden");
      el.style.removeProperty("max-height");
      el.style.removeProperty("opacity");
      return;
    }
    el.style.overflow = "hidden";
    el.style.maxHeight = el.scrollHeight + "px";
    el.style.opacity = "1";
    // force reflow
    void el.offsetHeight;
    el.style.transition = "max-height 200ms ease, opacity 200ms ease";
    el.style.maxHeight = "0px";
    el.style.opacity = "0";
    el.addEventListener(
      "transitionend",
      () => {
        el.classList.add("hidden");
        el.style.removeProperty("overflow");
        el.style.removeProperty("max-height");
        el.style.removeProperty("opacity");
        el.style.removeProperty("transition");
      },
      { once: true }
    );
  }

  function isInteractive(el) {
    return !!el.closest("a, button, input, select, textarea, label, [role='button']");
  }

  function inDetails(el, detailsRoot) {
    return detailsRoot && !!el.closest(detailsSelector);
  }

  function closeCard(card) {
    const details = card.querySelector(detailsSelector);
    if (!details || details.classList.contains("hidden")) return;
    slideUp(details);
    colSpanOpen.forEach(c => card.classList.remove(c));
    card.dataset.expanded = "false";
  }

  function openCard(card) {
    const details = card.querySelector(detailsSelector);
    if (!details || !details.classList.contains("hidden")) return;
    if (accordion) {
      cards.forEach(c => {
        if (c !== card) closeCard(c);
      });
    }
    slideDown(details);
    colSpanOpen.forEach(c => card.classList.add(c));
    card.dataset.expanded = "true";
    // Optional: keep the opened card fully in view
    card.scrollIntoView({ block: "nearest", behavior: prefersReduced ? "auto" : "smooth" });
  }

  cards.forEach(card => {
    const details = card.querySelector(detailsSelector);
    if (!details) return;

    // initial state flag
    card.dataset.expanded = details.classList.contains("hidden") ? "false" : "true";

    card.addEventListener("click", e => {
      const target = e.target;
      // Don’t toggle if clicking an interactive control or inside the details area
      if (isInteractive(target) || inDetails(target, details)) return;

      const isOpen = card.dataset.expanded === "true";
      if (isOpen) {
        closeCard(card);
      } else {
        openCard(card);
      }
    });
  });
}
