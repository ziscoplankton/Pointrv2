/* ============================================================
   POINTR — JOIN PAGE FORM LOGIC
   join-form.js

   Multi-step form with:
   - Step-by-step fade/slide transitions
   - Progress bar
   - Validation per step
   - Airtable submission on final step
   - Thank you screen
   ============================================================

   AIRTABLE CONFIG — edit here only if credentials change
   ============================================================ */

const AIRTABLE = {
  personalAccessToken: "patyhlCFLA3eyNjgs.65f80db214ebaaedca986ff84732af09f9f2dd098adfe68774d32b6fa0147e39",
  baseId:              "appWrwFQHjoTJBPyb",
  table:               "Registrations",
};

/* ============================================================
   FORM STEPS DEFINITION
   Each step maps to a screen in the mockup.
   id        → matches data-step attribute in HTML
   validate  → returns error string or null
   collect   → returns { fieldName: value } for Airtable
   ============================================================ */

const STEPS = [
  {
    id: "name",
    validate: () => {
      const val = field("name").value.trim();
      return val.length < 1 ? "Please enter your name." : null;
    },
    collect: () => ({ "First Name": field("name").value.trim() }),
  },
  {
    id: "email",
    validate: () => {
      const val = field("email").value.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) return "Please enter your email address.";
      if (!emailRe.test(val)) return "Please enter a valid email address.";
      return null;
    },
    collect: () => ({ "Email": field("email").value.trim() }),
  },
  {
    id: "programs",
    validate: () => {
      const selected = selectedPills("programs");
      return selected.length < 1 ? "Please select at least one program." : null;
    },
    collect: () => ({ "Programs": selectedPills("programs") }),
  },
  {
    id: "strategy",
    validate: () => null,
    collect: () => ({ "Goals": field("strategy").value.trim() }),
  },
  {
    id: "challenges",
    validate: () => {
      const selected = selectedPills("challenges");
      return selected.length < 1 ? "Please select at least one challenge." : null;
    },
    collect: () => ({ "Frustrations": selectedPills("challenges") }),
  },
  {
    id: "price",
    validate: () => {
      const selected = selectedPills("price");
      return selected.length < 1 ? "Please select a price tier." : null;
    },
    collect: () => ({ "Would Pay": (selectedPills("price")[0] || "").replace("$", "") }),
  },
];

/* ============================================================
   STATE
   ============================================================ */

let currentStep = 0;
const formData   = {};   // accumulated Airtable payload

/* ============================================================
   HELPERS
   ============================================================ */

function field(name) {
  return document.querySelector(`[data-field="${name}"]`);
}

function selectedPills(groupName) {
  return [...document.querySelectorAll(`[data-group="${groupName}"] .pill-btn.selected`)]
    .map((btn) => btn.dataset.value);
}

function stepEl(stepId) {
  return document.querySelector(`[data-step="${stepId}"]`);
}

function errorEl(stepId) {
  return document.querySelector(`[data-step="${stepId}"] .input-error-msg`);
}

function showError(stepId, msg) {
  const el = errorEl(stepId);
  if (el) el.textContent = msg || "";
}

function clearError(stepId) {
  showError(stepId, "");
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */

function updateProgress(index) {
  const total   = STEPS.length;
  const pct     = Math.round(((index) / total) * 100);
  const fill    = document.querySelector(".progress-fill");
  const label   = document.querySelector(".progress-label");
  if (fill)  fill.style.width  = `${pct}%`;
  if (label) label.textContent = `Step ${index + 1} of ${total}`;
}

/* ============================================================
   STEP TRANSITIONS
   ============================================================ */

function goToStep(nextIndex) {
  const current = STEPS[currentStep];
  const next    = STEPS[nextIndex];
  if (!current || !next) return;

  const currentEl = stepEl(current.id);
  const nextEl    = stepEl(next.id);
  if (!currentEl || !nextEl) return;

  // Exit current
  currentEl.classList.add("step-exit");
  currentEl.classList.remove("step-active");

  // Small delay so exit animation is visible
  setTimeout(() => {
    currentEl.classList.remove("step-exit");
    // Enter next
    nextEl.classList.add("step-active");
    // Focus first input in next step
    const firstInput = nextEl.querySelector("input, button.pill-btn");
    if (firstInput) firstInput.focus();
  }, 420);

  currentStep = nextIndex;
  updateProgress(nextIndex);
}

/* ============================================================
   PILL SELECT BEHAVIOUR
   ============================================================ */

function initPills() {
  document.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group    = btn.closest("[data-group]")?.dataset.group;
      const isRadio  = btn.closest("[data-group]")?.dataset.type === "radio";

      if (isRadio) {
        // Single select — deselect others in group
        document.querySelectorAll(`[data-group="${group}"] .pill-btn`).forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
      }

      const isSelected = btn.classList.contains("selected");
      btn.classList.toggle("selected", !isSelected);
      btn.setAttribute("aria-pressed", String(!isSelected));
    });
  });
}

