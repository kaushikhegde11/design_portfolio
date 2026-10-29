/* case-study.js — scroll-spy for the "study-spread" layout (css/case-study.css).
   Reads each .cs-toc-list anchor against its target h2[id] and marks the section
   currently in view with aria-current="true". Pure, dependency-free, defer-safe. */
(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll('.cs-toc-list a'));
  var map = links
    .map(function (a) { return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) }; })
    .filter(function (m) { return m.el; });
  if (!map.length) return;

  function update() {
    var mark = window.scrollY + 140; /* just below the sticky header */
    var current = map[0];
    for (var i = 0; i < map.length; i++) {
      if (map[i].el.getBoundingClientRect().top + window.scrollY <= mark) current = map[i];
    }
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = map[map.length - 1];
    map.forEach(function (m) {
      if (m === current) m.a.setAttribute('aria-current', 'true');
      else m.a.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }
  }

  document.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

/* Wireframe slide: click-and-drag panning and Cmd/Ctrl + wheel zoom for
   .wire-view (native scroll and keyboard already work). */
(function () {
  "use strict";
  var box = document.querySelector('.wire-view');
  if (!box) return;
  var down = false, sx = 0, sy = 0, sl = 0, st = 0;

  box.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true;
    sx = e.clientX; sy = e.clientY; sl = box.scrollLeft; st = box.scrollTop;
    box.classList.add('is-dragging');
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', function (e) {
    if (!down) return;
    box.scrollLeft = sl - (e.clientX - sx);
    box.scrollTop = st - (e.clientY - sy);
  });
  function end(e) {
    if (!down) return;
    down = false;
    box.classList.remove('is-dragging');
    try { box.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  var zoom = 1, MIN = 1, MAX = 4;
  box.addEventListener('wheel', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    var d = Math.max(-50, Math.min(50, e.deltaY));
    var next = Math.max(MIN, Math.min(MAX, zoom * Math.exp(-d * 0.01)));
    if (next === zoom) return;
    var r = box.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    var k = next / zoom;
    var cx = box.scrollLeft + mx, cy = box.scrollTop + my;
    zoom = next;
    box.style.setProperty('--wz', zoom);
    box.scrollLeft = cx * k - mx;
    box.scrollTop = cy * k - my;
  }, { passive: false });
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
})();
