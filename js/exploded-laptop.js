import { laptop } from "https://esm.sh/@lucasmarkes/hairline";

// Use the supplied public component; the small screen wash follows its own turn.
const canvas = document.getElementById("figure");
if (canvas) {
  const fallback = Array.from(canvas.children);
  canvas.replaceChildren();
  try {
    const figure = laptop(canvas);
    // The supplied figure maps a pointer to the lid slider. For hover-as-open,
    // keep real mouse motion at its fully open endpoint; keyboard input still
    // reaches the component through the portfolio's synthetic pointer events.
    canvas.addEventListener("pointermove", event => {
      if (!event.isTrusted || event.pointerType !== "mouse") return;
      event.stopImmediatePropagation();
      const box = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent("pointermove", {
        pointerType:"mouse", pointerId:event.pointerId,
        clientX:box.left + box.width * 0.5,
        clientY:box.top + box.height * 0.125,
      }));
    }, true);
    const ns = "http://www.w3.org/2000/svg";
    const glow = document.createElementNS(ns, "svg");
    glow.setAttribute("viewBox", "0 0 400 320");
    glow.setAttribute("aria-hidden", "true");
    glow.classList.add("laptop-screen-glow");
    glow.innerHTML = `<path class="screen-wash" d="M296 117 174 56 160 157 282 219Z"/>
      <path class="screen-light" d="m188 70 91 45m-94-35 63 31m-70 52 48 24m-45-15 29 15"/>`;
    canvas.append(glow);
    addEventListener("pagehide", e => { if (!e.persisted) figure.destroy(); });
  } catch (error) {
    canvas.replaceChildren(...fallback);
    console.error("Exploded view: laptop", error);
  }
}
