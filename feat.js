gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

  const leftPanels = gsap.utils.toArray(".feature-left");
  const rightCols  = gsap.utils.toArray(".feature-right");

  if (!leftPanels.length) return;

  // Hide all left panels initially
  gsap.set(leftPanels, { autoAlpha: 0, y: 20 });
  // Show first one
  gsap.set(leftPanels[0], { autoAlpha: 1, y: 0 });

  rightCols.forEach((right, i) => {
    const leftPanel = leftPanels[i];
    if (!leftPanel) return;

    ScrollTrigger.create({
      trigger: right,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(leftPanels, { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in", overwrite: true });
        gsap.to(leftPanel,  { autoAlpha: 1, y: 0,   duration: 0.5,  ease: "power3.out", delay: 0.2, overwrite: true });
      },
      onEnterBack: () => {
        gsap.to(leftPanels, { autoAlpha: 0, y: 20,  duration: 0.35, ease: "power2.in", overwrite: true });
        gsap.to(leftPanel,  { autoAlpha: 1, y: 0,   duration: 0.5,  ease: "power3.out", delay: 0.2, overwrite: true });
      },
    });
  });
});