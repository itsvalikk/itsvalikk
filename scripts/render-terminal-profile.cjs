#!/usr/bin/env node
'use strict';

// Reproducible public profile content. No network, private paths or account data.
// Run: node scripts/render-terminal-profile.cjs
// NOW / SHIPS remain native terminal output so refresh.mjs can update them alone.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const readmePath = path.join(root, 'README.md');
const previous = fs.readFileSync(readmePath, 'utf8');
const cards = [];
const paragraph = (text, label = '') => ({ text, label });
function card(id, command, status, paragraphs) {
  const item = { id, command, status, paragraphs };
  cards.push(item);
  return item;
}

const overview = card('selected-work', 'ls projects', 'SELECTED WORK', [
  paragraph('Real workshop problems, explored with AI. Open a project: products, experiments and collaborations, including local work beyond GitHub.'),
  paragraph('These are development projects, not claims that every feature is finished or publicly available.', 'STATUS'),
]);

const projects = [
  { name: 'Trainic', slug: 'trainic', summary: 'a healthier daily routine', status: 'Active development', group: 'projects', body: [
    paragraph('Training and nutrition in Romanian: workouts, food tracking, daily habits and an AI coach informed by calculated data.'),
    paragraph('Expo, React Native, TypeScript and Supabase; iOS and web.', 'BUILT WITH'),
  ] },
  { name: 'Atlas', slug: 'atlas', summary: 'an AI workspace on Windows', status: 'Desktop app', group: 'projects', body: [
    paragraph('A local AI workspace on Windows: providers, online and local models, project tools and web search in one application.'),
    paragraph('Electron and JavaScript. Public distribution is not announced here.', 'BUILT WITH'),
  ] },
  { name: 'Atelier', slug: 'atelier', summary: 'research before risk', status: 'Experimental', group: 'projects', body: [
    paragraph('Research and compare trading strategies, evaluate risk and simulate ideas in a personal dashboard before real-world use.'),
    paragraph('Experimental research — not promises of returns.', 'STATUS'),
    paragraph('Next.js, TypeScript, Drizzle and SQLite.', 'BUILT WITH'),
  ] },
  { name: 'Scriptly', slug: 'scriptly', summary: 'from idea to camera', status: 'Creator tools', group: 'projects', body: [
    paragraph('For on-camera creators: turn an idea or reference clip into scripts and editing plans for TikTok, Reels and Shorts.'),
    paragraph('Production planning and an administration console. It does not render finished videos.'),
    paragraph('Next.js, React, TypeScript and Supabase.', 'BUILT WITH'),
  ] },
  { name: 'Social Growth Brain', slug: 'social-growth-brain', summary: 'a content workbench', status: 'Social tools', group: 'projects', body: [
    paragraph('Plan and manage social content with AI-assisted drafts, a calendar, approval workflow, scheduling and publishing integrations.'),
    paragraph('JavaScript, Supabase, Deno and Cloudflare.', 'BUILT WITH'),
  ] },
  { name: 'PitStop Garage MK', slug: 'pitstop-garage-mk', summary: 'built from my day job', status: 'My workshop', group: 'businesses', body: [
    paragraph('The website and workshop platform for my own automotive business, bringing my day job and software together.'),
    paragraph('Public website, customer portal, workshop management and invoicing.'),
    paragraph('Next.js, Supabase and Cloudflare, alongside a static website.', 'BUILT WITH'),
  ] },
  { name: 'WeddingFlow', slug: 'weddingflow', summary: 'planning the big day', status: 'Collaboration', group: 'businesses', body: [
    paragraph('Wedding planning with Filip, with separate spaces for couples, suppliers and administrators.'),
    paragraph('German, English and Romanian support. A shared project, not a solo creation.'),
    paragraph('React, TypeScript, Vite and Supabase.', 'BUILT WITH'),
  ] },
  { name: 'Graphify Desktop', slug: 'graphify-desktop', summary: 'see the shape of code', status: 'Local tool', group: 'tools', body: [
    paragraph('Explore Graphify code maps with search, connected paths and links back to source files to understand a codebase.'),
    paragraph('Node.js, JavaScript and Canvas.', 'BUILT WITH'),
    paragraph('My interface works with Graphify maps; the Graphify engine is not my creation.', 'CREDIT'),
  ] },
  { name: 'Eroare Hub', slug: 'eroare-hub', summary: 'keep an eye on the work', status: 'Internal tool', group: 'tools', body: [
    paragraph('A shared dashboard for application errors and status, bringing issues across projects into one place.'),
    paragraph('TypeScript, Hono, Cloudflare Workers and D1.', 'BUILT WITH'),
    paragraph('An internal tool; access addresses and operational data are not shared here.', 'PRIVACY'),
  ] },
];
for (const project of projects) {
  project.card = card(project.slug, 'open ' + project.name, project.status.toUpperCase(), project.body);
}

