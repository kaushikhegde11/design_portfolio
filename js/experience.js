/* experience.js — single-scroll page enhancements only.
   Scrollspy (nav + right rail), hatch-divider draw-in, figure parallax.
   Runs alongside main.js, which still owns the menu, lightbox, filters,
   view toggles and base [data-reveal] fades. The page reads fine with all
   of this disabled — every section is plain content without it. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── live header height ──────────────────────────────────────────────
     The sticky header compresses on scroll, so its real height is unknown
     up front. Publish it as --head-now (px) for the sticky case-study bars
     and the photography strip to pin flush against; CSS/GSAP fall back to
     the static --headh when this hasn't run. */
  var headerEl = document.querySelector(".site-header");
  if (headerEl) {
    var root = document.documentElement;
    var headTick = false;
    var setHead = function () {
      headTick = false;
      root.style.setProperty(
        "--head-now",
        Math.round(headerEl.getBoundingClientRect().height) + "px"
      );
    };
    var queueHead = function () {
      if (!headTick) {
        headTick = true;
        window.requestAnimationFrame(setHead);
      }
    };
    window.addEventListener("scroll", queueHead, { passive: true });
    window.addEventListener("resize", queueHead, { passive: true });
    setHead();
  }

  /* ── hide the centered back-to-top once the footer is on screen ────────
     The footer carries its own right-aligned link, so the floating centered
     one is redundant there; .at-footer fades it out (main.js still owns the
     mid-page scroll-based .is-visible toggle). */
  var backTopEl = document.querySelector(".back-top");
  var footerEl = document.querySelector(".site-footer");
  if (backTopEl && footerEl) {
    var footTick = false;
    var checkFooter = function () {
      footTick = false;
      /* hide only near the very bottom — when ~80px of footer is still pending */
      var r = footerEl.getBoundingClientRect();
      backTopEl.classList.toggle("at-footer", r.bottom - window.innerHeight <= 80);
    };
    var queueFooter = function () {
      if (!footTick) {
        footTick = true;
        window.requestAnimationFrame(checkFooter);
      }
    };
    window.addEventListener("scroll", queueFooter, { passive: true });
    window.addEventListener("resize", queueFooter, { passive: true });
    checkFooter();
  }

  /* invert the right-rail ticks to white while the blue footer panel sits under
     the rail — the rail is fixed at viewport centre, so watch a centre line */
  var railEl = document.querySelector(".scroll-rail");
  var bluePanel = document.querySelector(".fb-panel");
  if (railEl && bluePanel && "IntersectionObserver" in window) {
    var railIo = new IntersectionObserver(
      function (entries) {
        railEl.classList.toggle("over-footer", entries[0].isIntersecting);
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    railIo.observe(bluePanel);
  }

  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".exp-section[id]")
  );
  if (!sections.length) return;

  /* ── scrollspy: highlight the nav + rail link for the section in view ── */
  var spyLinks = {};
  document
    .querySelectorAll('.scrollspy a[href^="#"], .scroll-rail a[href^="#"]')
    .forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      (spyLinks[id] = spyLinks[id] || []).push(a);
    });

  var setActive = function (id) {
    Object.keys(spyLinks).forEach(function (key) {
      var on = key === id;
      spyLinks[key].forEach(function (a) {
        a.classList.toggle("is-active", on);
        if (a.matches(".site-nav a")) {
          if (on) a.setAttribute("aria-current", "page");
          else a.removeAttribute("aria-current");
        }
      });
    });
  };

  if ("IntersectionObserver" in window) {
    /* pick the section with the most presence around the header line */
    var visible = {};
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
        });
        var best = null;
        var bestRatio = 0;
        sections.forEach(function (s) {
          var r = visible[s.id] || 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = s.id;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ── hatch dividers: draw in left-to-right when they enter view ──────── */
  if ("IntersectionObserver" in window) {
    var dividers = document.querySelectorAll(".section-divider");
    var divIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            divIo.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    dividers.forEach(function (d) {
      divIo.observe(d);
    });
  }

  /* ── parallax: figures drift against the scroll ──────────────────────── */
  var layers = Array.prototype.slice.call(
    document.querySelectorAll(".parallax")
  );
  if (layers.length && !reduceMotion) {
    var ticking = false;
    var vh = window.innerHeight;

    var update = function () {
      ticking = false;
      layers.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        /* distance of element center from viewport center, normalized */
        var center = rect.top + rect.height / 2;
        var frac = (center - vh / 2) / vh; /* -~1 .. +~1 across the screen */
        var depth = parseFloat(el.dataset.depth) || 28; /* px of travel */
        el.style.setProperty("--p", (-frac * depth).toFixed(1) + "px");
      });
    };

    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        vh = window.innerHeight;
        onScroll();
      },
      { passive: true }
    );
    update();
  }
})();
