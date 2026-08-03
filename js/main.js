/* main.js — progressive enhancement only.
   Menu overlay, lightbox, design filters, reading progress, scroll reveals,
   sticky-header compression. The site reads fine with all of this disabled. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── sticky header compression ─────────────────────────────────────── */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── mobile menu overlay with focus trap ───────────────────────────── */
  var menuBtn = document.querySelector(".menu-btn");
  var overlay = document.getElementById("nav-overlay");
  if (menuBtn && overlay) {
    var closeBtn = overlay.querySelector(".close-btn");
    var lastFocused = null;

    var focusables = function () {
      return overlay.querySelectorAll("a[href], button:not([disabled])");
    };

    var openMenu = function () {
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    var closeMenu = function () {
      overlay.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    menuBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);

    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      var items = focusables();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ── photography lightbox ──────────────────────────────────────────── */
  var lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    var frames = Array.prototype.slice.call(
      document.querySelectorAll(".contact-sheet figure")
    );
    var stage = lightbox.querySelector(".lb-stage");
    var caption = lightbox.querySelector(".lb-caption");
    var current = 0;

    var show = function (i) {
      current = (i + frames.length) % frames.length;
      var fig = frames[current];
      stage.innerHTML = "";
      stage.appendChild(fig.querySelector("svg").cloneNode(true));
      caption.innerHTML = fig.querySelector("figcaption").innerHTML;
    };

    frames.forEach(function (fig, i) {
      var btn = fig.querySelector(".frame-btn");
      if (!btn) return;
      btn.addEventListener("click", function () {
        show(i);
        lightbox.showModal();
      });
    });

    lightbox.querySelector(".lb-prev").addEventListener("click", function () {
      show(current - 1);
    });
    lightbox.querySelector(".lb-next").addEventListener("click", function () {
      show(current + 1);
    });
    lightbox.querySelector(".lb-close").addEventListener("click", function () {
      lightbox.close();
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      /* Escape closes natively via <dialog> */
    });
  }

  /* ── design page filter bar (updates URL hash) ─────────────────────── */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll("button[data-filter]");
    var plates = document.querySelectorAll(".plate[data-cat]");

    var applyFilter = function (name) {
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.filter === name));
      });
      plates.forEach(function (p) {
        p.classList.toggle(
          "is-hidden",
          name !== "all" && p.dataset.cat !== name
        );
      });
      if (name === "all") {
        history.replaceState(null, "", location.pathname);
      } else {
        history.replaceState(null, "", "#" + name);
      }
    };

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        applyFilter(b.dataset.filter);
      });
    });

    var initial = location.hash.replace("#", "");
    applyFilter(
      Array.prototype.some.call(buttons, function (b) {
        return b.dataset.filter === initial;
      })
        ? initial
        : "all"
    );
  }

  /* ── back-to-top: appears once the header is well out of view ──────── */
  var backTop = document.querySelector(".back-top");
  if (backTop) {
    var onBackTop = function () {
      backTop.classList.toggle("is-visible", window.scrollY > 480);
    };
    window.addEventListener("scroll", onBackTop, { passive: true });
    onBackTop();
    backTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ── grid / list view toggles ──────────────────────────────────────── */
  document.querySelectorAll(".view-bar").forEach(function (bar) {
    var target = document.querySelector(bar.dataset.target);
    if (!target) return;
    var btns = bar.querySelectorAll("button[data-view]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        target.classList.toggle("view-list", b.dataset.view === "list");
        target.classList.toggle("view-grid", b.dataset.view === "grid" && target.classList.contains("study-index"));
      });
    });
  });

  /* ── reading-progress hairline (case-study detail) ─────────────────── */
  var progress = document.getElementById("progress");
  if (progress) {
    var onProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0";
    };
    window.addEventListener("scroll", onProgress, { passive: true });
    onProgress();
  }

  /* ── scroll reveals: 12px rise + fade, IntersectionObserver ────────── */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("[data-reveal]");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    targets.forEach(function (t) {
      t.classList.add("reveal");
      io.observe(t);
    });
  }

  /* ── hero assembly: run the one orchestrated moment on load ────────── */
  var explodeHero = document.querySelector(".explode[data-animate]");
  if (explodeHero && !reduceMotion) {
    explodeHero.classList.add("animate");
    var calloutHost = document.querySelector(".explode-callouts");
    if (calloutHost) calloutHost.classList.add("animate");
  }

  /* ── nav: one blue pill that slides in X to the active link, kept in
        sync with the scrollspy (which sets aria-current on scroll) ──── */
  var navList = document.querySelector(".site-nav ul");
  if (navList) {
    var indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navList.appendChild(indicator);

    var moveIndicator = function () {
      var active = navList.querySelector('a[aria-current="page"]');
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.opacity = "1";
      /* 9px each side so the [ ] brackets flank the text, not overlap it */
      var pad = 9;
      indicator.style.width = active.offsetWidth + pad * 2 + "px";
      indicator.style.height = active.offsetHeight + "px";
      indicator.style.transform =
        "translate(" + (active.offsetLeft - pad) + "px," + active.offsetTop + "px)";
    };

    moveIndicator();
    /* enable the slide only after first placement so it does not fly in */
    requestAnimationFrame(function () {
      indicator.classList.add("is-ready");
    });

    var navObserver = new MutationObserver(moveIndicator);
    navObserver.observe(navList, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
    window.addEventListener("resize", moveIndicator);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(moveIndicator);
    }
  }

  /* ── about spec stack: tap to expand a part (hover handles it on
        pointer devices via CSS) ─────────────────────────────────────── */
  document.querySelectorAll(".spec-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var row = head.closest(".spec-row");
      var open = row.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
    });
  });
})();
