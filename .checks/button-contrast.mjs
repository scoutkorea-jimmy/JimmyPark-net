#!/usr/bin/env node
// Renders every public portfolio route in Chrome and rejects a visually indistinct button.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const origin = process.argv[2] || 'https://jimmypark.net';
const routes = ['/', '/work', '/dev', '/lecture', '/scouting', '/contact', '/insights', '/404'];
const viewports = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }];
const port = 9327;
const processHandle = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  '--user-data-dir=/var/folders/1v/_76xp51522g1vl67pvb_tfj80000gn/T/opencode/chrome-button-contrast', 'about:blank',
], { stdio: 'ignore' });

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
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
function rgb(value) {
  const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? match.slice(1, 4).map(Number) : null;
}
function luminance([red, green, blue]) {
  return [red, green, blue].map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
}
function ratio(foreground, background) {
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
async function main() {
  try {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch (_) { await wait(100); }
    }
    const page = await (await fetch(`http://127.0.0.1:${port}/json/new?${Date.now()}`, { method: 'PUT' })).json();
    const client = await socket(page.webSocketDebuggerUrl);
    for (const viewport of viewports) {
      await client.send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === 'mobile' });
      for (const route of routes) {
        await client.send('Page.navigate', { url: origin + route });
        await wait(1400);
        const expression = `(() => [...document.querySelectorAll('a.site-button, button.site-button, a.btn, button.btn')].map((element, index) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); const inherited = [...element.parentElement ? [element.parentElement] : [], ...element.parentElement ? [...element.parentElement.parentElement ? [element.parentElement.parentElement] : []] : []].map(parent => getComputedStyle(parent).backgroundColor).find(color => color !== 'rgba(0, 0, 0, 0)') || 'rgb(255, 255, 255)'; return { index, text: element.innerText.trim(), background: style.backgroundColor, color: style.color, inherited, width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' }; }))()`;
        const result = await client.send('Runtime.evaluate', { expression, returnByValue: true });
        for (const button of result.result.value) {
          if (!button.visible) continue;
          const foreground = rgb(button.color), background = rgb(button.background);
          assert.ok(button.width >= 40 && button.height >= 40, `${viewport.name} ${route}: button ${button.index} is smaller than 40px (${button.width}x${button.height})`);
          if (foreground && background && button.background !== 'rgba(0, 0, 0, 0)') {
            assert.ok(ratio(foreground, background) >= 4.5, `${viewport.name} ${route}: low button contrast for "${button.text || button.index}" (${button.color} on ${button.background})`);
          }
          if (foreground && background && ratio(foreground, background) < 4.5) {
            assert.ok(rgb(button.inherited) && ratio(foreground, rgb(button.inherited)) >= 4.5, `${viewport.name} ${route}: transparent button contrast is too low for "${button.text || button.index}"`);
          }
        }
        const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
        assert.ok(screenshot.data.length > 1000, `${viewport.name} ${route}: screenshot capture failed`);
      }
    }
    console.log(`PASS: button contrast, 40px targets, and Chrome pixel captures across ${routes.length} public routes at desktop and mobile widths.`);
  } finally {
    processHandle.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
