/* Progressive enhancement for the static Markdown reading surface. */
(function () {
  "use strict";
  var header = document.querySelector(".machine-header");
  var button = document.querySelector(".copy-markdown");
  var content = document.getElementById("markdown-content");
  var label = document.querySelector("[data-copy-label]");
  var status = document.querySelector(".copy-status");
  if (!button || !content) return;

  function syncHeaderHeight() {
    document.documentElement.style.setProperty("--machine-header-height", header.getBoundingClientRect().height + "px");
  }
  syncHeaderHeight();
  if (window.ResizeObserver) new ResizeObserver(syncHeaderHeight).observe(header);
  else window.addEventListener("resize", syncHeaderHeight);
  button.hidden = false;
  var resetTimer;

  function legacyCopy(value) {
    var field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;inset:0;opacity:0;pointer-events:none";
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand("copy");
    } finally {
      field.remove();
      button.focus({ preventScroll: true });
    }
  }

  button.addEventListener("click", async function () {
    clearTimeout(resetTimer);
    button.disabled = true;
    status.textContent = "";
    var copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(content.textContent);
          copied = true;
        } catch (error) { /* Try the browser's selection-based copy below. */ }
      }
      if (!copied) copied = legacyCopy(content.textContent);
    } catch (error) { copied = false; }
    button.disabled = false;
    if (copied) {
      label.textContent = "Copied to clipboard";
      status.textContent = "Markdown copied.";
      resetTimer = setTimeout(function () {
        label.textContent = "Copy to clipboard";
        status.textContent = "";
      }, 2400);
    } else {
      content.focus({ preventScroll: true });
      var range = document.createRange();
      range.selectNodeContents(content);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      label.textContent = "Copy to clipboard";
      status.textContent = "Text selected. Press " + (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘C" : "Ctrl+C") + " to copy.";
    }
  });
})();
