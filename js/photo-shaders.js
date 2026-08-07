/* photo-shaders.js — Paper Shaders ordered-dither over each contact-sheet plate.
   Vanilla ESM (no bundler). Live WebGL. Resting state = dither; hover reveals
   the original photo (CSS). A tuning panel is injected on localhost only. */

import {
  ShaderMount,
  imageDitheringFragmentShader,
  getShaderColorFromString,
  DitheringTypes,
  ShaderFitOptions,
} from "https://esm.sh/@paper-design/shaders@0.0.78";

/* ── default look (from the reference ImageDithering props) ─────────────── */
var config = {
  colorBack: "#0037ff",
  colorFront: "#ffffff",
  colorHighlight: "#e3ff42",
  originalColors: false,
  inverted: false,
  type: "8x8",       // key of DitheringTypes
  size: 1.6,         // -> u_pxSize
  colorSteps: 3,
  scale: 1,          // 1 = image fills the plate; <1 leaves colorBack margins
  fit: "cover",      // key of ShaderFitOptions
};

var mounts = []; // { shader: ShaderMount, img: HTMLImageElement }

function uniformsFromConfig() {
  return {
    u_colorBack: getShaderColorFromString(config.colorBack),
    u_colorFront: getShaderColorFromString(config.colorFront),
    u_colorHighlight: getShaderColorFromString(config.colorHighlight),
    u_originalColors: config.originalColors,
    u_inverted: config.inverted,
    u_type: DitheringTypes[config.type],
    u_pxSize: config.size,
    u_colorSteps: config.colorSteps,
    u_scale: config.scale,
    u_fit: ShaderFitOptions[config.fit],
  };
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () { resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

function mountAll() {
  var plates = document.querySelectorAll(".contact-sheet .plate");
  plates.forEach(function (plate) {
    var host = plate.querySelector(".plate-shader");
    var src = plate.getAttribute("data-src");
    if (!host || !src) return;

    loadImage(src).then(function (img) {
      var uniforms = uniformsFromConfig();
      uniforms.u_image = img;
      // ShaderMount(parentElement, fragmentShader, uniforms, ctxAttrs, speed, frame)
      var shader = new ShaderMount(
        host,
        imageDitheringFragmentShader,
        uniforms,
        undefined,
        0 /* static — no animation */
      );
      mounts.push({ shader: shader, img: img });
    }).catch(function () {
      // if the shader fails, the original <img> hover layer still shows the photo
    });
  });
}

function applyConfig() {
  var u = uniformsFromConfig();
  mounts.forEach(function (m) { m.shader.setUniforms(u); });
}

/* ── localhost tuning panel ─────────────────────────────────────────────── */
function isLocal() {
  var h = location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "" || h === "0.0.0.0";
}

function buildPanel() {
  var css = document.createElement("style");
  css.textContent = [
    ".shader-tuner{position:fixed;right:16px;bottom:16px;z-index:9999;width:280px;",
    "font:12px/1.4 'JetBrains Mono',ui-monospace,monospace;color:#15171C;",
    "background:#FAFAF8;border:1.5px solid #2B4CFF;box-shadow:0 8px 30px rgba(0,0,0,.18)}",
    ".shader-tuner header{display:flex;justify-content:space-between;align-items:center;",
    "padding:8px 10px;background:#2B4CFF;color:#fff;letter-spacing:.08em;text-transform:uppercase;font-size:11px}",
    ".shader-tuner header button{all:unset;cursor:pointer;font-weight:700}",
    ".shader-tuner .body{padding:10px;display:grid;gap:8px;max-height:70vh;overflow:auto}",
    ".shader-tuner label{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}",
    ".shader-tuner label span.val{color:#5C6070}",
    ".shader-tuner input[type=range]{width:100%}",
    ".shader-tuner select,.shader-tuner input[type=color]{width:100%}",
    ".shader-tuner .row2{grid-template-columns:1fr 1fr}",
    ".shader-tuner textarea{width:100%;height:150px;font:11px/1.4 monospace;",
    "border:1px solid #DFE4F7;background:#fff;color:#15171C;resize:vertical}",
    ".shader-tuner .copy{all:unset;cursor:pointer;text-align:center;padding:6px;",
    "background:#2B4CFF;color:#fff;letter-spacing:.06em;text-transform:uppercase;font-size:11px}",
    ".shader-tuner.collapsed .body{display:none}",
  ].join("");
  document.head.appendChild(css);

  var wrap = document.createElement("div");
  wrap.className = "shader-tuner";

  var typeOpts = Object.keys(DitheringTypes)
    .map(function (k) { return '<option value="' + k + '"' + (k === config.type ? " selected" : "") + ">" + k + "</option>"; })
    .join("");
  var fitOpts = Object.keys(ShaderFitOptions)
    .map(function (k) { return '<option value="' + k + '"' + (k === config.fit ? " selected" : "") + ">" + k + "</option>"; })
    .join("");

  wrap.innerHTML = [
    "<header><span>Dither tuner · localhost</span><button data-act='toggle'>–</button></header>",
    "<div class='body'>",
    "<label>Back <input type='color' data-k='colorBack' value='" + config.colorBack + "'></label>",
    "<label>Front <input type='color' data-k='colorFront' value='" + config.colorFront + "'></label>",
    "<label>Highlight <input type='color' data-k='colorHighlight' value='" + config.colorHighlight + "'></label>",
    "<label>Type <select data-k='type'>" + typeOpts + "</select></label>",
    "<label>Fit <select data-k='fit'>" + fitOpts + "</select></label>",
    "<label>Size <span class='val' data-v='size'>" + config.size + "</span></label>",
    "<input type='range' data-k='size' min='0.5' max='6' step='0.1' value='" + config.size + "'>",
    "<label>Color steps <span class='val' data-v='colorSteps'>" + config.colorSteps + "</span></label>",
    "<input type='range' data-k='colorSteps' min='1' max='10' step='1' value='" + config.colorSteps + "'>",
    "<label>Scale <span class='val' data-v='scale'>" + config.scale + "</span></label>",
    "<input type='range' data-k='scale' min='0.1' max='3' step='0.01' value='" + config.scale + "'>",
    "<div class='row2' style='display:grid;gap:8px'>",
    "<label>Orig colors <input type='checkbox' data-k='originalColors'" + (config.originalColors ? " checked" : "") + "></label>",
    "<label>Inverted <input type='checkbox' data-k='inverted'" + (config.inverted ? " checked" : "") + "></label>",
    "</div>",
    "<button class='copy' data-act='copy'>Copy config</button>",
    "<textarea data-out readonly></textarea>",
    "</div>",
  ].join("");
  document.body.appendChild(wrap);

  var out = wrap.querySelector("[data-out]");
  function refreshOut() {
    out.value = [
      "<ImageDithering",
      '  colorBack="' + config.colorBack + '"',
      '  colorFront="' + config.colorFront + '"',
      '  colorHighlight="' + config.colorHighlight + '"',
      "  originalColors={" + config.originalColors + "}",
      "  inverted={" + config.inverted + "}",
      '  type="' + config.type + '"',
      "  size={" + config.size + "}",
      "  colorSteps={" + config.colorSteps + "}",
      "  scale={" + config.scale + "}",
      '  fit="' + config.fit + '"',
      "/>",
    ].join("\n");
  }
  refreshOut();

  wrap.addEventListener("input", function (e) {
    var el = e.target;
    var k = el.getAttribute("data-k");
    if (!k) return;
    if (el.type === "checkbox") config[k] = el.checked;
    else if (el.type === "range") config[k] = parseFloat(el.value);
    else config[k] = el.value;
    var v = wrap.querySelector("[data-v='" + k + "']");
    if (v) v.textContent = config[k];
    applyConfig();
    refreshOut();
  });

  wrap.addEventListener("click", function (e) {
    var act = e.target.getAttribute && e.target.getAttribute("data-act");
    if (act === "toggle") {
      wrap.classList.toggle("collapsed");
      e.target.textContent = wrap.classList.contains("collapsed") ? "+" : "–";
    }
    if (act === "copy") {
      navigator.clipboard && navigator.clipboard.writeText(out.value);
      e.target.textContent = "Copied ✓";
      setTimeout(function () { e.target.textContent = "Copy config"; }, 1200);
    }
  });
}

/* Force a repaint once layout has settled. The shaders mount static (speed 0)
   and, inside the one-scroll filmstrip, the strip/pin layout can resize the
   host after the single render — re-applying uniforms triggers a fresh draw. */
function repaint() {
  var u = uniformsFromConfig();
  mounts.forEach(function (m) { m.shader.setUniforms(u); });
}

function init() {
  mountAll();
  if (isLocal()) buildPanel();
  requestAnimationFrame(repaint);
  window.addEventListener("load", function () { setTimeout(repaint, 0); });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
