from pathlib import Path
from html.parser import HTMLParser
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]

class Node:
    def __init__(self, tag='', attrs=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), []
    def has(self, cls):
        return cls in self.attrs.get('class', '').split()
    def find(self, predicate):
        if predicate(self):
            return self
        for child in self.children:
            if isinstance(child, Node):
                found = child.find(predicate)
                if found:
                    return found
    def all(self, predicate):
        result = [self] if predicate(self) else []
        for child in self.children:
            if isinstance(child, Node):
                result.extend(child.all(predicate))
        return result

class Parser(HTMLParser):
    void = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in self.void:
            self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.void:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return
    def handle_data(self, text):
        self.stack[-1].children.append(text)

MAPPING = {
    'index.html':'portfolio.md', 'about.html':'about.md', 'projects.html':'projects.md',
    'design.html':'projects.md', 'photography.html':'photography.md',
    'case-study-airbnb.html':'case-study-airbnb.md', 'design-find-the-tempo.html':'design-find-the-tempo.md',
    '404.html':'portfolio.md',
}

def text(node):
    if isinstance(node, str):
        return re.sub(r'\s+', ' ', node)
    if node.tag in {'svg','script','style','canvas'} or node.attrs.get('aria-hidden') == 'true':
        return ''
    return ''.join(text(c) for c in node.children)

def clean(s):
    return re.sub(r'[ \t]+', ' ', s).strip()

def markdown(node):
    if isinstance(node, str):
        return re.sub(r'\s+', ' ', node)
    if node.tag in {'svg','script','style','canvas','nav','aside'} or node.attrs.get('aria-hidden') == 'true':
        return ''
    if any(node.has(c) for c in ['cs-num','svc-hint','svc-swipe-hint','svc-dur','spec-toggle','cs-back','view-switch']):
        return ''
    body = ''.join(markdown(c) for c in node.children)
    if re.fullmatch(r'h[1-6]', node.tag):
        return '\n\n' + '#' * int(node.tag[1]) + ' ' + clean(body) + '\n\n'
    if node.tag == 'a':
        href = node.attrs.get('href', '')
        if href.startswith('#') or not href:
            return clean(body)
        href = MAPPING.get(href, href)
        return '[' + clean(body) + '](' + href + ')'
    if node.tag == 'img':
        return ''
    if node.tag in {'strong','b'}:
        return '**' + clean(body) + '**'
    if node.has('spec-label'):
        return '\n\n### ' + clean(body) + '\n\n'
    if node.tag == 'li' and not node.has('spec-row') or node.has('svc-bul'):
        return '\n- ' + clean(body).replace('\n', '\n  ') + '\n'
    if node.tag in {'p','div','section','article','ul','ol','figure','figcaption'}:
        return '\n\n' + body.strip() + '\n\n'
    if node.tag == 'span':
        return body + ' '
    return body

def tidy(s):
    s = '\n'.join(line.rstrip() for line in s.splitlines())
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip() + '\n'

def load(name):
    return Parser((ROOT/name).read_text()).root

def write(name, content):
    (ROOT/name).write_text(tidy(content))

home = load('index.html')
about = load('about.html').find(lambda n:n.tag=='main')
about_text = markdown(about)
write('about.md', about_text + '\n\n[Visual About Me page](about.html) · [Portfolio](portfolio.md)')

case = load('case-study-airbnb.html').find(lambda n:n.has('cs-content'))
write('case-study-airbnb.md', '# Airbnb: the anxious gap\n\n' + markdown(case) + '\n\n[Visual case study](case-study-airbnb.html) · [Projects](projects.md)')