/* ============================================================
   AIRTABLE SUBMISSION
   ============================================================ */

async function submitToAirtable(payload) {
  const url = `https://api.airtable.com/v0/${AIRTABLE.baseId}/${encodeURIComponent(AIRTABLE.table)}`;

  const response = await fetch(url, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${AIRTABLE.personalAccessToken}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ fields: payload }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/* ============================================================
   OK BUTTON HANDLER
   ============================================================ */

async function handleOk() {
  const step = STEPS[currentStep];
  clearError(step.id);

  // Validate
  const err = step.validate();
  if (err) {
    showError(step.id, err);
    return;
  }

  // Collect data
  Object.assign(formData, step.collect());

  const isLastStep = currentStep === STEPS.length - 1;

  if (isLastStep) {
    // showThankYou();
    // return;
    // Submit to Airtable
    const btn = document.querySelector(`[data-step="${step.id}"] .btn-ok`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("loading");
    }

    try {
      await submitToAirtable(formData);
      showThankYou();
    } catch (e) {
      console.error("Airtable error:", e);
      showError(step.id, "Something went wrong. Please try again.");
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("loading");
      }
    }
  } else {
    goToStep(currentStep + 1);
  }
}

/* ============================================================
   THANK YOU SCREEN
   ============================================================ */

function showThankYou() {
  // Hide form and progress
  const formWrap   = document.querySelector(".join-form-wrap");
  const progressWrap = document.querySelector(".progress-bar-wrap");

  if (formWrap)    formWrap.style.display = "none";
  if (progressWrap) progressWrap.style.display = "none";

  const thankyou = document.querySelector(".join-thankyou");
  if (thankyou) {
    thankyou.style.display = "flex";
    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        thankyou.classList.add("visible");
      });
    });
  }
}

/* ============================================================
   INTRO → FORM TRANSITION
   Clicking "Join" on the intro screen slides intro out,
   slides form in, initialises step 0.
   ============================================================ */

function showForm() {
  const intro      = document.querySelector(".join-intro");
  const formWrap   = document.querySelector(".join-form-wrap");
  const progressWrap = document.querySelector(".progress-bar-wrap");

  // Delay form appearance until intro has fully faded (GSAP takes 0.35s)
  setTimeout(() => {

    if (intro) intro.style.display = "none";

    if (progressWrap) {
      progressWrap.style.display = "block";
    }

    if (formWrap) {
      formWrap.style.display    = "flex";
      formWrap.style.opacity    = "0";
      formWrap.style.transform  = "translateY(-20px)";
      formWrap.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          formWrap.style.opacity   = "1";
          formWrap.style.transform = "translateY(0)";
        });
      });
    }

    // Activate first step
    const firstStepEl = stepEl(STEPS[0].id);
    if (firstStepEl) firstStepEl.classList.add("step-active");

    updateProgress(0);

  }, 400); // matches GSAP intro fade duration of 0.35s + small buffer
}

/* ============================================================
   KEYBOARD — press Enter to advance
   ============================================================ */

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    // Only if form is visible and an input/pill is focused
    const formWrap = document.querySelector(".join-form-wrap");
    if (!formWrap || formWrap.style.display === "none") return;
    e.preventDefault();
    handleOk();
  });
}

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Hide form and thank-you initially
  const formWrap  = document.querySelector(".join-form-wrap");
  const thankyou  = document.querySelector(".join-thankyou");
  const progressWrap = document.querySelector(".progress-bar-wrap");

  if (formWrap)    formWrap.style.display    = "none";
  if (thankyou)    thankyou.style.display    = "none";
  if (progressWrap) progressWrap.style.display = "none";

  // Wire intro Join button
  const joinBtn = document.querySelector(".btn-join");
  if (joinBtn) joinBtn.addEventListener("click", showForm);

  // Wire all OK buttons
  document.querySelectorAll(".btn-ok").forEach((btn) => {
    btn.addEventListener("click", handleOk);
  });

  // Wire pill selects
  initPills();

  // Keyboard
  initKeyboard();

  // Logo ring — settle after 2 rotations (same as index)
  setTimeout(() => {
    document.querySelectorAll(".logo-ring-svg").forEach((r) => {
      r.classList.add("ring-settled");
    });
  }, 6000);

  // The intro ring (large hero ring) keeps spinning — do NOT settle it
  // It has class .intro-ring-svg not .logo-ring-svg
});
