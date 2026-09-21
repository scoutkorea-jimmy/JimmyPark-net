#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9342;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jimmypark-portfolio-capture-'));
const allTargets = [
  ['assets/img/dev/korea-dream-path-about.png', 'https://koreadreampath.com/about', 4200],
  ['assets/img/dev/korea-dream-path-scholarships.png', 'https://koreadreampath.com/scholarships', 4200],
  ['assets/img/dev/korea-dream-path-stories.png', 'https://koreadreampath.com/stories', 4200],
  ['assets/img/dev/bp-media-latest.png', 'https://bpmedia.net/latest', 4200],
  ['assets/img/dev/bp-media-calendar.png', 'https://bpmedia.net/calendar', 4200],
  ['assets/img/dev/bp-media-glossary.png', 'https://bpmedia.net/glossary', 4200],
  ['assets/img/dev/charmjt-about.png', 'https://charmjt.org/about', 4200],
  ['assets/img/dev/charmjt-instructor.png', 'https://charmjt.org/instructor', 4200],
  ['assets/img/dev/charmjt-products.png', 'https://charmjt.org/products', 4200],
  ['assets/img/video/ai2re-02.jpg', 'https://www.youtube-nocookie.com/embed/OmnvbFs-6Ws?autoplay=1&mute=1&controls=0&start=12', 6200],
  ['assets/img/video/ai2re-03.jpg', 'https://www.youtube-nocookie.com/embed/OmnvbFs-6Ws?autoplay=1&mute=1&controls=0&start=28', 6200],
  ['assets/img/video/ai2re-04.jpg', 'https://www.youtube-nocookie.com/embed/OmnvbFs-6Ws?autoplay=1&mute=1&controls=0&start=44', 6200],
  ['assets/img/video/daekyo-newif-02.jpg', 'https://www.youtube-nocookie.com/embed/DJcwT3V79B0?autoplay=1&mute=1&controls=0&start=8', 6200],
  ['assets/img/video/daekyo-newif-03.jpg', 'https://www.youtube-nocookie.com/embed/DJcwT3V79B0?autoplay=1&mute=1&controls=0&start=18', 6200],
  ['assets/img/video/daekyo-newif-04.jpg', 'https://www.youtube-nocookie.com/embed/DJcwT3V79B0?autoplay=1&mute=1&controls=0&start=28', 6200],
];
const targets = process.argv.includes('--video-only') ? allTargets.filter(([file]) => file.includes('/video/')) : allTargets;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
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

const browser = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, '--window-size=1280,720', 'about:blank',
], { stdio: 'ignore' });

try {
  let version;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch (_) { await wait(100); }
  }
  if (!version) throw new Error('Chrome did not start');
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?${Date.now()}`, { method: 'PUT' })).json();
  const client = await connect(page.webSocketDebuggerUrl);
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await client.send('Network.enable');
  await client.send('Network.setExtraHTTPHeaders', { headers: { Referer: 'https://jimmypark.net/' } });
  for (const [file, url, settle] of targets) {
    await client.send('Page.navigate', { url });
    await wait(settle);
    const jpeg = file.endsWith('.jpg');
    const shot = await client.send('Page.captureScreenshot', { format: jpeg ? 'jpeg' : 'png', quality: jpeg ? 84 : undefined, fromSurface: true, captureBeyondViewport: false });
    const output = path.join(root, file);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, Buffer.from(shot.data, 'base64'));
    console.log(`Captured ${file}`);
  }
  client.close();
} finally {
  browser.kill('SIGTERM');
  await wait(300);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
