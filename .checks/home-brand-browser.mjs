#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const origin = process.argv[2] || 'http://127.0.0.1:4173';
const port = 9328;
const processHandle = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  '--user-data-dir=/tmp/jimmypark-home-brand-chrome', 'about:blank',
], { stdio: 'ignore' });

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

try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch (_) { await wait(100); }
  }
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?${Date.now()}`, { method: 'PUT' })).json();
  const client = await socket(page.webSocketDebuggerUrl);
  for (const viewport of [{ width: 1440, height: 1000, mobile: false }, { width: 1024, height: 900, mobile: false }, { width: 840, height: 900, mobile: false }, { width: 768, height: 900, mobile: true }, { width: 390, height: 844, mobile: true }]) {
    await client.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1 });
    await client.send('Page.navigate', { url: `${origin}/` });
    await wait(900);
    const expression = `(() => { const pick = selector => { const el=document.querySelector(selector); const r=el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height, lineHeight:parseFloat(getComputedStyle(el).lineHeight) }; }; return { innerWidth, scrollWidth:document.documentElement.scrollWidth, title:document.title, hero:pick('.hero-title'), lead:pick('.hero-lead'), primary:pick('[data-href="hero.ctaPrimary.href"]'), why:document.querySelector('[data-section="activities"] .section-title').textContent.trim(), galleries:document.querySelectorAll('.selected-work-grid .case-media--cycle').length, frameCounts:Array.from(document.querySelectorAll('.selected-work-grid .case-media--cycle')).map(el => el.querySelectorAll('img').length) }; })()`;
    const result = await client.send('Runtime.evaluate', { expression, returnByValue: true });
    const value = result.result.value;
    assert.equal(value.scrollWidth, value.innerWidth, `${viewport.width}px homepage has horizontal overflow`);
    for (const [name, rect] of Object.entries({ hero: value.hero, lead: value.lead, primary: value.primary })) {
      assert.ok(rect.left >= 0 && rect.right <= value.innerWidth, `${viewport.width}px ${name} escapes the viewport`);
    }
    const heroLines = Math.round(value.hero.height / value.hero.lineHeight);
    assert.ok(heroLines >= 2 && heroLines <= 3, `${viewport.width}px hero must wrap to two or three balanced lines; got ${heroLines}`);
    assert.equal(value.galleries, 6, `${viewport.width}px homepage must keep six selected-work galleries`);
    assert.ok(value.frameCounts.every(count => count === 4), `${viewport.width}px every selected-work gallery must include one representative and three archive frames`);
    assert.match(value.title, /Producer, Platform Builder/);
    assert.match(value.why, /connect the brief/);
    const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    assert.ok(screenshot.data.length > 1000, `${viewport.width}px screenshot capture failed`);
  }
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url: `${origin}/` });
  await wait(900);
  await client.send('Runtime.evaluate', { expression: `(() => { const card=document.querySelector('.selected-work-grid .project-card'); card.scrollIntoView({block:'center'}); card.querySelector('a').focus(); })()` });
  await wait(300);
  await wait(3400);
  const cycle = await client.send('Runtime.evaluate', { expression: `Array.from(document.querySelector('.selected-work-grid .case-media--cycle').querySelectorAll('img')).map(img => Number(getComputedStyle(img).opacity))`, returnByValue: true });
  assert.ok(cycle.result.value.slice(1).some(opacity => opacity > 0.5), 'Desktop focus must advance from the representative image');
  client.close();
  console.log('PASS: 2–3 line hero wrapping and six four-frame selected-work galleries hold from 1440px to 390px; focus advances the archive.');
} finally {
  processHandle.kill('SIGTERM');
}
