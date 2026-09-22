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
  ['assets/img/video/yugadang-heungbu-02.jpg', 'https://www.youtube-nocookie.com/embed/LGLSqTFWIRk?autoplay=1&mute=1&controls=0&start=90', 6200],
  ['assets/img/video/yugadang-heungbu-03.jpg', 'https://www.youtube-nocookie.com/embed/LGLSqTFWIRk?autoplay=1&mute=1&controls=0&start=220', 6200],
  ['assets/img/video/yugadang-heungbu-04.jpg', 'https://www.youtube-nocookie.com/embed/LGLSqTFWIRk?autoplay=1&mute=1&controls=0&start=350', 6200],
  ['assets/img/video/yugadang-sugungga-02.jpg', 'https://www.youtube-nocookie.com/embed/VPvDYQCul9M?autoplay=1&mute=1&controls=0&start=35', 6200],
  ['assets/img/video/yugadang-sugungga-03.jpg', 'https://www.youtube-nocookie.com/embed/VPvDYQCul9M?autoplay=1&mute=1&controls=0&start=90', 6200],
  ['assets/img/video/yugadang-sugungga-04.jpg', 'https://www.youtube-nocookie.com/embed/VPvDYQCul9M?autoplay=1&mute=1&controls=0&start=125', 6200],
  ['assets/img/video/seocho-culture-2020-02.jpg', 'https://www.youtube-nocookie.com/embed/ZwaZT02tZnQ?autoplay=1&mute=1&controls=0&start=35', 6200],
  ['assets/img/video/seocho-culture-2020-03.jpg', 'https://www.youtube-nocookie.com/embed/ZwaZT02tZnQ?autoplay=1&mute=1&controls=0&start=95', 6200],
  ['assets/img/video/seocho-culture-2020-04.jpg', 'https://www.youtube-nocookie.com/embed/ZwaZT02tZnQ?autoplay=1&mute=1&controls=0&start=155', 6200],
];
// Example: --only=yugadang-heungbu,yugadang-sugungga,seocho-culture-2020
// Matching filename prefixes lets a new project be captured without overwriting existing archives.
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',').filter(Boolean);
const targets = allTargets.filter(([file]) =>
  (!process.argv.includes('--video-only') || file.includes('/video/')) &&
  (!only || only.some(prefix => path.basename(file).startsWith(`${prefix}-`)))
);
if (!targets.length) throw new Error('No capture targets matched');

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
    if (new URL(url).hostname === 'www.youtube-nocookie.com') {
      const time = Number(new URL(url).searchParams.get('start'));
      let ready = false;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        const state = await client.send('Runtime.evaluate', {
          expression: '(() => { const v = document.querySelector("video"); return Boolean(v && v.readyState >= 2 && v.videoWidth > 0 && !v.error); })()',
          returnByValue: true,
        });
        if (state.result.value) { ready = true; break; }
        await wait(500);
      }
      if (!ready) throw new Error(`Video did not become ready: ${url}`);
      const seek = await client.send('Runtime.evaluate', {
        expression: `(async () => {
          const video = document.querySelector('video');
          video.pause();
          if (Math.abs(video.currentTime - ${time}) > 0.04) video.currentTime = ${time};
          const deadline = Date.now() + 20000;
          while (video.seeking || video.readyState < 2 || Math.abs(video.currentTime - ${time}) > 0.1) {
            if (Date.now() > deadline) throw new Error('Video seek timed out');
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          const style = document.createElement('style');
          style.textContent = '.ytp-chrome-top,.ytp-chrome-bottom,.ytp-gradient-top,.ytp-gradient-bottom,.ytp-pause-overlay-container,.ytp-watermark,.ytp-bezel,.ytp-cued-thumbnail-overlay,.ytp-caption-window-container { display: none !important; }';
          document.head.appendChild(style);
          return { currentTime: video.currentTime, width: video.videoWidth, height: video.videoHeight };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });
      if (seek.exceptionDetails) throw new Error(`Video seek failed: ${JSON.stringify(seek.exceptionDetails)}`);
      console.log(`Frame ${JSON.stringify(seek.result.value)}`);
      await wait(350);
    }
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