projects = '''# Projects and case studies

## Find the Tempo

A web app that turns a screenshot of songs into openable streaming links. OCR reads each track and artist, then builds one search link per streaming service.

[Full case study](design-find-the-tempo.md) · [Live app](https://findthetempo.netlify.app) · [Repository](https://github.com/kaushikhegde11/find_the_tempo)

## Airbnb: the anxious gap

A solo case study of the period after booking and before check-in. It examines Search tab persistence and the hierarchy of booked-trip information through a heuristic review and small-sample guerrilla usability sessions.

[Full case study](case-study-airbnb.md)
'''
stack = home.find(lambda n:n.attrs.get('id')=='cs-stack')
for i, child in enumerate(stack.children):
    if isinstance(child, Node) and child.has('cs-bar') and child.attrs.get('data-brand')=='github':
        title = child.find(lambda n:n.has('cs-title'))
        panel = next(n for n in stack.children[i+1:] if isinstance(n,Node) and n.has('cs-panel'))
        projects += '\n\n## ' + clean(text(title)) + '\n\n'
        for paragraph in panel.all(lambda n:n.tag=='p'):
            label = paragraph.find(lambda n:n.has('cs-key'))
            if label:
                label_text = clean(text(label))
                remainder = clean(text(paragraph).replace(text(label),'',1))
                projects += '**' + label_text + ':** ' + remainder + '\n\n'
            else:
                projects += markdown(paragraph)
write('projects.md', projects + '\n\n[Visual projects](projects.html) · [Portfolio](portfolio.md)')

photography = '''# Photography — a hobby

Photography is a personal hobby. Bots can read descriptions, but taste is personal; the photographs are best experienced visually.

For the photography, please check [Instagram @artofkaey](https://www.instagram.com/artofkaey/).

[Visual photography gallery](photography.html) · [Portfolio](portfolio.md)
'''
write('photography.md', photography)

intro = '''# Kaushik Hegde

UI/UX designer and front-end design engineer based in Bengaluru. Open to UI/UX and design-engineering roles.

I work across UI/UX design, graphic design, and front-end development. I bring a mechanical engineering background to interfaces, visual systems, and interactive prototypes.

This is the text version of my portfolio for readers, crawlers, and assistants.
'''
contact = '''## Contact

- [Email](mailto:kaushik.hgd@gmail.com)
- [GitHub](https://github.com/kaushikhegde11)
- [LinkedIn](https://www.linkedin.com/in/kaushik-hegde/)
- [Substack](https://substack.com/@kaeywrites)
- [Download CV](Kaushik-Hegde-CV.pdf)

[Return to the visual portfolio](index.html)
'''
# The overview embeds the full About Me and project descriptions; studies have their own files.
about_embedded = re.sub(r'^(#{1,5}) ', r'#\1 ', about_text, flags=re.M)
project_embedded = re.sub(r'^(#{1,5}) ', r'#\1 ', projects, flags=re.M)
photo_embedded = photography.split('[Visual photography gallery]')[0].replace('# Photography', '## Photography', 1)
write('portfolio.md', intro + '\n' + about_embedded + '\n' + project_embedded + '\n' + photo_embedded + '\n' + contact)

write('llms.txt', '''# Kaushik Hegde

> UI/UX designer and front-end design engineer based in Bengaluru, a mechanical engineer turned designer and open to UI/UX and design-engineering roles. This is the text index of my portfolio.

## Portfolio in Markdown

- [Full portfolio](https://kaushikhegde.com/portfolio.md): About Me, projects, case-study links, and photography as a hobby.
- [About Me](https://kaushikhegde.com/about.md): Experience, skills, tools, interests, and background.
- [Projects](https://kaushikhegde.com/projects.md): Find the Tempo, Airbnb, Strudel skill, Nidhi, Weekly statusline, and Obsidian project memory.
- [Find the Tempo](https://kaushikhegde.com/design-find-the-tempo.md): Full case study transcribed from the portfolio PDF.
- [Airbnb](https://kaushikhegde.com/case-study-airbnb.md): Full text of the existing case study.
- [Photography](https://kaushikhegde.com/photography.md): Hobby; see Instagram @artofkaey for the photographs.
''')

# Generate both representations from the same Markdown, with native return links.
def machine_route(html_name):
    return 'machine.html' if html_name in {'index.html', '404.html'} else 'machine-' + Path(html_name).stem + '.html'