const toolbench = card('toolbench', 'ls tools', 'THE TOOLBENCH', [
  paragraph('The smaller tools behind the products. Built to make the next task easier.'),
]);
const story = card('my-story', 'cat story.txt', 'FROM THE GARAGE', [
  paragraph("I'm a mechanic and entrepreneur. I run an automotive workshop and build software alongside that work."),
  paragraph('AI opened a new door. At Mindforge, I learn by turning ideas into apps with Claude and Codex, then testing and improving them.'),
  paragraph('PitStop Garage MK comes from my day job; other projects reach beyond the garage. I set the product direction. The decisions and responsibility stay with me.'),
]);
const process = card('how-i-work', 'cat process.txt', 'HOW I WORK', [
  paragraph('Start with a real problem and a clear idea of who it helps.', '01 / THE PROBLEM'),
  paragraph('Shape the smallest useful version.', '02 / THE FIRST VERSION'),
  paragraph('Build with AI, inspect the result and test what actually works.', '03 / BUILD AND VERIFY'),
  paragraph('Use feedback to decide what to improve next.', '04 / THE NEXT ITERATION'),
  paragraph('My projects use a mix of TypeScript, React Native, Next.js, Electron, Supabase and Cloudflare, with Claude Code and Codex as building partners.', 'TOOLKIT'),
]);
const contact = card('contact', 'connect', 'SAY HELLO', [
  paragraph('Have something worth building? Start at mindforgewr.com.'),
]);
const behind = card('behind-the-profile', 'cat README.about', 'ARTWORK / PRIVACY', [
  paragraph('The product code stays private. This profile shares selected project summaries, not private source code, customer data or internal access details.', 'PRIVACY'),
  paragraph('The terminal banner is a self-contained SVG with no scripts, remote fonts or tracking. The companions are original fan illustrations inspired by the AI tools I use, not an affiliation with or endorsement by Anthropic or OpenAI.', 'ARTWORK'),
  paragraph("The dialogue and test results are scripted jokes, not live checks or repository status. Their tiny sitcom: Claude throws a bug, Codex returns it, and the mechanic restores the peace. One stolen cymbal tap later, the bug joins the band. It's a feature."),
  paragraph("The mechanic's wrench is a little piece of my day job. Reduced-motion preferences leave the musicians visible and stationary."),
  paragraph('Earlier artwork lives in mindforge-lab. The refresh script reads only allowlisted public activity; the saved snapshot below is not a live activity indicator.', 'PUBLIC ACTIVITY'),
]);

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function wrap(text, limit = 42) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (word.length > limit) throw new Error('Overlong word: ' + word);
    if (line && line.length + word.length + 1 > limit) { lines.push(line); line = ''; }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}
