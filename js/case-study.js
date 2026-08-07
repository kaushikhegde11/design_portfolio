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

  function onScroll() {
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

  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
