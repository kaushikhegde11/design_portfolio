# Exploded Views

Landing-page collection: wooden easel with a side-mounted monitor for Design, a detailed camera for Photography, the official Hairline laptop for Projects, and one opening book for About Me. The drawings keep their original Hairline view. Hover or keyboard focus smoothly opens the parts; leaving or pressing Escape closes them. Reduced motion is respected. The Work introduction is centered without a drop cap. The camera has a blue status LED, and the laptop screen carries a dim blue wash.

## Code hierarchy

Each `.exploded-view` is a figure containing a section link (`.exploded-stage`), one drawing host (`.exploded-canvas`), and its caption. All four use the same frame ratio, padding, 400px maximum canvas width, caption spacing, and responsive layout: four columns on wide screens, two on tablets, and one on phones. The drawings retain their natural proportions and have matching rest widths and centres.

- `../../css/exploded-views.css`: shared layout, site theme mapping, and blue strokes on card hover or keyboard focus.
- `../../js/exploded-views.js`: shared theme, keyboard behavior, hidden study read-outs, and cleanup.
- `../../js/exploded-laptop.js`: imports `laptop` from `https://esm.sh/@lucasmarkes/hairline`, mounts it into `#figure`, and adds the subtle screen wash.
- `studio.js`, `camera.js`, `notebook.js`: editable easel, camera, and hinged book geometry. The book opens seven attached leaves at evenly spaced angles. `tablet.js` remains an archived study. `kernel.js` is their unchanged Hairline engine.
- `*.svg`: static fallback drawings, also embedded in the landing page. The laptop snapshot is generated from the official component.
- `hairline-*.html`: standalone study/test pages using Hairline's standard test palette. `laptop.js` is the saved original custom laptop study, retained with its standalone page; the landing page now uses the official component instead.

The portfolio reads its existing `--paper`, `--blueprint`, `--ink-muted` and `--grid-line` tokens. Every line turns blue on card hover or keyboard focus, while the solid faces retain the page's paper color. The portfolio has no part labels on hover or focus; read-outs remain in the standalone Hairline studies. Category copy and page metadata emphasize UI/UX design, graphic design, and design engineering.

Keyboard: focus opens a drawing, left/right explore it, Enter follows its section link, and Escape closes it. Touch retains vertical scrolling and tap navigation. Reduced motion is respected. Serve through a local web server for browser modules; static drawings and navigation also work with JavaScript disabled. The live official laptop requires the supplied esm.sh module to load; its local SVG preview remains if it cannot.

For custom-figure edits, use the installed skill's `look.mjs` and refresh the corresponding SVG after changing geometry. Leave the original engine and test template intact.

Engine and official laptop: [Hairline by Lucas Markes](https://github.com/lucasmarkes/hairline). MIT license included.
