#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'assets', 'img', 'og');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'jimmypark-og-m3-'));
const profile = path.join(temporary, 'chrome-profile');
const port = 9337;
fs.mkdirSync(output, { recursive: true });

const TOKENS = {
  surface: '#ffffff', surfaceLow: '#fdfcfa', onSurface: '#171717', onSurfaceVariant: '#66615c', outlineVariant: '#e6e1da',
  primary: '#7a1e2c', primaryContainer: '#f5e4e3', onPrimaryContainer: '#4b0f1a',
  tertiary: '#2f5a45', tertiaryContainer: '#eef4ef', onTertiaryContainer: '#173527',
  scouting: '#622599', scoutingContainer: '#efe4f7', onScoutingContainer: '#2e0f4a',
};

const pages = [
  { file: 'home.png', label: 'JIMMY PARK', title: 'Purpose first.\nThe right medium.\nBuilt for use.', detail: 'Producer · Platform Builder · Applied AI Practitioner', photo: 'assets/img/jimmy-park-portrait-960.jpg', color: 'primary' },
  { file: 'media-work.png', label: 'MEDIA WORK', title: 'Stories shaped\nfor attention\nand meaning.', detail: 'Direction · Production · Editing', photo: 'assets/img/video/samsung-keynote.jpg', color: 'primary' },
  { file: 'dev-work.png', label: 'DEV WORK', title: 'Platforms built\nfor real use.', detail: 'Planning · Development · Operations', photo: 'assets/img/dev/korea-dream-path.jpg', color: 'primary' },
  { file: 'lecture.png', label: 'LECTURE & LEARNING', title: 'Understanding\nbefore tools.', detail: 'Applied AI · Media · Working practice', photo: 'assets/img/portfolio/field-02.jpg', color: 'primary' },
  { file: 'scouting.png', label: 'GLOBAL & SCOUTING', title: 'Context changes\nthe work.', detail: 'International experience · Communication · Service', photo: 'assets/img/scouting-main.jpg', color: 'scouting' },
  { file: 'contact.png', label: 'START A CONVERSATION', title: 'Bring the purpose.\nWe can find\nthe next step.', detail: 'Jimmy Park · Seoul, Korea', photo: 'assets/img/jimmy-park-portrait.jpg', color: 'primary' },
  { file: 'articles.png', label: 'ARTICLES', title: 'Notes from\npractice.', detail: 'Media · Platforms · Applied AI · Communication', symbol: 'article', color: 'primary' },
];

const articles = [
  ['ax-1.png', 'AX SERIES · PART 1 OF 4', 'AI Is a Genie That Only Hears What You Say', 'chat_bubble', 'primary'],
  ['ax-2.png', 'AX SERIES · PART 2 OF 4', 'How to Divide Work Between Humans and AI', 'swap_horiz', 'primary'],
  ['ax-3.png', 'AX SERIES · PART 3 OF 4', 'If You Send It, You Own It', 'verified', 'primary'],
  ['ax-4.png', 'AX SERIES · PART 4 OF 4', 'True AX Is Not a Collection of AI Tools', 'account_tree', 'primary'],
  ['message-1.png', 'MESSAGE IN MOTION · PART 1 OF 4', 'From Speech to Video', 'graphic_eq', 'tertiary'],
  ['message-2.png', 'MESSAGE IN MOTION · PART 2 OF 4', 'From Long-form to Short-form', 'view_carousel', 'tertiary'],
  ['message-3.png', 'MESSAGE IN MOTION · PART 3 OF 4', 'The Cost of Making Meaning', 'layers', 'tertiary'],
  ['message-4.png', 'MESSAGE IN MOTION · PART 4 OF 4', 'Media Before Message, Humans Before Media', 'groups', 'tertiary'],
  ['work-behind-1.png', 'THE WORK BEHIND THE WORK · PART 1 OF 4', 'Expertise Should Not Make People Feel Small', 'forum', 'primary'],
  ['work-behind-2.png', 'THE WORK BEHIND THE WORK · PART 2 OF 4', 'Delivery Is a Date, Not the End of the Work', 'menu_book', 'primary'],
  ['work-behind-3.png', 'THE WORK BEHIND THE WORK · PART 3 OF 4', 'When Experts Are Everywhere, We Need an Eye for Connection', 'hub', 'primary'],
  ['work-behind-4.png', 'THE WORK BEHIND THE WORK · PART 4 OF 4', 'If People Cannot Understand It, Little Remains', 'sync_alt', 'primary'],
].map(([file, label, title, symbol, color]) => ({ file, label, title, symbol, color }));

