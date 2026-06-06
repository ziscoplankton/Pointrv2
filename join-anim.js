/* ============================================================
   POINTR — JOIN PAGE ANIMATIONS  (GSAP edition)
   join-anim.js

   Adds GSAP polish on top of join-form.js logic:
   1. Intro screen entrance (ring, title, sub, button)
   2. Form step transitions (upgraded from CSS-only)
   3. Pill button micro-interactions
   4. Progress bar animated fill
   5. Logo ring settle
   6. Reduced-motion safety
   ============================================================ */

gsap.registerPlugin();

document.addEventListener("DOMContentLoaded", () => {

  const mm = gsap.matchMedia();

  /* ── FULL MOTION ── */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initJoinIntro();
    initLogoRingSettle();
    initPillMicroInteractions();
    patchFormTransitions();
  });

  /* ── REDUCED MOTION — show everything instantly ── */
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([
      ".join-header",
      ".join-intro-title",
      ".join-intro-sub",
      ".btn-join",
      ".intro-ring-wrap",
    ], { autoAlpha: 1, y: 0, scale: 1 });
  });
});

/* ============================================================
   1. INTRO SCREEN ENTRANCE
   ============================================================ */
function initJoinIntro() {
  const header  = document.querySelector(".join-header");
  const ring    = document.querySelector(".intro-ring-wrap");
  const title   = document.querySelector(".join-intro-title");
  const sub     = document.querySelector(".join-intro-sub");
  const btnWrap = document.querySelector(".btn-join-wrap");
  const btn     = document.querySelector(".btn-join");

  window._introTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const tl = window._introTl;

  // Bouncy ring entrance
  if (ring)    tl.from(ring,    { autoAlpha: 0, scale: 1, duration: 1., ease: "power1.out" });
  if (header)  tl.from(header,  { autoAlpha: 0, y: -20, duration: 0.9 }, "<1.3");
  if (title)   tl.from(title,   { autoAlpha: 0, y: 48, duration: 1 }, "<1");
  if (sub)     tl.from(sub,     { autoAlpha: 0, y: 28, duration: 0.8 }, "<0.95");
  if (btnWrap) {
    gsap.set(btnWrap, { autoAlpha: 0 });
    tl.to(btnWrap, { autoAlpha: 1, duration: 0.8 }, "<0.95");
  }

  // Ring fades out after 2 spins (~6s)
  if (ring) {
    setTimeout(() => {
      gsap.to(ring, {
        autoAlpha: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }, 4500);
  }

  // Ensure GSAP never touches the wrapper so CSS spin runs cleanly
  if (btnWrap) gsap.set(btnWrap, { clearProps: "transform" });

  // Pause/resume spin on hover — same pattern as contact icons
  if (btnWrap) {
    btnWrap.addEventListener("mouseenter", () => {
      btnWrap.style.animationPlayState = "paused";
    });
    btnWrap.addEventListener("mouseleave", () => {
      btnWrap.style.animationPlayState = "running";
    });
  }

  // Kill everything and hand off to showForm cleanly
  if (btn) {
    btn.addEventListener("click", () => {
      tl.kill();
      gsap.killTweensOf(btnWrap);
      gsap.killTweensOf(ring);

      const intro = document.querySelector(".join-intro");
      if (intro) {
        gsap.to(intro, {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            intro.style.display = "none";
          }
        });
      }
    });
  }
}

/* ============================================================
   2. LOGO RING SETTLE (same as index page)
   ============================================================ */
function initLogoRingSettle() {
  setTimeout(() => {
    document.querySelectorAll(".logo-ring-svg").forEach(r => {
      r.classList.add("ring-settled");
    });
  }, 6000);
}

/* ============================================================
   3. PILL MICRO-INTERACTIONS
   Enhance pill select/deselect with a small spring.
   ============================================================ */
function initPillMicroInteractions() {
  document.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      /* Quick scale pop on click */
      gsap.fromTo(btn,
        { scale: 0.96 },
        { scale: 1, duration: 0.35, ease: "back.out(2)", overwrite: true }
      );
    });

    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { x: 4, duration: 0.2, ease: "power2.out", overwrite: "auto" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, duration: 0.2, ease: "power2.inOut", overwrite: "auto" });
    });
  });
}

/* ============================================================
   4. FORM STEP TRANSITIONS — patch join-form.js with GSAP
   We override goToStep to use GSAP instead of CSS classes.
   This must load AFTER join-form.js (handled via script order).
   ============================================================ */
function patchFormTransitions() {
  setTimeout(() => {
    if (typeof goToStep !== "function") return;

    const container = document.querySelector(".form-steps-container");
    if (!container) return;

    const obs = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName !== "class") return;
        const el = m.target;

        if (el.classList.contains("step-active")) {
          gsap.fromTo(el,
            { autoAlpha: 0, y: -18 },
            { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" }
          );
          const children = el.querySelectorAll(
            ".step-question, .input-underline, .pill-list, .step-footnote"
          );
          gsap.from(children, {
            autoAlpha: 0,
            y: 10,
            duration: 0.4,
            ease: "power2.out",
            stagger: { each: 0.07, from: "start" },
            delay: 0.08,
          });
        }

        if (el.classList.contains("step-exit")) {
          gsap.fromTo(el,
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: 28, duration: 0.35, ease: "power2.in", overwrite: true }
          );
        }
      });
    });

    container.querySelectorAll(".form-step").forEach(step => {
      obs.observe(step, { attributes: true });
    });

  }, 50);
}