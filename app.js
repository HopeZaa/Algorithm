import './styles.css';

const REPO = 'https://github.com/HopeZaa/Graph_Algo';
const RAW = 'https://raw.githubusercontent.com/HopeZaa/Graph_Algo/main/';

// These are the folders that exist in the source repository. The README and
// the C++ file are intentionally fetched as-is in the browser: this is a
// static GitHub Pages frontend, with no backend and no rewritten solutions.
const algorithms = [
  { id: 'bfs', title: 'Breadth First Search', short: 'BFS', group: 'Traversal', folder: 'BFS', readme: 'BFS/README.md', code: 'BFS/BFS.cpp', blurb: 'Visit a graph level by level, preserving the adjacency-list order.', accent: 'mint' },
  { id: 'dfs', title: 'Depth First Search', short: 'DFS', group: 'Traversal', folder: 'DFS', readme: 'DFS/README.md', code: 'DFS/DFS.cpp', blurb: 'Go as deep as possible before backtracking through the graph.', accent: 'violet' },
  { id: 'cycle-dg', title: 'Detect Cycle in a Directed Graph', short: 'DG CYCLE', group: 'Connectivity', folder: 'Cycle/DG', readme: 'Cycle/DG/README.md', code: 'Cycle/DG/DFS.cpp', blurb: 'Determine whether directed edges contain a cycle.', accent: 'coral' },
  { id: 'cycle-ug', title: 'Detect Cycle in an Undirected Graph', short: 'UG CYCLE', group: 'Connectivity', folder: 'Cycle/UG', readme: 'Cycle/UG/README.md', code: 'Cycle/UG/DFS.cpp', blurb: 'Check every connected component for an undirected cycle.', accent: 'amber' },
  { id: 'dsu', title: 'Disjoint Set Union', short: 'DSU', group: 'Connectivity', folder: 'DSU', readme: 'DSU/README.md', code: 'DSU/DSU.cpp', blurb: 'Merge groups and query representatives with a compact set structure.', accent: 'blue' },
  { id: 'flood-fill', title: 'Flood Fill Algorithm', short: 'FLOOD FILL', group: 'Grid', folder: 'FloodFill', readme: 'FloodFill/README.md', code: 'FloodFill/FloodFill.cpp', blurb: 'Propagate a new color through four-directionally connected pixels.', accent: 'pink' },
  { id: 'kruskal', title: "Kruskal's Algorithm (Minimum Spanning Tree)", short: 'KRUSKAL', group: 'MST', folder: 'MST/Krushkal', readme: 'MST/Krushkal/README.md', code: 'MST/Krushkal/Krushkal.cpp', blurb: 'Build a minimum spanning tree by selecting the cheapest safe edges.', accent: 'orange' },
  { id: 'prim', title: "Prim's Algorithm (Minimum Spanning Tree)", short: 'PRIM', group: 'MST', folder: 'MST/Prim', readme: 'MST/Prim/README.md', code: 'MST/Prim/Prim.cpp', blurb: 'Grow a minimum spanning tree from the visited frontier.', accent: 'yellow' },
  { id: 'floyd-warshall', title: 'Floyd–Warshall Algorithm (All-Pairs Shortest Path)', short: 'FLOYD–WARSHALL', group: 'Shortest path', folder: 'ShortestPath/APSP', readme: 'ShortestPath/APSP/README.md', code: 'ShortestPath/APSP/FloydWarshall.cpp', blurb: 'Update every pair of shortest distances in place.', accent: 'cyan' },
  { id: 'bellman-ford', title: 'Bellman–Ford Algorithm (Single-Source Shortest Path)', short: 'BELLMAN–FORD', group: 'Shortest path', folder: 'ShortestPath/SSSP/BellmanFord', readme: 'ShortestPath/SSSP/BellmanFord/README.md', code: 'ShortestPath/SSSP/BellmanFord/BellmanFord.cpp', blurb: 'Relax edges repeatedly and detect negative weight cycles.', accent: 'red' },
  { id: 'dijkstra', title: "Dijkstra's Algorithm (Single-Source Shortest Path)", short: 'DIJKSTRA', group: 'Shortest path', folder: 'ShortestPath/SSSP/Dijkstra', readme: 'ShortestPath/SSSP/Dijkstra/README.md', code: 'ShortestPath/SSSP/Dijkstra/Dijkstra.cpp', blurb: 'Find shortest distances in connected weighted graphs without negative edges.', accent: 'green' },
];

