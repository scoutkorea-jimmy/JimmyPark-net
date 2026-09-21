#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const origin = process.argv[2] || 'http://127.0.0.1:4173';
const port = 9331;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jimmypark-article-chrome-'));
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
  const livePath = '/insights/ai-is-a-genie-that-only-hears-what-you-say';
  for (const viewport of [{ width: 1440, height: 1000, mobile: false }, { width: 390, height: 844, mobile: true }]) {
    await client.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1 });
    await client.send('Page.navigate', { url: origin + livePath });
    await wait(900);
    const result = await client.send('Runtime.evaluate', { expression: `(() => { const cover=document.querySelector('.insight-cover img')?.getBoundingClientRect(); return { innerWidth, scrollWidth:document.documentElement.scrollWidth, cover:cover&&{left:cover.left,right:cover.right,width:cover.width}, shareCount:document.querySelectorAll('.insight-share a').length, backCount:document.querySelectorAll('.insight-back-button').length, seriesChips:document.querySelectorAll('.insight-reading > .insight-series-chips').length, og:document.querySelector('meta[property="og:image"]')?.content }; })()`, returnByValue: true });
    const value = result.result.value;
    assert.equal(value.scrollWidth, value.innerWidth, `${viewport.width}px article has horizontal overflow`);
    assert.ok(value.cover && value.cover.left >= 0 && value.cover.right <= value.innerWidth, `${viewport.width}px cover escapes the viewport`);
    assert.equal(value.shareCount, 2, `${viewport.width}px article must show two share actions`);
    assert.equal(value.backCount, 1, `${viewport.width}px article must show one view-all button`);
    assert.equal(value.seriesChips, 0, `${viewport.width}px article must not repeat series chips`);
    assert.match(value.og, /\/assets\/img\/og\/ax-1\.png\?v=0\.22\.1$/);
  }
  await client.send('Page.navigate', { url: origin + '/insights/expertise-should-not-make-people-feel-small' });
  await wait(900);
  const scheduled = await client.send('Runtime.evaluate', { expression: `(() => ({ body:Boolean(document.querySelector('.insight-body')), scheduled:Boolean(document.querySelector('.insight-scheduled')), shareCount:document.querySelectorAll('.insight-share a').length, cover:Boolean(document.querySelector('.insight-cover img')), backCount:document.querySelectorAll('.insight-back-button').length, seriesChips:document.querySelectorAll('.insight-reading > .insight-series-chips').length }))()`, returnByValue: true });
  assert.deepEqual(scheduled.result.value, { body: false, scheduled: true, shareCount: 0, cover: true, backCount: 1, seriesChips: 0 });
  client.close();
  console.log('PASS: live article cover and share controls fit at 1440px/390px; scheduled body and sharing stay private.');
} finally {
  processHandle.kill('SIGTERM');
  await wait(300);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
