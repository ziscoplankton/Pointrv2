/* ============================================================
   POINTR — FEATURES SCROLL BEHAVIOUR  (GSAP edition)
   features.js

   TWO MODES — switch with one variable below:
   ─────────────────────────────────────────────────────────────
   FEATURE_SCROLL_MODE = "sticky"   → MODE A
     Left label pins while right cards scroll past it using
     GSAP ScrollTrigger pin + scrub-driven opacity.

   FEATURE_SCROLL_MODE = "together" → MODE B
     Left label + all right cards animate in/out together
     as one unit driven by ScrollTrigger toggleActions.
   ─────────────────────────────────────────────────────────────

   MAINTENANCE NOTE:
   To switch mode, change the string on line 24 only.
   ============================================================ */

// ┌─────────────────────────────────────────────────────────┐
// │  EDIT THIS LINE TO SWITCH BETWEEN MODE A AND B          │
const FEATURE_SCROLL_MODE = "sticky"; // "sticky" | "together"
// └─────────────────────────────────────────────────────────┘

/* GSAP + ScrollTrigger registered in index-anim.js already,
   but we register again here to be self-contained.          */
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener("DOMContentLoaded", () => {
  const featuresEl = document.querySelector(".features");
  if (!featuresEl) return;

  // Apply mode class for CSS hook
  featuresEl.classList.remove("mode-sticky", "mode-together");
  featuresEl.classList.add(`mode-${FEATURE_SCROLL_MODE}`);

  if (FEATURE_SCROLL_MODE === "sticky") {
    initStickyMode();
  } else {
    initTogetherMode();
  }
  initCardHover ();
});

/* ============================================================
   NAV SCROLL EFFECT
    Simple hover effect for feature cards, separate from scroll
   ============================================================ */

function initCardHover() {
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { scale: 1.025, filter: "brightness(1.1)", duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { scale: 1, filter: "brightness(1)", duration: 0.35, ease: "power2.inOut" });
    });
  });
}
/* ============================================================
   MODE A — STICKY
   Left panel fades/slides in when first card enters, fades
   out when last card scrolls away. Each card cascades in.
   ============================================================ */

function initStickyMode() {
  const sections = gsap.utils.toArray(".feature-section");

  sections.forEach(section => {
    const leftPanel = section.querySelector(".feature-left");
    const cards     = gsap.utils.toArray(section.querySelectorAll(".feature-card"));
    if (!leftPanel || !cards.length) return;

    /* ---- Initial hidden state ---- */
    gsap.set(leftPanel, { autoAlpha: 0, x: -28 });
    gsap.set(cards,     { autoAlpha: 0, y: 36 });

    /* ---- Left panel: enters when section top hits 70% of viewport ---- */
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.to(leftPanel, {
          autoAlpha: 1,
          x: 0,
          duration: 0.75,
          ease: "power3.out",
        });
      },
      onLeave: () => {
        gsap.to(leftPanel, {
          autoAlpha: 0,
          x: -16,
          duration: 0.5,
          ease: "power2.in",
        });
      },
      onEnterBack: () => {
        gsap.to(leftPanel, {
          autoAlpha: 1,
          x: 0,
          duration: 0.55,
          ease: "power3.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(leftPanel, {
          autoAlpha: 0,
          x: -16,
          duration: 0.45,
          ease: "power2.in",
        });
      },
    });

    /* ---- Cards: stagger in as section reaches viewport ---- */
    ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: { each: 0.14, from: "start" },
        });
      },
    });
  });
}

/* ============================================================
   MODE B — TOGETHER
   Entire section (left + right) animates in/out as a unit.
   ============================================================ */

function initTogetherMode() {
  const sections = gsap.utils.toArray(".feature-section");

  sections.forEach(section => {
    /* Set hidden state */
    gsap.set(section, { autoAlpha: 0, y: 48 });

    ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      end: "bottom 20%",
      toggleActions: "play reverse play reverse",
      onEnter: () => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
        });
      },
      onLeave: () => {
        gsap.to(section, {
          autoAlpha: 0,
          y: -32,
          duration: 0.5,
          ease: "power2.in",
        });
      },
      onEnterBack: () => {
        gsap.to(section, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(section, {
          autoAlpha: 0,
          y: 32,
          duration: 0.45,
          ease: "power2.in",
        });
      },
    });
  });
}
