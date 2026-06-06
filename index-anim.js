/* ============================================================
   POINTR — INDEX PAGE ANIMATIONS  (GSAP edition)
   index-anim.js

   Replaces the CSS-transition approach with GSAP timelines
   and ScrollTrigger for production-grade, award-winning motion.

   Handles:
   1. Nav entrance
   2. Hero headline — word-by-word stagger
   3. Hero action buttons — staggered float entrance
   4. Hero card — diagonal glass slide-in + conic border spin
   5. Hero grow block — scroll reveal
   6. Features section — ScrollTrigger.batch() for cards,
      sticky left panels
   7. People section — split entrance
   8. Footer — fade up
   9. Logo ring — spin settle
  10. Reduced-motion safety via gsap.matchMedia()
   ============================================================ */

/* ── GSAP is loaded via CDN in index.html ── */
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   UTILITY
   ============================================================ */

/**
 * Split text content into individual <span> words in-place.
 * Returns an array of the created word spans.
 */
function wrapWords(el) {
  const text = el.textContent.trim();
  el.textContent = "";
  const words = text.split(/\s+/);
  return words.map((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    span.style.willChange = "transform, opacity";
    if (i < words.length - 1) {
      span.style.marginRight = "0.25em";
    }
    el.appendChild(span);
    return span;
  });
}

/* ============================================================
   PRELOADER
   ============================================================ */

const preloader = document.getElementById("preloader");
const isMobile = window.innerWidth <= 1024;

window.addEventListener("load", () => {
  if (isMobile) {
    // Mobile: hold logo longer, scale it up slightly as it fades
    // then reveal the static page cleanly
    const preloaderLogo = preloader.querySelector(".preloader-logo");

    const tl = gsap.timeline();

    // 1. Brief hold so the logo is seen
    tl.to(preloaderLogo, {
      scale: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 1.2,
    });

    // 2. Logo fades and scales down slightly
    tl.to(preloaderLogo, {
      autoAlpha: 0,
      scale: 1,
      duration: 0.7,
      ease: "power2.in",
    });

    // 3. White overlay fades out — page beneath is already rendered
    tl.to(preloader, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power1.out",
      onComplete: () => {
        preloader.style.display = "none";
      },
    }, "-=0.15"); // slight overlap so it feels continuous

  } else {
    // Desktop: original behaviour — quick fade while hero animates in
    gsap.to(preloader, {
      autoAlpha: 0,
      duration: 1.5,
      ease: "power1.inOut",
      delay: 0.9,
      onComplete: () => {
        preloader.style.display = "none";
      }
    });
  }
});
/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── NO MOTION ON MOBILE ── */
  if (window.innerWidth <= 1024) return;
  
  /* ----------------------------------------------------------
     REDUCED MOTION — define all animations inside matchMedia
     so users who prefer reduced motion get instant states.
  ---------------------------------------------------------- */
  const mm = gsap.matchMedia();

  /* ── FULL MOTION ── */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initLogoRing();
    initHeroHeadline();
    initHeroActions();
    initHeroCard();
    initHeroGrow();
    initNav();
    // initFeatures();
    //initPeople();
    // initFooter();
    initContactHover();
  });

  /* ── REDUCED MOTION — just show everything ── */
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([
      ".nav",
      ".hero-headline",
      ".action-btn",
      ".hero-card-wrap",
      ".hero-grow",
      ".feature-left",
      ".feature-card",
      ".people-left",
      ".people-right",
      ".footer",
    ], { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" });
  });

});

/* ============================================================
   1. LOGO RING — spin then settle
   ============================================================ */
function initLogoRing() {
  const SETTLE_DELAY = 6000; // 2 × 3s = 2 full rotations
  setTimeout(() => {
    document.querySelectorAll(".logo-ring-svg").forEach(r => {
      r.classList.add("ring-settled");
    });
  }, SETTLE_DELAY);
}

/* ============================================================
   2. NAV — slide down on load
   ============================================================ */
