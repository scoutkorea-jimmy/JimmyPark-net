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

function titleHTML(value, max) {
  return lines(value, max).map(esc).join('<br>');
}

function brandLockup() {
  return '<div class="brand"><strong>Jimmy Park.</strong><span aria-hidden="true"></span><small>jimmypark.net</small></div>';
}

function symbolPanel(symbol) {
  return `<div class="visual symbol-panel"><div class="symbol-circle"><span class="symbol">${esc(symbol)}</span></div></div>`;
}

function pageMarkup(item) {
  const p = palette(item.color);
  let visual;
  if (item.photo) {
    const photo = path.join(root, item.photo);
    const photoURL = `data:image/jpeg;base64,${fs.readFileSync(photo).toString('base64')}`;
    visual = `<img class="visual photo" src="${photoURL}" alt="">`;
  } else visual = symbolPanel(item.symbol);
  return `<main class="card page-card" style="--accent:${p.accent};--container:${p.container};--on-container:${p.onContainer}">${visual}${brandLockup()}<div class="label">${esc(item.label)}</div><h1>${titleHTML(item.title, 22)}</h1><p class="footer">${esc(item.detail)}</p></main>`;
}

function articleMarkup(item) {
  const p = palette(item.color);
  return `<main class="card article-card" style="--accent:${p.accent};--container:${p.container};--on-container:${p.onContainer}">${symbolPanel(item.symbol)}${brandLockup()}<div class="label">${esc(item.label)}</div><h1>${titleHTML(item.title, 29)}</h1><p class="footer">Articles</p></main>`;
}

function html(markup) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=block" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block" rel="stylesheet"><style>*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:${TOKENS.surfaceLow};font-family:'Google Sans Flex',sans-serif;font-optical-sizing:auto}.card{position:relative;width:1200px;height:630px;background:${TOKENS.surfaceLow};color:${TOKENS.onSurface}}.brand{position:absolute;left:64px;top:29px;height:24px;display:flex;align-items:center;gap:17px;white-space:nowrap}.brand strong{font-size:22px;font-weight:650;line-height:24px}.brand span{width:1px;height:21px;background:${TOKENS.outlineVariant}}.brand small{font-size:14px;font-weight:500;line-height:20px;color:${TOKENS.onSurfaceVariant}}.label{position:absolute;left:64px;top:68px;display:flex;align-items:center;min-height:40px;max-width:700px;padding:0 20px;border-radius:999px;background:var(--container);color:var(--on-container);font-size:16px;font-weight:600;line-height:20px;white-space:nowrap}.card h1{position:absolute;left:64px;top:147px;width:690px;margin:0;font-weight:520;letter-spacing:0}.page-card h1{font-size:57px;line-height:64px}.article-card h1{font-size:45px;line-height:52px}.footer{position:absolute;left:64px;bottom:76px;margin:0;color:${TOKENS.onSurfaceVariant};font-size:20px;font-weight:500;line-height:28px}.visual{position:absolute;left:744px;top:32px;width:424px;height:566px}.photo{object-fit:cover;border:1px solid ${TOKENS.outlineVariant};border-radius:28px}.symbol-panel{left:824px;width:344px;border-radius:56px;background:var(--container);display:flex;align-items:center;justify-content:center}.symbol-circle{width:208px;height:208px;border-radius:999px;background:${TOKENS.surface};display:flex;align-items:center;justify-content:center}.symbol{font-family:'Material Symbols Outlined';font-size:88px;line-height:1;color:var(--on-container);font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 48}</style></head><body>${markup}</body></html>`;
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
  const items = [...pages.map(item => ({ ...item, markup: pageMarkup(item) })), ...articles.map(item => ({ ...item, markup: articleMarkup(item) }))];
  for (const item of items) {
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(item.file)}`, { method: 'PUT' })).json();
    const client = await socket(target.webSocketDebuggerUrl);
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
    const htmlPath = path.join(temporary, item.file.replace(/\.png$/u, '.html'));
    fs.writeFileSync(htmlPath, html(item.markup));
    await client.send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/${encodeURIComponent(path.basename(htmlPath))}` });
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const ready = await client.send('Runtime.evaluate', { expression: `document.readyState === 'complete' && document.body?.textContent.includes(${JSON.stringify(item.label)})`, returnByValue: true });
      if (ready.result.value) break;
      await wait(100);
      if (attempt === 29) throw new Error('Timed out while rendering ' + item.file);
    }
    await client.send('Runtime.evaluate', { expression: `Promise.all([document.fonts.load('650 22px "Google Sans Flex"', 'Jimmy Park'), document.fonts.load('500 14px "Google Sans Flex"', 'jimmypark.net'), document.fonts.load('600 16px "Google Sans Flex"', ${JSON.stringify(item.label)}), document.fonts.load('520 57px "Google Sans Flex"', ${JSON.stringify(item.title)}), document.fonts.load('88px "Material Symbols Outlined"', 'article')]).then(() => true)`, awaitPromise: true, returnByValue: true });
    await client.send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true, returnByValue: true });
    const fontCheck = await client.send('Runtime.evaluate', { expression: `({google:document.fonts.check('520 45px "Google Sans Flex"'),symbols:document.fonts.check('88px "Material Symbols Outlined"')})`, returnByValue: true });
    if (!fontCheck.result.value.google || !fontCheck.result.value.symbols) throw new Error('Required Google fonts did not load for ' + item.file + ': ' + JSON.stringify(fontCheck.result.value));
    await client.send('Runtime.evaluate', { expression: `new Promise(resolve => { document.body.style.visibility='hidden'; requestAnimationFrame(() => { document.body.style.visibility='visible'; requestAnimationFrame(() => requestAnimationFrame(resolve)); }); })`, awaitPromise: true, returnByValue: true });
    await wait(400);
    await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await wait(100);
    const screenshot = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, item.file), Buffer.from(screenshot.data, 'base64'));
    client.close();
  }
  console.log(`Generated ${items.length} Material 3 OG images in ${output}`);
} finally {
  await new Promise(resolve => server.close(resolve));
  processHandle.kill('SIGTERM');
  await wait(300);
  fs.rmSync(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