function renderSvg(item) {
  let y = 91;
  let row = 0;
  const elements = [];
  for (const part of item.paragraphs) {
    if (part.label) {
      elements.push(`<text x="34" y="${y}" class="label">${escapeXml(part.label)}</text>`);
      y += 35;
    }
    for (const line of wrap(part.text)) {
      const width = Number((line.length * 16.8).toFixed(1));
      elements.push(`<text x="34" y="${y}" class="line" textLength="${width}" lengthAdjust="spacingAndGlyphs" style="animation-delay:${Math.min(row * 0.025, 0.45).toFixed(3)}s">${escapeXml(line)}</text>`);
      y += 36;
      row += 1;
    }
    y += 12;
  }
  const height = y + 18;
  const description = item.paragraphs.map(p => (p.label ? p.label + ': ' : '') + p.text).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="${height}" viewBox="0 0 780 ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(item.command)} — ${escapeXml(item.status)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    text { font-family: Consolas, 'Liberation Mono', monospace; }
    .line { font-size: 28px; fill: #eceee5; animation: reveal .3s ease-out both; }
    .label { font-size: 21px; letter-spacing: 1px; fill: #b9d99a; }
    @keyframes reveal { from { fill: #c0dfa2; } to { fill: #eceee5; } }
    @media (prefers-reduced-motion: reduce) { .line { animation: none; } }
  </style>
  <rect width="780" height="${height}" rx="12" fill="#050505"/>
  <rect x="1" y="1" width="778" height="${height - 2}" rx="11" fill="none" stroke="#283026"/>
  <path d="M1 52h778" stroke="#283026"/>
  <text x="28" y="34" fill="#c0dfa2" font-size="22">&gt; ${escapeXml(item.command)}</text>
  <text x="750" y="33" text-anchor="end" fill="#8f9c84" font-size="12" letter-spacing=".7">${escapeXml(item.status)}</text>
  ${elements.join('\n  ')}
  <path d="M34 ${height - 23}h23" stroke="#8ba76d" stroke-width="3"/>
</svg>
`;
}
function image(item) {
  const alt = item.paragraphs.map(p => (p.label ? p.label + ': ' : '') + p.text).join(' ');
  return `<img src="./assets/terminal-${item.id}.svg" width="100%" alt="${escapeXml(alt)}">`;
}
function details(summary, body, open = false) {
  return `<details${open ? ' open' : ''}>\n<summary><code>${escapeXml(summary)}</code></summary>\n\n${body}\n\n</details>`;
}
function projectDetails(project) {
  return details('> open ' + project.name + '  [' + project.status + ']', image(project.card), project.slug === 'trainic');
}
function marker(name) {
  const match = previous.match(new RegExp('<!-- ' + name + ':START -->([\\s\\S]*?)<!-- ' + name + ':END -->'));
  if (!match) throw new Error('Missing ' + name + ' markers; refusing to discard refresh content.');
  const body = name === 'NOW'
    ? '\n' + wrap(match[1].replace(/\*\*/g, '').trim(), 36).join('\n') + '\n'
    : match[1];
  return `<!-- ${name}:START -->${body}<!-- ${name}:END -->`;
}
const readme = [
  '<a href="https://mindforgewr.com/"><img src="./assets/mindforge-terminal.svg?v=dust36" width="100%" alt="mindforgewr — Claude throws a bug, Codex returns it, and a mechanic restores peace. The bug returns to join their band: it\'s a feature."></a>',
  '<img src="./assets/mindforge-story.svg" width="100%" alt="I\'m Vali. Mechanic. Entrepreneur. I run a workshop. I build with AI. Claude and Codex help me turn ideas into apps. I steer. I test. I decide. From the garage to Mindforge.">',
  '[`> projects`](#selected-work) · [`> tools`](#the-toolbench) · [`> story`](#my-story) · [`> connect`](#say-hello)',
  '<a id="selected-work"></a>\n\n## `> ls projects`', image(overview),
  '<pre>\n&gt; cat NOW\n' + marker('NOW') + '\n</pre>',
  ...projects.filter(p => p.group === 'projects').map(projectDetails),
  '### `> ls businesses-and-collaborations`',
  ...projects.filter(p => p.group === 'businesses').map(projectDetails),
  '<a id="the-toolbench"></a>\n\n## `> ls tools`', image(toolbench),
  ...projects.filter(p => p.group === 'tools').map(projectDetails),
  '<a id="my-story"></a>\n\n## `> cat story`',
  details('> read story  [From an automotive workshop to building with AI]', image(story)),
  details('> read process  [How I work]', image(process)),
  '<a id="say-hello"></a>\n\n## `> connect`', image(contact),
  '[`> open mindforgewr.com`](https://mindforgewr.com/)',
  '[`> Instagram / Mindforge`](https://www.instagram.com/mindforgewr/) · [`> Threads / Mindforge`](https://www.threads.com/@mindforgewr) · [`> Instagram / its.valik`](https://www.instagram.com/its.valik/)',
  details('> cat profile.about  [artwork / privacy / public activity]', image(behind) + '\n\n[`> open mindforge-lab`](https://github.com/itsvalikk/mindforge-lab)\n\n<pre>\n&gt; cat PUBLIC_ACTIVITY_SNAPSHOT\n' + marker('SHIPS') + '\n</pre>'),
  '<!-- Static terminal cards: node scripts/render-terminal-profile.cjs. Dynamic NOW/SHIPS: scripts/refresh.mjs. -->',
].join('\n\n') + '\n';

for (const item of cards) fs.writeFileSync(path.join(root, 'assets', 'terminal-' + item.id + '.svg'), renderSvg(item));
fs.writeFileSync(readmePath, readme);
console.log('Rendered ' + cards.length + ' terminal cards and README; preserved NOW and SHIPS contents.');