const groups = ['All', 'Traversal', 'Shortest path', 'MST', 'Connectivity', 'Grid'];
const state = {
  page: 'home',
  selected: null,
  query: '',
  group: 'All',
  favorites: new Set(readFavorites()),
  readmes: new Map(),
  codes: new Map(),
  sidebarOpen: false,
  commandOpen: false,
  toc: [],
};

const app = document.querySelector('#app');

function readFavorites() {
  try { return JSON.parse(localStorage.getItem('graph-algo-favorites') || '[]'); } catch { return []; }
}

function saveFavorites() {
  localStorage.setItem('graph-algo-favorites', JSON.stringify([...state.favorites]));
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, '-').replace(/^-|-$/g, '') || 'section';
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const html = [];
  const headings = [];
  let inFence = false;
  let fenceLanguage = '';
  let fenceLines = [];
  let listType = null;
  let paragraph = [];
  let imageCount = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (listType) html.push(`</${listType}>`);
    listType = null;
  };
  const flushFence = () => {
    const language = fenceLanguage ? ` data-language="${escapeHtml(fenceLanguage)}"` : '';
    html.push(`<pre class="markdown-code"${language}><code>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
    fenceLanguage = '';
    fenceLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      flushParagraph();
      closeList();
      if (inFence) flushFence();
      else fenceLanguage = line.trim().slice(3).trim();
      inFence = !inFence;
      continue;
    }
    if (inFence) { fenceLines.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = Math.min(heading[1].length, 4);
      const text = heading[2].trim();
      const id = `${slugify(text)}-${headings.length}`;
      headings.push({ text, id, level });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph(); closeList();
      imageCount += 1;
      html.push(`<figure class="readme-figure"><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy" /><figcaption>${escapeHtml(image[1] || `Repository image ${imageCount}`)}</figcaption></figure>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) { flushParagraph(); closeList(); html.push('<hr />'); continue; }
    const list = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (list) {
      flushParagraph();
      const nextType = /^\s*\d+\./.test(line) ? 'ol' : 'ul';
      if (listType !== nextType) { closeList(); listType = nextType; html.push(`<${listType}>`); }
      html.push(`<li>${inlineMarkdown(list[1])}</li>`);
      continue;
    }
    if (line.startsWith('>')) { flushParagraph(); closeList(); html.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); closeList();
  if (inFence) flushFence();
  return { html: html.join(''), headings };
}

function icon(name) {
  const icons = {
    arrow: '↗', back: '←', search: '⌕', menu: '☰', close: '×', star: '☆', starFill: '★', copy: '⧉', download: '↓', command: '⌘', link: '↗', code: '</>', book: '▤', check: '✓', external: '↗', home: '⌂', library: '▦', saved: '♡', random: '⤨', info: 'i',
  };
  return icons[name] || '·';
}

function filteredAlgorithms() {
  const query = state.query.trim().toLowerCase();
  return algorithms.filter(item => {
    const matchesGroup = state.group === 'All' || item.group === state.group;
    const haystack = `${item.title} ${item.short} ${item.group} ${item.folder} ${item.blurb}`.toLowerCase();
    return matchesGroup && (!query || haystack.includes(query));
  });
}

function renderShell(content, active = state.page) {
  const libraryActive = active === 'library' || active === 'detail';
  app.innerHTML = `<div class="app-shell ${state.sidebarOpen ? 'sidebar-visible' : ''}">
    <aside class="sidebar" id="sidebar">
      <div class="brand-row"><a class="brand" href="#" data-route="home"><span class="brand-mark">{ }</span><span><strong>Graph</strong><b>_Algo</b></span></a><button class="icon-btn close-sidebar" data-action="close-sidebar" aria-label="Close navigation">${icon('close')}</button></div>
      <div class="repo-status"><span class="status-dot"></span><span>mirrored from GitHub</span></div>
      <nav class="side-nav" aria-label="Primary navigation">
        <span class="nav-overline">Workspace</span>
        <button class="nav-item ${active === 'home' ? 'active' : ''}" data-route="home"><span>${icon('home')}</span>Overview <small>⌘ 1</small></button>
        <button class="nav-item ${libraryActive ? 'active' : ''}" data-route="library"><span>${icon('library')}</span>Library <small>⌘ 2</small><em>${algorithms.length}</em></button>
        <button class="nav-item ${active === 'saved' ? 'active' : ''}" data-route="saved"><span>${icon('saved')}</span>Saved <small>⌘ 3</small><em>${state.favorites.size || ''}</em></button>
        <span class="nav-overline nav-gap">Tools</span>
        <button class="nav-item" data-action="random"><span>${icon('random')}</span>Random problem <small>R</small></button>
        <button class="nav-item" data-action="command"><span>${icon('command')}</span>Command palette <small>⌘ K</small></button>
      </nav>
      <div class="sidebar-bottom"><div class="source-card"><span class="source-kicker">OPEN SOURCE</span><strong>Original source, untouched.</strong><p>Problem statements, diagrams and C++ solutions are mirrored from HopeZaa/Graph_Algo.</p><a href="${REPO}" target="_blank" rel="noreferrer">Open repository ${icon('external')}</a></div><div class="sidebar-footer"><span>STATIC FRONTEND</span><span>11 SOURCES</span></div></div>
    </aside>
    <div class="sidebar-scrim" data-action="close-sidebar"></div>
    <main class="main-shell"><header class="topbar"><div class="topbar-leading"><button class="icon-btn menu-btn" data-action="toggle-sidebar" aria-label="Open navigation">${icon('menu')}</button><div class="breadcrumbs"><span>Graph_Algo</span><b>/</b><strong>${active === 'home' ? 'Overview' : active === 'saved' ? 'Saved' : active === 'detail' ? 'Problem detail' : 'Library'}</strong></div></div><label class="global-search"><span>${icon('search')}</span><input id="global-search" value="${escapeHtml(state.query)}" placeholder="Search algorithms, topics, files..." autocomplete="off" /><kbd>⌘ K</kbd></label><div class="topbar-actions"><button class="icon-btn" data-action="command" aria-label="Open command palette">${icon('command')}</button><a class="repo-link" href="${REPO}" target="_blank" rel="noreferrer">GitHub ${icon('external')}</a><div class="avatar">HZ</div></div></header>${content}</main></div><div class="toast" id="toast" role="status"></div><div class="command-overlay" id="command-overlay"><section class="command-dialog" role="dialog" aria-modal="true" aria-label="Command palette"><div class="command-input"><span>${icon('search')}</span><input id="command-input" placeholder="Search the archive or run a command..." autocomplete="off" /><kbd>ESC</kbd></div><div class="command-results" id="command-results"></div><footer><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></footer></section></div>`;
  bindShell();
}

function renderHome() {
  const total = algorithms.length;
  renderShell(`<section class="page home-page"><div class="hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> PERSONAL GRAPH ALGORITHM ARCHIVE</div><h1>Read the problem.<br /><span>Trace the solution.</span></h1><p>A clean, searchable frontend for the exact problem statements, examples, diagrams and C++ reference implementations in <a href="${REPO}" target="_blank" rel="noreferrer">HopeZaa/Graph_Algo</a>.</p><div class="hero-actions"><button class="button button-primary" data-route="library">Browse the library <span>${icon('arrow')}</span></button><button class="button button-quiet" data-action="random">Open a random problem <span>${icon('random')}</span></button></div><div class="hero-meta"><span><i></i> ${total} source folders mirrored</span><span><i></i> README + .cpp kept intact</span></div></div><div class="hero-visual" aria-hidden="true"><div class="visual-label"><span>LIVE INDEX</span><strong>graph / 11 nodes</strong></div><svg viewBox="0 0 560 410" preserveAspectRatio="none"><path d="M86 302 C143 260 128 180 202 147 S314 128 349 77 S455 98 500 48" /><path d="M86 302 C196 326 243 257 349 284 S416 225 500 48" /><path d="M202 147 C228 208 302 207 349 77" /><path d="M349 284 C332 213 398 184 500 48" /></svg><div class="graph-node node-a">BFS<span>01</span></div><div class="graph-node node-b">DSU<span>05</span></div><div class="graph-node node-c">MST<span>07</span></div><div class="graph-node node-d">Dijkstra<span>11</span></div><div class="graph-node node-e">README<span>11</span></div><div class="visual-orbit orbit-one"></div><div class="visual-orbit orbit-two"></div></div></div><div class="section-heading"><div><span class="eyebrow">START HERE</span><h2>One archive. Every edge case.</h2></div><span class="section-count">01—03</span></div><div class="feature-strip"><article class="feature-card accent-mint"><div class="feature-icon">${icon('book')}</div><div><span class="feature-label">READ IT AS WRITTEN</span><h3>Exact README mirror</h3><p>Original English statements, inputs, outputs, constraints, explanations and linked diagrams.</p></div><span class="feature-arrow">${icon('arrow')}</span></article><article class="feature-card accent-blue"><div class="feature-icon">${icon('code')}</div><div><span class="feature-label">COPY WITH CONFIDENCE</span><h3>Real C++ solutions</h3><p>Every code panel is the repository's own .cpp file, formatted only for comfortable reading.</p></div><span class="feature-arrow">${icon('arrow')}</span></article><article class="feature-card accent-orange"><div class="feature-icon">${icon('random')}</div><div><span class="feature-label">MAKE IT A ROUTINE</span><h3>Useful study tools</h3><p>Save topics, filter by pattern, track reading progress and jump straight to any section.</p></div><span class="feature-arrow">${icon('arrow')}</span></article></div><div class="library-preview"><div class="section-heading"><div><span class="eyebrow">RECENTLY INDEXED</span><h2>Pick a problem to begin.</h2></div><button class="text-button" data-route="library">View all ${total} <span>${icon('arrow')}</span></button></div><div class="algorithm-grid compact-grid">${algorithms.slice(0, 6).map(cardTemplate).join('')}</div></div></section>`);
  setupParallax();
}

function cardTemplate(item) {
  const saved = state.favorites.has(item.id);
  return `<article class="algorithm-card ${item.accent}" data-detail="${item.id}"><div class="card-top"><span class="file-chip">${item.folder}</span><button class="save-btn ${saved ? 'saved' : ''}" data-favorite="${item.id}" aria-label="${saved ? 'Remove' : 'Save'} ${escapeHtml(item.title)}">${saved ? icon('starFill') : icon('star')}</button></div><div class="card-index">${String(algorithms.indexOf(item) + 1).padStart(2, '0')}</div><h3>${item.title}</h3><p>${item.blurb}</p><div class="card-bottom"><span>${item.group}</span><span class="card-arrow">${icon('arrow')}</span></div></article>`;
}

function renderLibrary(view = 'library') {
  const list = view === 'saved' ? filteredAlgorithms().filter(item => state.favorites.has(item.id)) : filteredAlgorithms();
  renderShell(`<section class="page library-page"><div class="page-intro"><div><div class="eyebrow"><span class="eyebrow-dot"></span> ${view === 'saved' ? 'YOUR BOOKMARKS' : 'THE SOURCE LIBRARY'}</div><h1>${view === 'saved' ? 'Saved problems.' : 'Graph algorithms.'}</h1><p>${view === 'saved' ? 'A short list of the problems you want to revisit.' : 'Eleven focused folders from the original repository, grouped by the pattern they teach.'}</p></div><div class="page-intro-side"><span class="big-count">${String(list.length).padStart(2, '0')}</span><span>${view === 'saved' ? 'saved now' : 'problems indexed'}</span></div></div><div class="library-toolbar"><div class="filter-row">${groups.map(group => `<button class="filter-pill ${state.group === group ? 'active' : ''}" data-filter="${group}">${group}</button>`).join('')}</div><span class="result-label">${list.length} / ${view === 'saved' ? state.favorites.size : algorithms.length} results</span></div>${list.length ? `<div class="algorithm-grid">${list.map(cardTemplate).join('')}</div>` : `<div class="empty-panel"><span>${view === 'saved' ? icon('saved') : icon('search')}</span><h2>${view === 'saved' ? 'Nothing saved yet.' : 'No matching problems.'}</h2><p>${view === 'saved' ? 'Use the star on any problem card to keep it here.' : 'Try a different keyword or clear the active filter.'}</p><button class="button button-quiet" data-action="clear-search">Clear filters</button></div>`}</section>` , view);
}

function renderDetail(id, loading = false, error = '') {
  const item = algorithms.find(entry => entry.id === id) || algorithms[0];
  state.selected = item.id;
  const readme = state.readmes.get(item.id);
  const code = state.codes.get(item.id);
  const parsed = readme ? renderMarkdown(readme) : null;
  state.toc = parsed?.headings || [];
  const detailBody = loading ? '<div class="detail-loading"><div></div><div></div><div></div><div></div></div>' : error ? `<div class="load-error"><strong>Could not load the source files.</strong><p>${escapeHtml(error)}</p><a href="${RAW}${item.readme}" target="_blank" rel="noreferrer">Open README directly ${icon('external')}</a></div>` : parsed ? parsed.html : '';
  renderShell(`<section class="page detail-page"><div class="detail-top"><button class="back-button" data-route="library">${icon('back')} Library</button><div class="detail-actions"><a class="button button-quiet small-button" href="${REPO}/tree/main/${item.folder}" target="_blank" rel="noreferrer">View folder ${icon('external')}</a><button class="save-detail ${state.favorites.has(item.id) ? 'saved' : ''}" data-favorite="${item.id}" aria-label="Save problem">${state.favorites.has(item.id) ? icon('starFill') : icon('star')}</button></div></div><div class="detail-heading"><div><div class="eyebrow"><span class="eyebrow-dot"></span> ${item.folder}</div><h1>${item.title}</h1><p>${item.blurb}</p></div><div class="detail-stat"><span>${String(algorithms.indexOf(item) + 1).padStart(2, '0')}</span><small>of ${String(algorithms.length).padStart(2, '0')}</small></div></div><div class="reading-progress"><span id="reading-progress-bar"></span></div><div class="detail-layout"><article class="readme-column"><div class="article-toolbar"><span class="source-label"><span class="green-dot"></span> README.md</span><a href="${RAW}${item.readme}" target="_blank" rel="noreferrer">raw source ${icon('external')}</a></div><div class="readme-content" id="readme-content">${detailBody}</div></article><aside class="solution-column"><div class="solution-sticky"><div class="solution-header"><div><span class="source-label"><span class="blue-dot"></span> ${item.code.split('/').pop()}</span><small>Original C++ implementation</small></div><div class="code-actions"><button class="code-icon-btn" data-action="copy-code" aria-label="Copy C++ solution">${icon('copy')}</button><button class="code-icon-btn" data-action="download-code" aria-label="Download C++ solution">${icon('download')}</button></div></div><div class="code-frame">${loading ? '<div class="code-loading"></div>' : code ? `<pre class="solution-code"><code>${renderCode(code)}</code></pre>` : '<div class="code-empty">C++ source is not available yet.</div>'}</div><div class="solution-footer"><span>C++</span><span>${code ? `${code.split(/\n/).length} lines` : 'loading'}</span></div></div><nav class="toc-panel"><span class="toc-title">ON THIS PAGE</span>${state.toc.filter(heading => heading.level <= 3).slice(0, 12).map(heading => `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`).join('') || '<span class="toc-muted">README sections will appear here.</span>'}</nav></aside></div><div class="next-problem">${renderNextProblem(item)}</div></section>`, 'detail');
  setupReadingProgress();
}

function renderCode(code) {
  return code.split('\n').map((line, index) => `<span class="code-line"><span class="line-number">${String(index + 1).padStart(3, ' ')}</span><span class="line-content">${escapeHtml(line) || ' '}</span></span>`).join('');
}

function renderNextProblem(item) {
  const index = algorithms.indexOf(item);
  const next = algorithms[(index + 1) % algorithms.length];
  return `<span class="eyebrow">NEXT IN THE ARCHIVE</span><button data-detail="${next.id}"><span><small>${next.folder}</small><strong>${next.title}</strong></span><span>${icon('arrow')}</span></button>`;
}

async function openDetail(id) {
  const item = algorithms.find(entry => entry.id === id) || algorithms[0];
  state.page = 'detail';
  state.selected = item.id;
  state.sidebarOpen = false;
  renderDetail(item.id, true);
  try {
    const [readmeResponse, codeResponse] = await Promise.all([fetch(`${RAW}${item.readme}`), fetch(`${RAW}${item.code}`)]);
    if (!readmeResponse.ok || !codeResponse.ok) throw new Error(`GitHub returned ${readmeResponse.status}/${codeResponse.status}`);
    state.readmes.set(item.id, await readmeResponse.text());
    state.codes.set(item.id, await codeResponse.text());
    if (state.selected === item.id) renderDetail(item.id);
  } catch (error) {
    if (state.selected === item.id) renderDetail(item.id, false, error.message);
  }
}

function navigate(route) {
  if (route === 'home') { state.page = 'home'; state.group = 'All'; renderHome(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (route === 'library') { state.page = 'library'; renderLibrary('library'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (route === 'saved') { state.page = 'saved'; renderLibrary('saved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) { state.favorites.delete(id); showToast('Removed from saved problems'); }
  else { state.favorites.add(id); showToast('Saved for later'); }
  saveFavorites();
  if (state.page === 'detail') renderDetail(id, !state.readmes.has(id));
  else if (state.page === 'saved') renderLibrary('saved');
  else if (state.page === 'library') renderLibrary('library');
  else renderHome();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function openCommand() {
  state.commandOpen = true;
  const overlay = document.querySelector('#command-overlay');
  overlay?.classList.add('open');
  const input = document.querySelector('#command-input');
  if (input) { input.value = ''; input.focus(); }
  renderCommandResults('');
}

function closeCommand() {
  state.commandOpen = false;
  document.querySelector('#command-overlay')?.classList.remove('open');
}

function renderCommandResults(query) {
  const target = document.querySelector('#command-results');
  if (!target) return;
  const q = query.toLowerCase();
  const commands = [
    { label: 'Go to overview', meta: 'Navigation', route: 'home' },
    { label: 'Open full library', meta: 'Navigation', route: 'library' },
    { label: 'Show saved problems', meta: 'Navigation', route: 'saved' },
    { label: 'Open a random problem', meta: 'Action', action: 'random' },
    ...algorithms.map(item => ({ label: item.title, meta: item.folder, detail: item.id })),
  ].filter(command => !q || `${command.label} ${command.meta}`.toLowerCase().includes(q)).slice(0, 9);
  target.innerHTML = commands.length ? commands.map(command => `<button class="command-result" ${command.detail ? `data-detail="${command.detail}"` : command.route ? `data-route="${command.route}"` : `data-action="${command.action}"`}><span>${command.detail ? icon('code') : icon('arrow')}<strong>${escapeHtml(command.label)}</strong></span><small>${escapeHtml(command.meta)}</small></button>`).join('') : '<div class="command-empty">No matching command.</div>';
}

function copyCode() {
  const code = state.codes.get(state.selected);
  if (!code) return showToast('C++ source is still loading');
  navigator.clipboard?.writeText(code).then(() => showToast('C++ solution copied'), () => showToast('Copy is unavailable in this browser'));
}

function downloadCode() {
  const item = algorithms.find(entry => entry.id === state.selected);
  const code = state.codes.get(state.selected);
  if (!item || !code) return showToast('C++ source is still loading');
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = item.code.split('/').pop(); link.click();
  URL.revokeObjectURL(url);
  showToast('C++ file downloaded');
}

function bindShell() {
  document.querySelectorAll('[data-route]').forEach(element => element.addEventListener('click', event => { event.preventDefault(); closeCommand(); navigate(element.dataset.route); }));
  document.querySelectorAll('[data-detail]').forEach(element => element.addEventListener('click', event => { if (event.target.closest('[data-favorite]')) return; closeCommand(); openDetail(element.dataset.detail); }));
  document.querySelectorAll('[data-favorite]').forEach(element => element.addEventListener('click', event => { event.stopPropagation(); toggleFavorite(element.dataset.favorite); }));
  document.querySelectorAll('[data-filter]').forEach(element => element.addEventListener('click', () => { state.group = element.dataset.filter; if (state.page === 'saved') renderLibrary('saved'); else renderLibrary('library'); }));
  document.querySelectorAll('[data-action]').forEach(element => element.addEventListener('click', event => {
    event.preventDefault();
    const action = element.dataset.action;
    if (action === 'toggle-sidebar') { state.sidebarOpen = true; document.querySelector('.app-shell')?.classList.add('sidebar-visible'); }
    if (action === 'close-sidebar') { state.sidebarOpen = false; document.querySelector('.app-shell')?.classList.remove('sidebar-visible'); }
    if (action === 'command') openCommand();
    if (action === 'copy-code') copyCode();
    if (action === 'download-code') downloadCode();
    if (action === 'random') openDetail(algorithms[Math.floor(Math.random() * algorithms.length)].id);
    if (action === 'clear-search') { state.query = ''; state.group = 'All'; renderLibrary(state.page === 'saved' ? 'saved' : 'library'); }
  }));
  document.querySelector('#global-search')?.addEventListener('input', event => {
    state.query = event.target.value;
    if (state.page === 'home') renderHome();
    if (state.page === 'library') renderLibrary('library');
    if (state.page === 'saved') renderLibrary('saved');
    if (state.page === 'detail') { state.page = 'library'; renderLibrary('library'); }
  });
  document.querySelector('#command-overlay')?.addEventListener('click', event => { if (event.target.id === 'command-overlay') closeCommand(); });
  document.querySelector('#command-results')?.addEventListener('click', event => {
    const target = event.target.closest('[data-detail], [data-route], [data-action]');
    if (!target) return;
    event.preventDefault();
    closeCommand();
    if (target.dataset.detail) openDetail(target.dataset.detail);
    else if (target.dataset.route) navigate(target.dataset.route);
    else if (target.dataset.action === 'random') openDetail(algorithms[Math.floor(Math.random() * algorithms.length)].id);
  });
  document.querySelector('#command-input')?.addEventListener('input', event => renderCommandResults(event.target.value));
  document.querySelector('#command-input')?.addEventListener('keydown', event => { if (event.key === 'Escape') closeCommand(); });
}

function setupReadingProgress() {
  const bar = document.querySelector('#reading-progress-bar');
  if (!bar) return;
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function setupParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let scheduled = false;
  const update = () => {
    const offset = Math.min(window.scrollY, 520) * 0.08;
    visual.style.setProperty('--parallax-y', `${offset}px`);
    scheduled = false;
  };
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
}

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
  if (event.key === 'Escape') closeCommand();
  if (event.key.toLowerCase() === 'r' && document.activeElement?.tagName !== 'INPUT' && !state.commandOpen) openDetail(algorithms[Math.floor(Math.random() * algorithms.length)].id);
  if ((event.metaKey || event.ctrlKey) && ['1', '2', '3'].includes(event.key)) { event.preventDefault(); navigate({ 1: 'home', 2: 'library', 3: 'saved' }[event.key]); }
});

renderHome();
