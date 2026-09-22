#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const origin = process.argv[2] || 'http://127.0.0.1:4173';
const port = 9328;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jimmypark-home-brand-'));
const processHandle = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, 'about:blank',
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

  for (const check of [
    { path: '/work.html', selector: '.video-case .case-media--cycle', expected: 6, link: '.video-case .card-link' },
    { path: '/dev.html', selector: '.site-showcase .browser-screen.case-media--cycle', expected: 3, link: '.site-showcase .site-button' },
  ]) {
    await client.send('Page.navigate', { url: `${origin}${check.path}` });
    await wait(900);
    const galleries = await client.send('Runtime.evaluate', { expression: `document.querySelectorAll(${JSON.stringify(check.selector)}).length`, returnByValue: true });
    assert.equal(galleries.result.value, check.expected, `${check.path} must show the saved preview galleries`);
    await client.send('Runtime.evaluate', { expression: `(() => { const card=document.querySelector(${JSON.stringify(check.selector)}).closest('.project-card, .site-showcase'); card.scrollIntoView({block:'center'}); card.querySelector(${JSON.stringify(check.link)}).focus(); })()` });
    await wait(3400);
    const pageCycle = await client.send('Runtime.evaluate', { expression: `Array.from(document.querySelector(${JSON.stringify(check.selector)}).querySelectorAll('img')).map(img => Number(getComputedStyle(img).opacity))`, returnByValue: true });
    assert.ok(pageCycle.result.value.slice(1).some(opacity => opacity > 0.5), `${check.path} focus must advance from the representative image`);
  }
  client.close();
  console.log('PASS: responsive homepage plus full Work and Dev preview galleries render and advance on focus.');
} finally {
  processHandle.kill('SIGTERM');
  await new Promise(resolve => {
    if (processHandle.exitCode !== null) return resolve();
    processHandle.once('exit', resolve);
    setTimeout(resolve, 1000);
  });
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