function palette(name) {
  if (name === 'tertiary') return { accent: TOKENS.tertiary, container: TOKENS.tertiaryContainer, onContainer: TOKENS.onTertiaryContainer };
  if (name === 'scouting') return { accent: TOKENS.scouting, container: TOKENS.scoutingContainer, onContainer: TOKENS.onScoutingContainer };
  return { accent: TOKENS.primary, container: TOKENS.primaryContainer, onContainer: TOKENS.onPrimaryContainer };
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
}

function lines(value, max = 30) {
  if (value.includes('\n')) return value.split('\n');
  const words = value.split(/\s+/u), result = [];
  let current = '';
  for (const word of words) {
    if (current && (current + ' ' + word).length > max) { result.push(current); current = word; }
    else current += (current ? ' ' : '') + word;
  }
  if (current) result.push(current);
  return result.slice(0, 4);
}

function textBlock(value, { x, y, size, weight = 400, color = TOKENS.onSurface, lineHeight, max = 30, cls = '' }) {
  return `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${lines(value, max).map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${esc(line)}</tspan>`).join('')}</text>`;
}

function labelChip(label, p, width) {
  return `<rect x="64" y="68" width="${width}" height="40" rx="20" fill="${p.container}"/>${textBlock(label, { x: 84, y: 95, size: 16, weight: 600, color: p.onContainer, lineHeight: 0, max: 60, cls: 'label' })}`;
}

function brandAndURL(p) {
  return `${textBlock('Jimmy Park.', { x: 64, y: 50, size: 22, weight: 650, color: TOKENS.onSurface, lineHeight: 0, max: 20, cls: 'brand' })}${textBlock('jimmypark.net', { x: 1036, y: 590, size: 16, weight: 600, color: p.accent, lineHeight: 0, max: 20, cls: 'label' })}`;
}

function symbolPanel(symbol, p) {
  return `<rect x="824" y="32" width="344" height="566" rx="56" fill="${p.container}"/><circle cx="996" cy="315" r="104" fill="${TOKENS.surface}"/><text class="symbol" x="996" y="344" text-anchor="middle" font-size="88" fill="${p.onContainer}">${esc(symbol)}</text>`;
}

function pageSVG(item) {
  const p = palette(item.color);
  const chipWidth = Math.min(390, Math.max(150, 44 + item.label.length * 11));
  let visual;
  if (item.photo) {
    const photo = path.join(root, item.photo);
    const photoURL = `data:image/jpeg;base64,${fs.readFileSync(photo).toString('base64')}`;
    visual = `<defs><clipPath id="photo"><rect x="744" y="32" width="424" height="566" rx="28"/></clipPath></defs><rect x="744" y="32" width="424" height="566" rx="28" fill="${p.container}"/><image href="${photoURL}" x="744" y="32" width="424" height="566" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/><rect x="744" y="32" width="424" height="566" rx="28" fill="none" stroke="${TOKENS.outlineVariant}" stroke-width="1"/>`;
  } else visual = symbolPanel(item.symbol, p);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${TOKENS.surfaceLow}"/>${visual}${brandAndURL(p)}${labelChip(item.label, p, chipWidth)}${textBlock(item.title, { x: 64, y: 196, size: 57, weight: 520, color: TOKENS.onSurface, lineHeight: 64, max: 22, cls: 'display' })}${textBlock(item.detail, { x: 64, y: 548, size: 20, weight: 450, color: TOKENS.onSurfaceVariant, lineHeight: 28, max: 58, cls: 'title' })}</svg>`;
}