function initNav() {
  // Entrance — slide down after hero text lands
  gsap.from(".nav", {
    y: -48,
    autoAlpha: 0,
    duration: 0.6,
    ease: "power1.out",
    clearProps: "transform,opacity,visibility",
    delay: 7.5,
  });

  // Scroll: only deepen the shadow slightly — don't change the glass itself
  let scrolled = false;
  ScrollTrigger.create({
    start: "top -60",
    onEnter: () => {
      if (scrolled) return;
      scrolled = true;
      gsap.to(".nav", {
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    onLeaveBack: () => {
      scrolled = false;
      gsap.to(".nav", {
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
  });
}

/* ============================================================
   3. HERO HEADLINE — word-by-word stagger
   ============================================================ */
function initHeroHeadline() {
  const headline = document.querySelector(".hero-headline");
  if (!headline) return;

  const lines = headline.querySelectorAll("span");

  /* ── Wrap each line in overflow:hidden clip shell ──
     Same mechanic as initHeroCard — non-destructive.  */
  lines.forEach(line => {
    const shell = document.createElement("div");
    shell.style.cssText = "overflow:hidden; display:block;";
    line.parentNode.insertBefore(shell, line);
    shell.appendChild(line);
  });

  /* ── Start below the clip ── */
  gsap.set(lines, { y: "-105%" });

  /* ── Same timing feel as the card ── */
  gsap.to(lines, {
    y: "0%",
    duration: 0.82,
    ease: "power4.out",
    stagger: { each: 0.18, from: "start" },
    delay: 0.85,
  });
}

/* ============================================================
   4. HERO ACTION BUTTONS — stagger float entrance + float loop
   ============================================================ */
function initHeroActions() {
  const btns = gsap.utils.toArray(".action-btn");
  if (!btns.length) return;

  gsap.from(btns, {
    y: 0,
    autoAlpha: 0,
    scale: 1,
    duration: 0.65,
    ease: "power4.out",
    stagger: { each: 0.45, from: "start" },
    delay: 5.5,
    clearProps: "transform,opacity,visibility",
  });

  function startFloatLoop() {
    document.querySelectorAll(".action-icon").forEach((icon, i) => {
      gsap.fromTo(icon,
        { "--shimmer-pos": "-100%" },
        {
          "--shimmer-pos": "200%",
          duration: 0.3,
          ease: "power2.out",
          delay: i * 0.12,
        }
      );
      gsap.fromTo(icon,
        { scale: 0.88, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: "back.out(2.4)",
          delay: i * 0.12,
        }
      );
    });
  }
}

/* ============================================================
   5. HERO CARD — diagonal glass entrance
   ============================================================ */
/* ============================================================
   5. HERO CARD — iOS26 glass reveal + elegant text entrance
   ============================================================

   Sequence (all times relative to tl start):
   
   t=0      Card materialises — scale + fade from slight depth
   t=0.18   Shimmer 1 — full glass sweep (card reveal)
   t=1.75   Title rises — expo.out lift from below
   t=1.80   Shimmer 2 — light sweep across title area
   t=2.55   Sub-copy blooms — slow power3 fade+lift
   t=2.85   List items — stagger slide-in from left
   t=2.70   Shimmer 3 — final polish sweep (whole surface)
   ============================================================ */
/* ============================================================
   5. HERO CARD — iOS26 glass reveal
   
   Phase 1: Card appears. All text starts blurred (inside glass).
   Phase 2: Single shimmer sweeps left → right.
             As it passes each text element, blur lifts —
             like the glass itself is becoming clear.
   ============================================================ */
function initHeroCard() {
  const wrap      = document.querySelector(".hero-card-wrap");
  if (!wrap) return;

  const title     = wrap.querySelector(".hero-card-title");
  const sub       = wrap.querySelector(".hero-card-sub");
  const listItems = wrap.querySelectorAll(".hero-card-list li");
  const allText   = [title, sub, ...listItems];

  /* ── Card hidden, text visible but blurred ── */
  gsap.set(wrap,    { autoAlpha: 0, scale: 0.985, y: 8 });
  gsap.set(allText, { filter: "blur(9px)" });

  /* ── Shimmer (untouched) ── */
  const shimmer = document.createElement("div");
  shimmer.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(
      315deg,
      transparent              0%,
      transparent              32%,
      rgba(255,255,255,0.10)   42%,
      rgba(255,255,255,0.78)   50%,
      rgba(255,255,255,0.10)   58%,
      transparent              68%,
      transparent              100%
    );
    background-size: 300% 300%;
    background-position: 100% 100%;
    pointer-events: none;
    z-index: 10;
    border-radius: inherit;
    will-change: background-position;
  `;

  const UNBLUR_DUR = 0.6;
  const STAGGER    = 0.14;

  const tl = gsap.timeline({ delay: 2.4 });

  /* ─── Phase 1: Card appears ── */
  tl.to(wrap, {
    autoAlpha: 1, scale: 1, y: 0,
    duration: 0.6,
    ease: "expo.out",
  });

  /* ─── Phase 2: Shimmer sweeps first — light passes over blurred glass ── */
  tl.call(() => {
    wrap.appendChild(shimmer);
    gsap.to(shimmer, {
      backgroundPosition: "0% 0%",
      duration: 2.2,
      ease: "power1.inOut",
      onComplete: () => shimmer.remove(),
    });
  }, null, "+=0.1");

  /* ─── Phase 3: Text unblurs as shimmer sweeps — content emerges beneath ──
     Starts 0.3s into the shimmer so the light leads the reveal.
  ────────────────────────────────────────────────────────────────────────── */
  tl.to(allText, {
    filter: "blur(0px)",
    duration: UNBLUR_DUR,
    ease: "power2.out",
    stagger: { each: STAGGER, from: "start" },
    delay: 0.3,
  }, "+=0.25");
}
/* ============================================================
   6. HERO GROW — scroll-triggered reveal
   ============================================================ */
function initHeroGrow() {
  const grow  = document.querySelector(".hero-grow");
  if (!grow) return;

  const title = grow.querySelector(".hero-grow-title");
  const sub   = grow.querySelector(".hero-grow-sub");

  /* ── Wrap each line in overflow:hidden clip shell ── */
  [title, sub].forEach(el => {
    const shell = document.createElement("div");
    shell.style.cssText = "overflow:hidden; display:block;";
    el.parentNode.insertBefore(shell, el);
    shell.appendChild(el);
  });

  /* ── Start above the clip — same drop family as headline ── */
  gsap.set([title, sub], { y: "-105%" });

  /* ── ScrollTrigger drives it — only plays once in viewport ── */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: grow,
      start: "top 88%",
      once: true,
    },
    defaults: { ease: "power4.out" },
  });

  tl.to(title, {
    y: "0%",
    duration: 0.85,
    delay: 1.5
  });

  /* Sub drops slightly after — same 220ms gap as the headline ── */
  tl.to(sub, {
    y: "0%",
    duration: 0.85,
  }, "-=0.62");
}

/* ============================================================
   7. FEATURES — ScrollTrigger per section
      Left panel: pin-fade on scroll in sticky mode
      Cards: batch entrance with stagger
   ============================================================ */
function initFeatures() {
  const sections = gsap.utils.toArray(".feature-section");
  if (!sections.length) return;

  sections.forEach(section => {
    const left = section.querySelector(".feature-left");
    const cards = section.querySelectorAll(".feature-card");

    /* ---- Left panel entrance ---- */
    if (left) {
      gsap.from(left, {
        autoAlpha: 0,
        x: -32,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });
    }

    /* ---- Cards: stagger in ---- */
    if (cards.length) {
      gsap.from(cards, {
        autoAlpha: 0,
        y: 32,
        scale: 0.97,
        duration: 0.6,
        ease: "power3.out",
        stagger: { each: 0.12, from: "start" },
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          once: true,
        },
      });
    }
  });

  /* ---- Feature card hover micro-interaction ---- */
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { scale: 1.025, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.inOut" });
    });
  });
}

/* ============================================================
   8. PEOPLE SECTION — split entrance
   ============================================================ */
function initPeople() {
  const section = document.querySelector(".people");
  if (!section) return;

  const left  = section.querySelector(".people-left");
  const right = section.querySelector(".people-right");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      once: true,
    },
    defaults: { duration: 0.75, ease: "power3.out" },
  });

  if (left) {
    tl.from(left.querySelector(".people-label"), { autoAlpha: 0, y: 24 }, 0)
      .from(left.querySelector(".people-body"), { autoAlpha: 0, y: 20 }, "<0.1")
      .from(left.querySelector(".people-collab"), { autoAlpha: 0, y: 16 }, "<0.1");
  }

  if (right) {
    const contactBtns = right.querySelectorAll(".contact-btn");
    tl.from(contactBtns, {
      autoAlpha: 0,
      y: 24,
      scale: 0.9,
      stagger: { each: 0.1 },
    }, "<0.15");

    /* Hover lift — contact icons */
    contactBtns.forEach(btn => {
      const icon = btn.querySelector(".contact-icon");
      btn.addEventListener("mouseenter", () => {
        gsap.to(icon, { y: -5, scale: 1.08, duration: 0.25, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(icon, { y: 0, scale: 1, duration: 0.25, ease: "power2.inOut" });
      });
    });
  }
}

/* ============================================================
   PEOPLE — Contact icon SVG gradient hover animation
   ============================================================ */
function initContactHover() {
  if (!document.querySelector('.contact-stop-a')) return;

  function lerpColor(a, b, amt) {
    const parse = hex => [
      parseInt(hex.slice(1,3), 16),
      parseInt(hex.slice(3,5), 16),
      parseInt(hex.slice(5,7), 16)
    ];
    const [r1,g1,b1] = parse(a);
    const [r2,g2,b2] = parse(b);
    return `rgb(${Math.round(r1+(r2-r1)*amt)},${Math.round(g1+(g2-g1)*amt)},${Math.round(b1+(b2-b1)*amt)})`;
  }

  const colors = ['#474ED7', '#EC458D', '#FFF1BF'];

  document.querySelectorAll('.contact-btn').forEach(btn => {
    // Scope stops to THIS button only
    const stopsA = btn.querySelectorAll('.contact-stop-a');
    const stopsB = btn.querySelectorAll('.contact-stop-b');
    const stopsC = btn.querySelectorAll('.contact-stop-c');

    let tween = null;

    btn.addEventListener('mouseenter', () => {
      if (tween) {
        tween.resume();
      } else {
        tween = gsap.to({}, {
          duration: 2,
          repeat: -1,
          ease: 'none',
          onUpdate: function() {
            const t = (this.progress() * 3) % 3;
            const i0 = Math.floor(t) % 3;
            const i1 = (i0 + 1) % 3;
            const mix = t % 1;

            const cA = lerpColor(colors[i0],       colors[i1],       mix);
            const cB = lerpColor(colors[(i0+1)%3], colors[(i1+1)%3], mix);
            const cC = lerpColor(colors[(i0+2)%3], colors[(i1+2)%3], mix);

            stopsA.forEach(s => s.setAttribute('stop-color', cA));
            stopsB.forEach(s => s.setAttribute('stop-color', cB));
            stopsC.forEach(s => s.setAttribute('stop-color', cC));
          }
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (tween) tween.pause();
    });
  });
}

/* ============================================================
   9. FOOTER — fade up
   ============================================================ */
function initFooter() {
  const footer = document.querySelector(".footer");
  if (!footer) return;

  gsap.from(footer, {
    autoAlpha: 0,
    y: 16,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: footer,
      start: "top center",
      once: true,
    },
  });
}