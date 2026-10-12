/* Portfolio host for unchanged Hairline figures. Theme belongs to the site;
 * geometry and motion belong to each figure and the shared kernel. */
(() => {
  "use strict";
  const handles = [];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  HL.setReducedMotion(motion.matches);
  motion.addEventListener("change", e => HL.setReducedMotion(e.matches));
  HL.inject(document);
  const stages = [...document.querySelectorAll(".exploded-stage")];
  window.hairline = figure => {
    const canvas = document.querySelector(`[data-figure="${figure.name}"]`);
    if (!canvas) return;
    // The portfolio presents category titles only; study read-outs stay internal.
    let part = "rest";
    const read = {
      set textContent(value) { part = value; },
      get textContent() { return part; },
    };
    const fallback = Array.from(canvas.children);
    canvas.replaceChildren();
    const svg = HL.mk("svg", { viewBox:"0 0 400 320", "aria-hidden":"true" }, canvas);
    try {
      handles.push(figure.mount({ stage:canvas, svg, read }, figure.range[2]));
    } catch (error) {
      canvas.replaceChildren(...fallback);
      console.error(`Exploded view: ${figure.name}`, error);
    }
  };
  // The frame is the section link; its child owns the drawing and pointer.
  stages.forEach(stage => {
    const canvas = stage.querySelector(".exploded-canvas");
    let x = 200;
    const sendInput = (nextX = x, y = 160) => {
      x = nextX;
      const box = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent("pointermove", {
        pointerType:"mouse", pointerId:1,
        clientX:box.left + x / 400 * box.width,
        clientY:box.top + y / 320 * box.height,
      }));
    };
    // Reset the same synthetic mouse pointer used by the arrow keys.
    const reset = () => {
      canvas.dispatchEvent(new PointerEvent("pointerleave", { pointerType:"mouse", pointerId:1 }));
      x = 200;
    };
    stage.addEventListener("focus", () => {
      sendInput(canvas.dataset.figure === "laptop" ? 330 : 200,
        canvas.dataset.figure === "laptop" ? 40 : 160);
    });
    stage.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        reset();
        return;
      }
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      x = Math.min(330, Math.max(65, x + (e.key === "ArrowRight" ? 25 : -25)));
      const y = canvas.dataset.figure === "laptop" ? 300 - (x - 65) / 265 * 260 : 160;
      sendInput(x, y);
    });
    stage.addEventListener("blur", reset);
  });
  addEventListener("pagehide", e => {
    if (!e.persisted) handles.forEach(handle => handle.destroy());
  });
})();
