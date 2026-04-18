---
version: 1
name: learn-anything
description: Turn any material into interactive learning slides — codebases, documents, PDFs, earnings reports, research papers, articles, textbooks, URLs. Produces a self-contained HTML slide deck you can navigate like PowerPoint. Triggers include "learn this", "explain this", "teach me", "turn this into slides", "make this understandable", "help me learn", "break this down", "study guide".
---

# Learn Anything

Turn any material into a navigable slide deck. Codebases, PDFs, research papers, earnings reports, articles, URLs — anything.

**How it works:** Read the material, identify 5-10 core concepts, then generate a self-contained HTML slide deck. Each slide teaches one concept. The output is a single HTML file — grid of cards, click to expand into full-screen slides, arrow keys to navigate. Like PowerPoint but in the browser.


**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## Pipeline

```
Phase 1 → Read the material
Phase 2 → Identify 5-10 concepts
Phase 3 → Map relationships between concepts
Phase 4 → Order slides (foundational → advanced)
Phase 5 → Write each slide
Phase 6 → Generate HTML slide deck
```

---

### Phase 1: Gather Knowledge

Go deep. Use every tool at your disposal to understand the material thoroughly before building slides.

| Input | Strategy |
|-------|----------|
| GitHub URL | Clone, read source files — focus on entry points, core modules, README, docs/. Skip tests, node_modules, dist. |
| Local directory | Glob + Read. Same focus. |
| PDF / document | Read tool. Read the whole thing. |
| URL / webpage | WebFetch to get the content. |
| Topic / question | **Use web search and deep research.** Search for authoritative sources, read multiple pages, cross-reference. Gather enough context to teach it well. |
| Pasted text | Already have it. |
| Office docs | Use relevant skill (docx, xlsx, pptx) to extract text. |

**Go beyond the obvious.** If the user gives you a repo, also read the README, CHANGELOG, and docs/ folder. If they give you a topic, search the web for multiple perspectives. If they give you an earnings report, look up the company context. The more you know, the better your slides will be.

**Use other skills when helpful:**
- `deep-research` or `internet-search` — for gathering background on a topic
- `data-scraper` or `super-extract` — for pulling structured data from websites
- `pdf` — for extracting content from PDF files

**Output:** You've read and understood the material deeply enough to teach it.

---

### Phase 2: Identify 5-10 Concepts

Think like a teacher. What are the 5-10 things someone needs to learn to understand this material? Each concept should be:

- A concise **name** (slide title)
- A **one-line description** (shown on the card in grid view)
- A **color** (unique hex color for the accent bar, e.g., `#f59e42`)

Pick concepts that build on each other. Start with foundations, end with details.

---

### Phase 3: Map Relationships

For each pair of related concepts, note how they connect (e.g., "uses", "depends on", "extends"). Write a 1-2 sentence summary of the whole topic.

---

### Phase 4: Order Slides

Order the concepts so each slide only references things already covered. Foundational first, advanced last.

---

### Phase 5: Write Each Slide

Each slide is one concept. Write the HTML content for each slide.

**Slide structure:**
1. **Title** — `<h2>` with colored left border
2. **Hook** — 1-2 sentences: why does this matter?
3. **Explanation** — short paragraphs, bullet points, bold key terms. Keep it concise — these are slides, not articles.
4. **Visuals** — use whatever fits best from the Visual Toolkit (see below). Not every slide needs a visual, but most should have one.
5. **Code/evidence** — if applicable, code blocks under 10 lines, data points, quotes
6. **Key takeaway** — 1 bold sentence summarizing the slide

**Tone:** Patient teacher at a whiteboard. "Think of it like..." not "It should be noted that..."

---

### Phase 6: Generate HTML Slide Deck

Assemble into a single self-contained HTML file using the Slide Frame Template below.

Each concept becomes one card in the `cards` array:
```javascript
{ title: "Concept Name", color: "#f59e42", desc: "One-line description", content: `<h2>...</h2><p>...</p>` }
```

---

## Visual Toolkit

When a slide benefits from a visual, pick from these options. All are embedded inline — no external dependencies.

### Mermaid Diagrams
For flowcharts, sequence diagrams, entity relationships. Embed via `<div class="mermaid">` with Mermaid CDN loaded.
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<div class="mermaid">
flowchart TD
  A["User Input"] --> B["LLM Call"]
  B --> C["Tool Execution"]
  C --> D["Response"]