def mode_switch(human, machine, active):
    links = []
    for name, target in [('Human', human), ('Machine', machine)]:
        selected = name.lower() == active
        current = ' aria-current="page"' if selected else ''
        mark = '[X]' if selected else '[ ]'
        links.append('<a href="' + target + '"' + current + '><span aria-hidden="true">' + mark + '</span> ' + name.upper() + '</a>')
    return '<nav class="audience-switch" aria-label="Reading mode">' + ''.join(links) + '</nav>'

for html_name, md_name in MAPPING.items():
    path = ROOT/html_name
    source = path.read_text()
    machine = machine_route(html_name)
    switch = mode_switch(html_name, machine, 'human')
    if 'class="audience-switch"' in source:
        source = re.sub(r'<nav class="audience-switch".*?</nav>', switch, source, count=1, flags=re.S)
    elif 'class="markdown-link"' in source:
        source = re.sub(r'<a class="markdown-link".*?</a>', switch, source, count=1, flags=re.S)
    else:
        raise RuntimeError('Reading mode control not found: ' + html_name)
    source = source.replace('css/manual.css?v=54', 'css/manual.css?v=55')
    path.write_text(source)
    if html_name == '404.html':
        continue
    raw = (ROOT/md_name).read_text()
    title = raw.splitlines()[0].lstrip('# ').strip()
    machine_switch = mode_switch(html_name, machine, 'machine')
    # Share the Human masthead geometry; only the active reading mode changes.
    masthead_match = re.search(r'<div class="wrap masthead">.*?</div>(?=\s*<div class="rule-hatch")', source, re.S)
    if not masthead_match:
        raise RuntimeError('Masthead not found: ' + html_name)
    machine_masthead = re.sub(r'<nav class="audience-switch".*?</nav>', machine_switch, masthead_match.group(0), count=1, flags=re.S)
    page = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script>try{{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(title)} — Machine view | Kaushik Hegde</title>
  <meta name="description" content="Read and copy the Markdown version of Kaushik Hegde’s portfolio.">
  <link rel="canonical" href="https://kaushikhegde.com/{html_name}">
  <link rel="alternate" type="text/markdown" title="Markdown version" href="{md_name}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Silkscreen&amp;display=swap">
  <link rel="stylesheet" href="css/manual.css?v=55">
  <link rel="stylesheet" href="css/machine.css?v=2">
  <script src="js/main.js?v=21" defer></script>
  <script src="js/machine.js?v=1" defer></script>
</head>
<body class="machine-view">
  <!-- THESIS: A readable Markdown representation with an obvious route back to Human.
       OWN-WORLD: Existing blue ink, paper, light/dark tokens and Drafting Mono.
       STORY: Switch, read the same portfolio text, copy it, return to its visual page.
       FIRST VIEWPORT: Sticky wordmark and mode switch; centered copy bar and text column.
       FORM: The supplied Human/Machine reference, adapted to the established portfolio. -->
  <a class="skip-link" href="#main">Skip to Markdown</a>
  <header class="site-header machine-header">
    {machine_masthead}
    <div class="rule-hatch" aria-hidden="true"></div>
  </header>
  <main id="main" class="machine-reader">
    <div class="machine-toolbar">
      <button class="copy-markdown" type="button" hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
        <span data-copy-label>Copy to clipboard</span>
      </button>
      <p class="copy-status" role="status" aria-live="polite"></p>
    </div>
    <pre id="markdown-content" tabindex="0" aria-label="{escape(title, quote=True)} in Markdown">{escape(raw)}</pre>
    <p class="machine-source"><a href="{md_name}" type="text/markdown">Open raw Markdown ↗</a></p>
  </main>
</body>
</html>
'''
    (ROOT/machine).write_text(page)

(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: https://kaushikhegde.com/sitemap.xml\n')
urls = [''] + [n for n in MAPPING if n not in {'index.html','404.html'}] + sorted(set(MAPPING.values())) + [machine_route(n) for n in MAPPING if n != '404.html']
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>https://kaushikhegde.com/'+url+'</loc></url>\n' for url in urls) + '</urlset>\n')
print('Generated Markdown and styled Machine views with Human/Machine navigation.')
