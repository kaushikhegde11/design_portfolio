# Markdown portfolio views

Human and Machine views are integrated into the main portfolio.

Human / Machine is a native page switch. Machine opens a centered, themed Markdown reading page with a persistent Human return link and a sticky Copy to clipboard button. Each page returns to its corresponding visual page. Raw .md files remain available through alternate links, llms.txt, and the Machine page footer.

The clipboard button copies the exact Markdown text. If clipboard access is unavailable, it attempts the browser copy fallback, then selects the text for manual copy. With JavaScript disabled, both views and mode links remain readable; copy uses normal text selection.

Run `python3 scripts/build-markdown.py` after content updates to refresh the Markdown and Machine pages. Find the Tempo is manually transcribed from find-the-tempo.pdf in design-find-the-tempo.md; update it when the PDF changes. Edit shared navigation styles in css/manual.css, Machine layout in css/machine.css, and copy behavior in js/machine.js.

Only photography includes the hobby/bots/taste note and directs readers to Instagram @artofkaey. The crawler index uses the CNAME domain kaushikhegde.com. The earlier Hairline figures remain on the Human homepage without a continuous whole-object rotation. Anatomy scene assets and generated documents are excluded.