function articleSVG(item) {
  const p = palette(item.color);
  const chipWidth = Math.min(700, Math.max(230, 44 + item.label.length * 10));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${TOKENS.surfaceLow}"/>${symbolPanel(item.symbol, p)}${brandAndURL(p)}${labelChip(item.label, p, chipWidth)}${textBlock(item.title, { x: 64, y: 192, size: 45, weight: 520, color: TOKENS.onSurface, lineHeight: 52, max: 29, cls: 'display' })}${textBlock('Articles', { x: 64, y: 548, size: 20, weight: 500, color: TOKENS.onSurfaceVariant, lineHeight: 0, max: 20, cls: 'title' })}</svg>`;
}

function html(svgs) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=block" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block" rel="stylesheet"><style>html,body{margin:0;width:1200px;background:${TOKENS.surfaceLow}}.card{width:1200px;height:630px;overflow:hidden}svg{display:block}svg text{font-family:'Google Sans Flex',sans-serif;font-optical-sizing:auto}.symbol{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 48}</style></head><body>${svgs.map(svg => `<div class="card">${svg}</div>`).join('')}</body></html>`;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function socket(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
  });
  return {
    send(method, params = {}) {
      const requestId = ++id;
      ws.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }));
    },
    close() { ws.close(); },
  };
}

const processHandle = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const server = createServer((request, response) => {
  const file = path.join(temporary, path.basename(new URL(request.url, 'http://localhost').pathname));
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  response.end(fs.readFileSync(file));
});
await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
const serverPort = server.address().port;
try {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch (_) { await wait(100); }
  }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${Date.now()}`, { method: 'PUT' })).json();
  const client = await socket(target.webSocketDebuggerUrl);
  const items = [...pages.map(item => ({ ...item, svg: pageSVG(item) })), ...articles.map(item => ({ ...item, svg: articleSVG(item) }))];
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  const htmlPath = path.join(temporary, 'og-sheet.html');
  fs.writeFileSync(htmlPath, html(items.map(item => item.svg)));
  await client.send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/${path.basename(htmlPath)}` });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const ready = await client.send('Runtime.evaluate', { expression: `document.readyState === 'complete' && document.querySelectorAll('.card').length === ${items.length}`, returnByValue: true });
    if (ready.result.value) break;
    await wait(100);
    if (attempt === 29) throw new Error('Timed out while rendering OG sheet');
  }
  await client.send('Runtime.evaluate', { expression: `Promise.all([document.fonts.load('650 22px "Google Sans Flex"', 'Jimmy Park'), document.fonts.load('600 16px "Google Sans Flex"', 'THE WORK BEHIND THE WORK'), document.fonts.load('520 57px "Google Sans Flex"', 'Purpose first'), document.fonts.load('88px "Material Symbols Outlined"', 'article')]).then(() => true)`, awaitPromise: true, returnByValue: true });
  await client.send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true, returnByValue: true });
  const fontCheck = await client.send('Runtime.evaluate', { expression: `({google:document.fonts.check('520 45px "Google Sans Flex"'),symbols:document.fonts.check('88px "Material Symbols Outlined"')})`, returnByValue: true });
  if (!fontCheck.result.value.google || !fontCheck.result.value.symbols) throw new Error('Required Google fonts did not load: ' + JSON.stringify(fontCheck.result.value));
  await client.send('Runtime.evaluate', { expression: 'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))', awaitPromise: true, returnByValue: true });
  await wait(400);
  for (const [index, item] of items.entries()) {
    await client.send('Runtime.evaluate', { expression: `window.scrollTo(0, ${index * 630}); new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`, awaitPromise: true, returnByValue: true });
    await wait(100);
    const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, item.file), Buffer.from(screenshot.data, 'base64'));
  }
  client.close();
  console.log(`Generated ${items.length} Material 3 OG images in ${output}`);
} finally {
  await new Promise(resolve => server.close(resolve));
  processHandle.kill('SIGTERM');
  await wait(300);
  fs.rmSync(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