</div>
```
**Best for:** architecture flows, process steps, state machines, entity relationships.

### ASCII Diagrams
For simple flows and structures. Zero dependencies — just `<pre>` blocks.
```html
<pre style="text-align:center;color:var(--text-muted);font-size:13px;">
  [Input] → [Process] → [Output]
     ↓                      ↑
  [Validate] ─────────── [Store]
</pre>
```
**Best for:** quick flows, lightweight diagrams, when Mermaid is overkill.

### Comparison Tables
For side-by-side comparisons. Just HTML tables.
```html
<table><thead><tr><th>Feature</th><th>Option A</th><th>Option B</th></tr></thead>
<tbody><tr><td>Speed</td><td>Fast</td><td>Slow</td></tr></tbody></table>
```
**Best for:** feature comparisons, before/after, pros/cons.

### Inline SVG
For custom visuals, icons, simple illustrations. Draw directly in HTML.
```html
<svg viewBox="0 0 200 100" style="width:100%;max-width:400px;">
  <rect x="10" y="10" width="80" height="40" rx="8" fill="#f59e42" opacity="0.3"/>
  <text x="50" y="35" text-anchor="middle" fill="var(--text)" font-size="12">Box A</text>
</svg>
```
**Best for:** custom diagrams, labeled architecture drawings, simple illustrations.

### p5.js Animations
For interactive visualizations and animations. Load p5 from CDN, embed a sketch in an iframe or inline.
```html
<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"></script>
<div id="sketch-N"></div>
<script>
new p5(function(p) {
  p.setup = function() { p.createCanvas(400, 200).parent('sketch-N'); };
  p.draw = function() {
    p.background(p.color(18, 20, 32));
    // animation logic here
  };
}, 'sketch-N');
</script>
```
**Best for:** physics simulations, data flow animations, interactive demos. Use sparingly — adds weight.

### D3.js Charts
For data visualization — bar charts, line charts, treemaps, force-directed graphs.
```html
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<div id="chart-N"></div>
<script>
// D3 chart code here
</script>
```
**Best for:** quantitative data, metrics, trends, distributions. Use when the material has numbers.

### Code Blocks with Syntax Highlighting
For source code. Use inline `<span>` classes for coloring.
```html
<pre><code><span class="kw">function</span> <span class="fn">hello</span>() {
  <span class="kw">return</span> <span class="str">"world"</span>;
}</code></pre>
```
Syntax classes: `.kw` (keywords), `.fn` (functions), `.str` (strings), `.cmt` (comments), `.type` (types), `.num` (numbers).

---

## Slide Frame Template

The output HTML file. A grid of concept cards that expand into full-viewport slides with spring-physics animations.

**Features:**
- Responsive grid (columns auto-calculated from window width, min card width 260px)
- Click card → full-screen slide with spring animation
- Arrow keys, nav dots, close button for navigation
- Light/dark theme toggle with localStorage persistence
- Slide counter and keyboard hints

**How to populate:** Replace the `cards` array with your generated content. Each card has `title`, `color`, `desc`, `content` (full slide HTML).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}}</title>
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: rgb(1, 5, 19);
  --card-bg: rgb(34, 36, 53);
  --card-border: rgba(255,255,255,0.06);
  --text: #e8e6e3;
  --text-muted: #9ca3af;
  --text-heading: #ffffff;
  --code-bg: rgb(18, 20, 32);
  --code-border: rgba(255,255,255,0.08);
  --inline-code-bg: rgba(255,255,255,0.08);
  --titlebar-bg: rgba(1, 5, 19, 0.85);
  --dot-inactive: rgba(255,255,255,0.25);
  --dot-active: #ffffff;
  --scrollbar-thumb: rgba(255,255,255,0.15);
  --noise-opacity: 0.03;
}
html.light {
  --bg: #f5f2ed;
  --card-bg: #ffffff;
  --card-border: rgba(0,0,0,0.08);
  --text: #4a3728;
  --text-muted: #8b7355;
  --text-heading: #2c1810;
  --code-bg: #f8f5f0;
  --code-border: rgba(0,0,0,0.08);
  --inline-code-bg: rgba(0,0,0,0.06);
  --titlebar-bg: rgba(245, 242, 237, 0.85);
  --dot-inactive: rgba(0,0,0,0.2);
  --dot-active: #4a3728;
  --scrollbar-thumb: rgba(0,0,0,0.15);
  --noise-opacity: 0.02;
}

html, body { width:100%; height:100%; overflow:hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
  background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s;
}
body::before { content:''; position:fixed; inset:0; opacity:var(--noise-opacity); pointer-events:none; z-index:9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px; }

/* Titlebar */
.titlebar { position:fixed; top:0; left:0; right:0; height:56px; display:flex; align-items:center; justify-content:space-between;
  padding:0 24px; background:var(--titlebar-bg); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  z-index:100; border-bottom:1px solid var(--card-border); transition:background 0.3s, border-color 0.3s; }
.titlebar.hidden-bar { opacity:0; pointer-events:none; transition:opacity 0.3s; }
.titlebar-title { font-size:15px; font-weight:700; color:var(--text-heading); }
.titlebar-title span { color:var(--text-muted); font-weight:400; margin-left:8px; }
.theme-toggle { width:36px; height:36px; border-radius:10px; border:1px solid var(--card-border); background:var(--card-bg);
  color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:all 0.3s; }
.theme-toggle:hover { border-color:var(--text-muted); }

/* Canvas & Cards */
#canvas { position:fixed; inset:0; overflow:hidden; }
.card { position:absolute; border-radius:16px; overflow:hidden; cursor:pointer; border:1px solid var(--card-border);
  background:var(--card-bg); transition:background 0.3s, border-color 0.3s; display:flex; flex-direction:column; will-change:transform; }
.card.focused { cursor:default; border-radius:0; border-color:transparent; z-index:50; }
.card:not(.focused):hover { border-color:rgba(255,255,255,0.15); }
html.light .card:not(.focused):hover { border-color:rgba(0,0,0,0.15); }

/* Card grid content */
.card-grid-content { display:flex; flex-direction:column; height:100%; pointer-events:none; }
.card-accent { height:4px; flex-shrink:0; }
.card-body { padding:24px; flex:1; display:flex; flex-direction:column; gap:10px; }
.card-title { font-size:18px; font-weight:700; color:var(--text-heading); letter-spacing:-0.01em; }
.card-desc { font-size:14px; line-height:1.55; color:var(--text-muted); }
.card-index { margin-top:auto; font-size:12px; font-weight:600; color:var(--text-muted); opacity:0.5; font-variant-numeric:tabular-nums; }

/* Slide content */
.card-slide-content { display:none; width:100%; height:100%; overflow-y:auto; overflow-x:hidden; background:var(--bg); transition:background 0.3s; }
.card.focused .card-grid-content { display:none; }
.card.focused .card-slide-content { display:block; }

.slide-inner { max-width:960px; margin:0 auto; padding:80px 48px 120px; }
@media (max-width:640px) { .slide-inner { padding:64px 24px 100px; } }
.slide-inner h2 { font-size:28px; font-weight:800; color:var(--text-heading); margin-bottom:28px; padding-left:16px; line-height:1.3; letter-spacing:-0.02em; }
.slide-inner h3 { font-size:20px; font-weight:700; color:var(--text-heading); margin:28px 0 12px; }
.slide-inner p { font-size:16px; line-height:1.7; margin-bottom:20px; }
.slide-inner strong { color:var(--text-heading); font-weight:600; }
.slide-inner code { font-family:'SF Mono','Fira Code','JetBrains Mono',monospace; font-size:0.88em; background:var(--inline-code-bg); padding:2px 7px; border-radius:5px; }
.slide-inner pre { background:var(--code-bg); border:1px solid var(--code-border); border-radius:12px; padding:20px 24px; margin:20px 0 28px;
  overflow-x:auto; font-family:'SF Mono','Fira Code','JetBrains Mono',monospace; font-size:13.5px; line-height:1.65; color:var(--text); transition:all 0.3s; }
.slide-inner pre code { background:none; padding:0; border-radius:0; font-size:inherit; }
.slide-inner ul, .slide-inner ol { margin:12px 0 20px 20px; font-size:16px; line-height:1.7; }
.slide-inner li { margin:6px 0; }
.slide-inner table { width:100%; border-collapse:collapse; margin:20px 0 28px; font-size:15px; }
.slide-inner th, .slide-inner td { padding:10px 16px; text-align:left; border-bottom:1px solid var(--card-border); }
.slide-inner th { font-weight:600; color:var(--text-heading); background:var(--code-bg); }
.slide-inner blockquote { border-left:3px solid var(--text-muted); padding:12px 16px; margin:16px 0; color:var(--text-muted); font-style:italic; }

.kw { color:#f472b6; } .fn { color:#a78bfa; } .str { color:#60a5fa; } .cmt { color:#6b7280; font-style:italic; } .type { color:#34d399; } .num { color:#f59e42; }
html.light .kw { color:#be185d; } html.light .fn { color:#7c3aed; } html.light .str { color:#2563eb; } html.light .cmt { color:#9ca3af; } html.light .type { color:#059669; } html.light .num { color:#d97706; }

/* Slide nav */
.slide-close { position:fixed; top:16px; right:24px; width:40px; height:40px; border-radius:12px; border:1px solid var(--card-border);
  background:var(--card-bg); color:var(--text); cursor:pointer; display:none; align-items:center; justify-content:center; font-size:18px; z-index:200; transition:all 0.3s; }
.slide-close:hover { border-color:var(--text-muted); }
.slide-close.visible { display:flex; }
.slide-counter { position:fixed; top:20px; left:24px; font-size:13px; font-weight:600; color:var(--text-muted); z-index:200; display:none; font-variant-numeric:tabular-nums; }
.slide-counter.visible { display:block; }
.nav-dots { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); display:none; gap:10px; z-index:200;
  padding:8px 16px; border-radius:20px; background:var(--card-bg); border:1px solid var(--card-border); transition:all 0.3s; }
.nav-dots.visible { display:flex; }
.nav-dot { width:8px; height:8px; border-radius:50%; background:var(--dot-inactive); cursor:pointer; transition:all 0.25s; }
.nav-dot.active { background:var(--dot-active); transform:scale(1.35); }
.nav-dot:hover:not(.active) { background:var(--text-muted); }
.slide-nav { position:fixed; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:12px; border:1px solid var(--card-border);
  background:var(--card-bg); color:var(--text); cursor:pointer; display:none; align-items:center; justify-content:center; font-size:18px; z-index:200; transition:all 0.3s; }
.slide-nav:hover { border-color:var(--text-muted); }
.slide-nav.visible { display:flex; }
.slide-nav.prev { left:20px; }
.slide-nav.next { right:20px; }
.kbd-hint { position:fixed; bottom:68px; left:50%; transform:translateX(-50%); font-size:11px; color:var(--text-muted); opacity:0.5;
  z-index:200; display:none; white-space:nowrap; }
.kbd-hint.visible { display:block; }
.kbd-hint kbd { display:inline-block; padding:1px 6px; border-radius:4px; border:1px solid var(--card-border); background:var(--card-bg); font-family:inherit; font-size:11px; margin:0 2px; }
.card-slide-content::-webkit-scrollbar { width:6px; }
.card-slide-content::-webkit-scrollbar-track { background:transparent; }
.card-slide-content::-webkit-scrollbar-thumb { background:var(--scrollbar-thumb); border-radius:3px; }
</style>
</head>
<body>

<div class="titlebar" id="titlebar">
  <div class="titlebar-title">{{TITLE}}<span>{{SUBTITLE}}</span></div>
  <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">&#9790;</button>
</div>

<div id="canvas"></div>

<div class="slide-counter" id="slideCounter"></div>
<button class="slide-close" id="slideClose" aria-label="Close">&#10005;</button>
<button class="slide-nav prev" id="navPrev" aria-label="Previous">&#8592;</button>
<button class="slide-nav next" id="navNext" aria-label="Next">&#8594;</button>
<div class="nav-dots" id="navDots"></div>
<div class="kbd-hint" id="kbdHint"><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> navigate · <kbd>Esc</kbd> close</div>

<script>
// ── Spring Physics (from chenglou.me) ──
const msPerAnimationStep = 4;
function spring(pos, v=0, k=290, b=30) { return {pos, dest:pos, v, k, b}; }
function springStep(c) {
  const t = msPerAnimationStep/1000, F=-c.k*(c.pos-c.dest)-c.b*c.v;
  c.pos += (c.v + F*t)*t; c.v += F*t;
}
function springGoToEnd(c) { c.pos=c.dest; c.v=0; }
function springAtRest(c) { return Math.abs(c.pos-c.dest)<0.4 && Math.abs(c.v)<0.4; }

// ── Card Data — REPLACE THIS ──
const cards = [
  // { title: "...", color: "#hex", desc: "...", content: `<h2 style="border-left:4px solid #hex">...</h2><p>...</p>` },
];

// ── State ──
let focusedIndex = -1, animating = false, lastFrame = 0, accTime = 0;
const cardEls = [], cardSprings = [];

// ── Build DOM ──
const canvas = document.getElementById('canvas');
const navDots = document.getElementById('navDots');
const slideClose = document.getElementById('slideClose');
const slideCounter = document.getElementById('slideCounter');
const navPrev = document.getElementById('navPrev');
const navNext = document.getElementById('navNext');
const kbdHint = document.getElementById('kbdHint');
const titlebar = document.getElementById('titlebar');

cards.forEach((card, i) => {
  const el = document.createElement('div'); el.className = 'card'; el.dataset.index = i;
  el.innerHTML = `
    <div class="card-grid-content"><div class="card-accent" style="background:${card.color}"></div>
      <div class="card-body"><div class="card-title">${card.title}</div><div class="card-desc">${card.desc}</div>
        <div class="card-index">${String(i+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}</div></div></div>
    <div class="card-slide-content"><div class="slide-inner">${card.content}</div></div>`;
  el.addEventListener('click', () => { if (focusedIndex===-1) focusCard(i); });
  canvas.appendChild(el); cardEls.push(el);
  cardSprings.push({ x:spring(0), y:spring(0), sizeX:spring(100), sizeY:spring(100), opacity:spring(1) });
  const dot = document.createElement('div'); dot.className = 'nav-dot';
  dot.addEventListener('click', () => { if (focusedIndex!==-1) focusCard(i); });
  navDots.appendChild(dot);
});

// ── Layout ──
function getGridLayout() {
  const w=window.innerWidth, gap=20, pad=gap, top=56+pad, cardH=220, minW=260;
  const cols=Math.max(1,Math.min(7,Math.floor((w-pad)/(minW+gap))));
  const cardW=(w-pad-cols*gap)/cols;
  return cards.map((_,i) => ({ x:gap+(i%cols)*(cardW+gap), y:top+Math.floor(i/cols)*(cardH+gap), w:cardW, h:cardH }));
}
function getFocusLayout(idx) {
  const vw=window.innerWidth, vh=window.innerHeight;
  return cards.map((_,i) => i===idx ? {x:0,y:0,w:vw,h:vh} : {x:(i-idx)*vw*1.1,y:0,w:vw,h:vh});
}
function setTargets(layout) { layout.forEach((p,i) => { const s=cardSprings[i]; s.x.dest=p.x; s.y.dest=p.y; s.sizeX.dest=p.w; s.sizeY.dest=p.h; }); }
function initGrid() {
  const layout=getGridLayout(); layout.forEach((p,i) => { const s=cardSprings[i];
    s.x.pos=s.x.dest=p.x; s.y.pos=s.y.dest=p.y; s.sizeX.pos=s.sizeX.dest=p.w; s.sizeY.pos=s.sizeY.dest=p.h; s.opacity.pos=s.opacity.dest=1;
    s.x.v=s.y.v=s.sizeX.v=s.sizeY.v=s.opacity.v=0;
  });
}

// ── Focus / Unfocus ──
function focusCard(idx) {
  if (idx<0||idx>=cards.length) return;
  focusedIndex=idx; history.replaceState(null,'','#card-'+idx);
  cardEls.forEach((el,i) => { el.classList.toggle('focused',i===idx); el.style.zIndex=i===idx?50:1;
    if (i===idx) { const sc=el.querySelector('.card-slide-content'); if(sc) sc.scrollTop=0; }});
  setTargets(getFocusLayout(idx));
  cards.forEach((_,i) => { cardSprings[i].opacity.dest = i===idx?1:0; });
  titlebar.classList.add('hidden-bar'); slideClose.classList.add('visible'); slideCounter.classList.add('visible');
  slideCounter.textContent=`${idx+1} / ${cards.length}`; navDots.classList.add('visible'); kbdHint.classList.add('visible');
  navPrev.classList.toggle('visible',idx>0); navNext.classList.toggle('visible',idx<cards.length-1);
  navDots.querySelectorAll('.nav-dot').forEach((d,i)=>d.classList.toggle('active',i===focusedIndex));
  startAnim();
}
function unfocus() {
  if (focusedIndex===-1) return; focusedIndex=-1; history.replaceState(null,'',location.pathname);
  cardEls.forEach(el => { el.classList.remove('focused'); el.style.zIndex=1; });
  setTargets(getGridLayout()); cards.forEach((_,i) => { cardSprings[i].opacity.dest=1; });
  titlebar.classList.remove('hidden-bar');
  ['visible'].forEach(c => { slideClose.classList.remove(c); slideCounter.classList.remove(c); navDots.classList.remove(c); navPrev.classList.remove(c); navNext.classList.remove(c); kbdHint.classList.remove(c); });
  startAnim();
}

// ── Animation ──
function startAnim() { if(!animating){animating=true;lastFrame=performance.now();accTime=0;requestAnimationFrame(tick);} }
function tick(now) {
  accTime+=Math.min(now-lastFrame,64); lastFrame=now;
  while(accTime>=msPerAnimationStep){accTime-=msPerAnimationStep; for(const s of cardSprings){springStep(s.x);springStep(s.y);springStep(s.sizeX);springStep(s.sizeY);springStep(s.opacity);}}
  let allRest=true;
  cardEls.forEach((el,i)=>{const s=cardSprings[i],op=Math.max(0,Math.min(1,s.opacity.pos));
    el.style.left=s.x.pos+'px';el.style.top=s.y.pos+'px';el.style.width=s.sizeX.pos+'px';el.style.height=s.sizeY.pos+'px';el.style.opacity=op;
    el.style.pointerEvents=op<0.01?'none':'auto';
    if(!springAtRest(s.x)||!springAtRest(s.y)||!springAtRest(s.sizeX)||!springAtRest(s.sizeY)||!springAtRest(s.opacity)) allRest=false;
  });
  if(allRest){for(const s of cardSprings){springGoToEnd(s.x);springGoToEnd(s.y);springGoToEnd(s.sizeX);springGoToEnd(s.sizeY);springGoToEnd(s.opacity);}
    cardEls.forEach((el,i)=>{const s=cardSprings[i],op=Math.max(0,Math.min(1,s.opacity.pos));
      el.style.left=s.x.pos+'px';el.style.top=s.y.pos+'px';el.style.width=s.sizeX.pos+'px';el.style.height=s.sizeY.pos+'px';el.style.opacity=op;el.style.pointerEvents=op<0.01?'none':'auto';});
    animating=false;return;}
  requestAnimationFrame(tick);
}

// ── Events ──
slideClose.addEventListener('click',unfocus);
navPrev.addEventListener('click',()=>{if(focusedIndex>0)focusCard(focusedIndex-1);});
navNext.addEventListener('click',()=>{if(focusedIndex<cards.length-1)focusCard(focusedIndex+1);});
document.addEventListener('keydown',e=>{if(focusedIndex===-1)return;
  if(e.key==='Escape'){unfocus();e.preventDefault();}
  if(e.key==='ArrowLeft'&&focusedIndex>0){focusCard(focusedIndex-1);e.preventDefault();}
  if(e.key==='ArrowRight'&&focusedIndex<cards.length-1){focusCard(focusedIndex+1);e.preventDefault();}
});
window.addEventListener('resize',()=>{setTargets(focusedIndex===-1?getGridLayout():getFocusLayout(focusedIndex));startAnim();});

// ── Theme ──
const themeToggle=document.getElementById('themeToggle');
function setTheme(t){document.documentElement.classList.toggle('light',t==='light');themeToggle.innerHTML=t==='light'?'&#9728;':'&#9790;';localStorage.setItem('learn-theme',t);}
themeToggle.addEventListener('click',()=>setTheme(document.documentElement.classList.contains('light')?'dark':'light'));
try{const s=localStorage.getItem('learn-theme');if(s)setTheme(s);}catch(e){}

// ── Init ──
initGrid();
cardEls.forEach((el,i)=>{const s=cardSprings[i];el.style.left=s.x.pos+'px';el.style.top=s.y.pos+'px';el.style.width=s.sizeX.pos+'px';el.style.height=s.sizeY.pos+'px';el.style.opacity=1;});
const hm=location.hash.match(/^#card-(\d+)$/);
if(hm){const idx=+hm[1];if(idx>=0&&idx<cards.length)requestAnimationFrame(()=>focusCard(idx));}
</script>
</body>
</html>
```

## Output Rules

1. Single self-contained HTML file
2. Output as a `widget` code block so it renders inline in chat
3. Replace `{{TITLE}}`, `{{SUBTITLE}}`, and the `cards` array
4. Slide content is raw HTML inside each card's `content` field
5. Use visuals from the Visual Toolkit when they help — don't force them
6. If using Mermaid, p5, or D3, add their CDN script tag in the `<head>`
7. Keep total file under 500KB

## Language Support

If the user requests a specific language, generate all slide text in that language. Keep code syntax, file paths, and proper nouns in English.
