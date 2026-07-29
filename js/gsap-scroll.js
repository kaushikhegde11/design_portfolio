/* gsap-scroll.js — optional pinned scroll sequences, additive over main.js
   and experience.js. Two flagship moments, both desktop + motion-OK only:

     1. Hero exploded diagram assembles then separates as the hero scrolls by.
     2. Photography contact sheet pins and scrolls sideways as a filmstrip.

   Everything is gated: if GSAP/ScrollTrigger did not load, or the viewer
   prefers reduced motion, or the viewport is below 900px, none of this runs
   and the page stays exactly as main.js/experience.js leave it. The <html>
   .gsap-on class (added only when a sequence is actually wired) is what
   unlocks the matching CSS in experience.css, so the styles never apply
   without the behaviour behind them. */
(function () {
  "use strict";

  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return; /* CDN blocked or failed — plain page, no harm */
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var ScrollTrigger = window.ScrollTrigger;

  var root = document.documentElement;
  var wired = false;
  var markWired = function () {
    if (!wired) {
      root.classList.add("gsap-on");
      wired = true;
    }
  };

  /* read a CSS length custom property off :root as a number of px */
  var cssPx = function (name) {
    return parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  };
  /* live sticky-header height (experience.js publishes --head-now), with the
     static --headh as a fallback when that hasn't run yet */
  var headPx = function () {
    return cssPx("--head-now") || cssPx("--headh") || 132;
  };

  /* run each sequence only at >=900px; gsap.matchMedia tears the sequence
     down automatically (reverting DOM + killing triggers) below that. */
  var mm = gsap.matchMedia();

  mm.add("(min-width: 900px)", function () {
    photographyFilmstrip();
    ScrollTrigger.refresh();
    /* returned cleanup runs when the query stops matching (resize down) */
    return teardownAll;
  });

  /* the case-study stack is CSS-sticky at every width; GSAP only adds the
     entry animation + parked state class, so it runs outside the mm gate. */
  stackBars();

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  var teardowns = [];
  function teardownAll() {
    teardowns.splice(0).forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
  }

  /* ── PHOTOGRAPHY HORIZONTAL FILMSTRIP ──────────────────────────────────
     Pin the section and translate the contact sheet on x. Grid view only:
     the section's own view-bar toggles .view-list (main.js), and list view
     opts out. We add listeners on the same buttons to build/tear the strip,
     leaving main.js's grid/list behaviour intact. Lightbox still works — the
     frame buttons and DOM are untouched, only the sheet's flow changes. */
  function photographyFilmstrip() {
    var section = document.getElementById("photography");
    if (!section) return;
    var sheet = section.querySelector(".contact-sheet");
    if (!sheet || sheet.children.length < 4) return;

    /* wrap the sheet in a clipping viewport + add a progress hairline */
    var viewport = document.createElement("div");
    viewport.className = "hstrip-viewport";
    sheet.parentNode.insertBefore(viewport, sheet);
    viewport.appendChild(sheet);

    var progress = document.createElement("div");
    progress.className = "hstrip-progress";
    /* inside the viewport so it stays pinned with the strip (as a sibling it
       scrolls in normal flow and drifts over the captions) */
    viewport.appendChild(progress);

    markWired();

    /* live tweens while in grid view, or null in list view. Two phases share
       the sheet's x over non-overlapping scroll ranges so they never fight:
       a lead-in that starts the moment the strip appears (telegraphing the
       sideways motion), then a pinned phase that completes the full traverse. */
    var strip = null; /* { lead, main } or null */

    var distance = function () {
      return Math.max(0, sheet.scrollWidth - viewport.clientWidth);
    };
    var LEAD = 0.15; /* fraction of the traverse spent before the pin locks */

    var setProgress = function () {
      var d = distance();
      var x = d ? -gsap.getProperty(sheet, "x") / d : 0;
      progress.style.setProperty("--hp", (Math.max(0, Math.min(1, x)) * 100).toFixed(1) + "%");
    };

    var build = function () {
      if (strip || sheet.classList.contains("view-list")) return;
      sheet.classList.add("is-hstrip");

      /* phase 1 — lead-in: from section entering view to reaching the park.
         No pin; frames drift by LEAD of the total distance. */
      var lead = gsap.fromTo(
        sheet,
        { x: 0 },
        {
          x: function () { return -LEAD * distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            start: "top bottom",
            end: function () { return "top top+=" + headPx(); },
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: setProgress
          }
        }
      );

      /* phase 2 — pinned: from the park onward, complete the traverse. */
      var main = gsap.fromTo(
        sheet,
        { x: function () { return -LEAD * distance(); } },
        {
          x: function () { return -distance(); },
          ease: "none",
          scrollTrigger: {
            trigger: viewport,
            start: function () { return "top top+=" + headPx(); },
            end: function () { return "+=" + (distance() * (1 - LEAD)); },
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: setProgress
          }
        }
      );

      strip = { lead: lead, main: main };
    };

    var tear = function () {
      if (!strip) return;
      [strip.lead, strip.main].forEach(function (t) {
        if (!t) return;
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
      strip = null;
      gsap.set(sheet, { x: 0 });
      sheet.classList.remove("is-hstrip");
      progress.style.setProperty("--hp", "0%");
    };

    /* react to the section's own grid/list buttons (bound also by main.js) */
    var viewBar = section.querySelector(".view-bar");
    var onView = function (e) {
      var btn = e.target.closest("button[data-view]");
      if (!btn) return;
      /* main.js flips .view-list in the same click; defer to read final state */
      requestAnimationFrame(function () {
        if (sheet.classList.contains("view-list")) tear();
        else build();
        ScrollTrigger.refresh();
      });
    };
    if (viewBar) viewBar.addEventListener("click", onView);

    build();

    teardowns.push(function () {
      if (viewBar) viewBar.removeEventListener("click", onView);
      tear();
      /* unwrap: put the sheet back where it was, drop scaffolding */
      if (viewport.parentNode) {
        viewport.parentNode.insertBefore(sheet, viewport);
        viewport.remove();
      }
      progress.remove();
    });
  }

  /* ── CASE-STUDY STACK ──────────────────────────────────────────────────
     Bars park one under another below the header, all stay visible, then the
     whole assembled stack scrolls off as one block. CSS position:sticky is the
     no-JS / reduced-motion fallback (experience.css section J); when GSAP runs
     we pin instead so every bar can share ONE release point — a staggered start
     parks them one by one, the shared end:"bottom top" releases them together.
     .gsap-pinned tells the CSS to stand its sticky positioning down. */
  function stackBars() {
    var stack = document.getElementById("cs-stack");
    if (!stack) return;
    /* on phones GSAP pinning mis-measures and overlaps — skip it and let the
       pure-CSS position:sticky fallback (experience.css section J) park the
       bars instead. Not adding .gsap-pinned keeps that CSS sticky live. */
    if (window.matchMedia("(max-width: 720px)").matches) { markWired(); return; }
    var bars = Array.prototype.slice.call(stack.querySelectorAll(".cs-bar"));
    if (!bars.length) return;

    var BAR_H = cssPx("--bar-h");
    stack.classList.add("gsap-pinned");

    bars.forEach(function (bar, i) {
      ScrollTrigger.create({
        trigger: bar,
        start: function () { return "top " + (headPx() + i * BAR_H) + "px"; },
        endTrigger: stack,
        end: "bottom top", /* same for every bar → all leave together */
        pin: true,
        pinSpacing: false, /* keep page height; panels scroll behind parked bars */
        anticipatePin: 1,
        invalidateOnRefresh: true,
        toggleClass: { targets: bar, className: "is-parked" }
      });
    });

    markWired();
  }
})();
