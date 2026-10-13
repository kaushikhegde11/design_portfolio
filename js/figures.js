/* Home hero helpers:
   1) sends the site's light/dark choice to the embedded illustrations (figures/*.html);
   2) slides the nav row in once more than half of the hero has scrolled above the viewport. */
(function () {
  var root = document.documentElement;

  /* ── theme sync ─────────────────────────────────────────────────── */
  var dark = function () {
    var t = root.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  var frames = function () { return document.querySelectorAll("iframe[data-hla-embed]"); };
  var send = function (frame) {
    if (frame.contentWindow) frame.contentWindow.postMessage({ type: "hla-theme", dark: dark() }, "*");
  };
  var sendAll = function () { frames().forEach(send); };
  document.addEventListener("DOMContentLoaded", function () {
    frames().forEach(function (f) { f.addEventListener("load", function () { send(f); }); send(f); });
  });
  new MutationObserver(sendAll).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sendAll);

  /* ── clicks and the circle cursor from inside the drawings ─────────────
     Each embed posts {hla-open} on click/Enter and {hla-pointer} while the pointer moves, so a drawing opens
     its section and the site's circle cursor keeps tracking over the iframe. Hover interaction is unaffected. */
  var frameFor = function (win) {
    var list = frames();
    for (var i = 0; i < list.length; i++) if (list[i].contentWindow === win) return list[i];
    return null;
  };
  window.addEventListener("message", function (e) {
    var d = e.data, f = d && frameFor(e.source);
    if (!f) return;
    if (d.type === "hla-open") {
      var link = f.closest(".hero-card").querySelector(".hero-card-link");
      if (link) link.click();
    } else if (d.type === "hla-pointer") {
      var body = document.body, dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
      if (!dot || !ring) return;
      if (d.over) {
        var r = f.getBoundingClientRect();
        [dot, ring].forEach(function (el) {
          el.style.setProperty("--cx", r.left + d.x + "px");
          el.style.setProperty("--cy", r.top + d.y + "px");
        });
        body.classList.add("cursor-ready", "cursor-hover");
      } else {
        body.classList.remove("cursor-hover");
      }
    }
  });

  /* ── nav row reveal ─────────────────────────────────────────────── */
  root.classList.add("js-nav-reveal"); /* without JS the nav row simply stays visible */
  var header, hero, ticking = false;
  var check = function () {
    ticking = false;
    if (!header || !hero) return;
    var r = hero.getBoundingClientRect();
    var show = -r.top > r.height / 2;
    if (show !== header.classList.contains("nav-revealed")) {
      header.classList.toggle("nav-revealed", show);
      /* experience.js publishes --head-now on scroll; nudge it so pinned bars account for the nav row */
      window.dispatchEvent(new Event("scroll"));
    }
  };
  var queue = function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
  };
  document.addEventListener("DOMContentLoaded", function () {
    header = document.querySelector(".site-header");
    hero = document.getElementById("home");
    check();
  });
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  /* ── fit the 2x2 in the first screen: publish the strip's top edge (css/figures.css sizes the strip from it) ── */
  var fit = function () {
    var strip = document.querySelector(".hero-strip");
    if (!strip) return;
    root.style.setProperty("--strip-top", Math.round(strip.getBoundingClientRect().top + window.scrollY) + "px");
  };
  document.addEventListener("DOMContentLoaded", fit);
  window.addEventListener("load", fit);
  window.addEventListener("resize", fit, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
