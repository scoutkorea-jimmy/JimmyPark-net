#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'assets', 'img', 'og');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'jimmypark-og-'));
fs.mkdirSync(output, { recursive: true });

const pages = [
  { file: 'home.png', label: 'JIMMY PARK', title: 'Purpose first.\nThe right medium.\nBuilt for use.', detail: 'Producer · Platform Builder · Applied AI Practitioner', photo: 'assets/img/jimmy-park-portrait-960.jpg', accent: '#7a1e2c' },
  { file: 'media-work.png', label: 'MEDIA WORK', title: 'Stories shaped\nfor attention\nand meaning.', detail: 'Direction · Production · Editing', photo: 'assets/img/video/samsung-keynote.jpg', accent: '#7a1e2c' },
  { file: 'dev-work.png', label: 'DEV WORK', title: 'Platforms built\nfor real use.', detail: 'Planning · Development · Operations', photo: 'assets/img/dev/korea-dream-path.jpg', accent: '#7a1e2c' },
  { file: 'lecture.png', label: 'LECTURE & LEARNING', title: 'Understanding\nbefore tools.', detail: 'Applied AI · Media · Working practice', photo: 'assets/img/portfolio/field-02.jpg', accent: '#7a1e2c' },
  { file: 'scouting.png', label: 'GLOBAL & SCOUTING', title: 'Context changes\nthe work.', detail: 'International experience · Communication · Service', photo: 'assets/img/scouting-main.jpg', accent: '#622599' },
  { file: 'contact.png', label: 'START A CONVERSATION', title: 'Bring the purpose.\nWe can find\nthe next step.', detail: 'Jimmy Park · Seoul, Korea', photo: 'assets/img/jimmy-park-portrait.jpg', accent: '#7a1e2c' },
  { file: 'articles.png', label: 'ARTICLES', title: 'Notes from\npractice.', detail: 'Media · Platforms · Applied AI · Communication', accent: '#7a1e2c' },
];

const articles = [
  ['ax-1.png', 'AX SERIES · PART 1 OF 4', 'AI Is a Genie That Only Hears What You Say', '#7a1e2c', 'prompt'],
  ['ax-2.png', 'AX SERIES · PART 2 OF 4', 'How to Divide Work Between Humans and AI', '#7a1e2c', 'handoff'],
  ['ax-3.png', 'AX SERIES · PART 3 OF 4', 'If You Send It, You Own It', '#7a1e2c', 'check'],
  ['ax-4.png', 'AX SERIES · PART 4 OF 4', 'True AX Is Not a Collection of AI Tools', '#7a1e2c', 'system'],
  ['message-1.png', 'MESSAGE IN MOTION · PART 1 OF 4', 'From Speech to Video', '#2f5a45', 'wave'],
  ['message-2.png', 'MESSAGE IN MOTION · PART 2 OF 4', 'From Long-form to Short-form', '#2f5a45', 'frames'],
  ['message-3.png', 'MESSAGE IN MOTION · PART 3 OF 4', 'The Cost of Making Meaning', '#2f5a45', 'layers'],
  ['message-4.png', 'MESSAGE IN MOTION · PART 4 OF 4', 'Media Before Message, Humans Before Media', '#2f5a45', 'people'],
  ['work-behind-1.png', 'THE WORK BEHIND THE WORK · PART 1 OF 4', 'Expertise Should Not Make People Feel Small', '#7a1e2c', 'conversation'],
  ['work-behind-2.png', 'THE WORK BEHIND THE WORK · PART 2 OF 4', 'Delivery Is a Date, Not the End of the Work', '#7a1e2c', 'manual'],
  ['work-behind-3.png', 'THE WORK BEHIND THE WORK · PART 3 OF 4', 'When Experts Are Everywhere, We Need an Eye for Connection', '#7a1e2c', 'orchestration'],
  ['work-behind-4.png', 'THE WORK BEHIND THE WORK · PART 4 OF 4', 'If People Cannot Understand It, Little Remains', '#7a1e2c', 'translation'],
].map(([file, label, title, accent, motif]) => ({ file, label, title, accent, motif }));

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

function textBlock(value, x, y, size, weight, color, lineHeight, max) {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${lines(value, max).map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${esc(line)}</tspan>`).join('')}</text>`;
}

function motif(kind, accent) {
  const pale = accent === '#622599' ? '#eee8f4' : accent === '#2f5a45' ? '#e6efe9' : '#f3e8ea';
  const base = `<rect x="820" y="0" width="380" height="630" fill="${pale}"/><circle cx="1010" cy="315" r="155" fill="none" stroke="${accent}" stroke-width="2" opacity=".28"/>`;
  const patterns = {
    prompt: '<rect x="890" y="230" width="235" height="150" rx="28" fill="#fff" stroke="' + accent + '" stroke-width="5"/><circle cx="930" cy="305" r="12" fill="' + accent + '"/><circle cx="975" cy="305" r="12" fill="' + accent + '"/><circle cx="1020" cy="305" r="12" fill="' + accent + '"/>',
    handoff: '<circle cx="925" cy="315" r="54" fill="#fff" stroke="' + accent + '" stroke-width="5"/><circle cx="1090" cy="315" r="54" fill="#fff" stroke="' + accent + '" stroke-width="5"/><path d="M980 315h55m-18-18 18 18-18 18" fill="none" stroke="' + accent + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<rect x="910" y="205" width="200" height="220" rx="24" fill="#fff" stroke="' + accent + '" stroke-width="5"/><path d="m952 315 36 36 76-92" fill="none" stroke="' + accent + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
    system: '<circle cx="1010" cy="315" r="52" fill="#fff" stroke="' + accent + '" stroke-width="5"/><g fill="#fff" stroke="' + accent + '" stroke-width="4"><circle cx="900" cy="220" r="27"/><circle cx="1120" cy="220" r="27"/><circle cx="900" cy="410" r="27"/><circle cx="1120" cy="410" r="27"/></g><g stroke="' + accent + '" stroke-width="4"><path d="M940 255 980 285M1080 255 1040 285M940 380 980 345M1080 380 1040 345"/></g>',
    wave: '<path d="M850 315c45-120 70 120 115 0s70 120 115 0 70 120 115 0" fill="none" stroke="' + accent + '" stroke-width="8" stroke-linecap="round"/>',
    frames: '<rect x="865" y="190" width="250" height="150" rx="18" fill="#fff" stroke="' + accent + '" stroke-width="5"/><rect x="935" y="300" width="180" height="120" rx="18" fill="#fff" stroke="' + accent + '" stroke-width="5"/>',
    layers: '<g fill="#fff" stroke="' + accent + '" stroke-width="5"><rect x="875" y="205" width="245" height="150" rx="20"/><rect x="905" y="245" width="245" height="150" rx="20"/><rect x="935" y="285" width="245" height="150" rx="20"/></g>',
    people: '<g fill="#fff" stroke="' + accent + '" stroke-width="5"><circle cx="930" cy="270" r="42"/><circle cx="1090" cy="270" r="42"/><path d="M860 420c12-85 128-85 140 0M1020 420c12-85 128-85 140 0"/></g>',
    conversation: '<path d="M860 215h250a28 28 0 0 1 28 28v115a28 28 0 0 1-28 28H985l-62 48 12-48h-75a28 28 0 0 1-28-28V243a28 28 0 0 1 28-28Z" fill="#fff" stroke="' + accent + '" stroke-width="5"/><path d="M890 285h190M890 325h145" stroke="' + accent + '" stroke-width="7" stroke-linecap="round"/>',
    manual: '<rect x="885" y="175" width="220" height="280" rx="18" fill="#fff" stroke="' + accent + '" stroke-width="5"/><path d="M935 245h120M935 295h120M935 345h82" stroke="' + accent + '" stroke-width="7" stroke-linecap="round"/><path d="m1045 400 28 28 58-70" fill="none" stroke="' + accent + '" stroke-width="8" stroke-linecap="round"/>',
    orchestration: '<g stroke="' + accent + '" stroke-width="5"><path d="M880 220 1010 315 1140 220M880 410l130-95 130 95" fill="none"/></g><g fill="#fff" stroke="' + accent + '" stroke-width="5"><circle cx="1010" cy="315" r="52"/><circle cx="880" cy="220" r="32"/><circle cx="1140" cy="220" r="32"/><circle cx="880" cy="410" r="32"/><circle cx="1140" cy="410" r="32"/></g>',
    translation: '<path d="M845 220h150a30 30 0 0 1 30 30v90a30 30 0 0 1-30 30h-55l-48 42 10-42h-57a30 30 0 0 1-30-30v-90a30 30 0 0 1 30-30Z" fill="#fff" stroke="' + accent + '" stroke-width="5"/><path d="M1040 265h110a30 30 0 0 1 30 30v80a30 30 0 0 1-30 30h-30l10 42-48-42h-42a30 30 0 0 1-30-30v-80a30 30 0 0 1 30-30Z" fill="#fff" stroke="' + accent + '" stroke-width="5"/>',
  };
  return base + (patterns[kind] || patterns.system);
}

function pageSVG(item) {
  const photo = item.photo ? path.join(root, item.photo) : '';
  const image = photo ? `<defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fdfcfa" stop-opacity="1"/><stop offset=".55" stop-color="#fdfcfa" stop-opacity=".86"/><stop offset="1" stop-color="#fdfcfa" stop-opacity="0"/></linearGradient><clipPath id="photo"><rect x="690" width="510" height="630"/></clipPath></defs><image href="file://${esc(photo)}" x="690" y="0" width="510" height="630" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/><rect width="930" height="630" fill="url(#fade)"/>` : motif('system', item.accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fdfcfa"/>${image}<rect x="0" width="18" height="630" fill="${item.accent}"/><rect x="70" y="72" width="58" height="58" rx="18" fill="none" stroke="${item.accent}" stroke-width="4"/>${textBlock('JP', 87, 112, 28, 700, item.accent, 0, 10)}${textBlock(item.label, 152, 107, 20, 700, item.accent, 0, 50)}${textBlock(item.title, 70, 210, 58, 700, '#171717', 65, 24)}${textBlock(item.detail, 70, 535, 22, 500, '#66615c', 30, 58)}${textBlock('jimmypark.net', 990, 570, 18, 700, item.accent, 0, 20)}</svg>`;
}

function articleSVG(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fdfcfa"/>${motif(item.motif, item.accent)}<rect x="0" width="18" height="630" fill="${item.accent}"/>${textBlock(item.label, 70, 92, 18, 700, item.accent, 0, 55)}${textBlock(item.title, 70, 188, 52, 700, '#171717', 60, 29)}${textBlock('Jimmy Park · Articles', 70, 545, 20, 500, '#66615c', 0, 30)}${textBlock('jimmypark.net', 990, 570, 18, 700, item.accent, 0, 20)}</svg>`;
}

function render(file, svg) {
  const svgPath = path.join(temporary, file.replace(/\.png$/u, '.svg'));
  const pngPath = path.join(output, file);
  fs.writeFileSync(svgPath, svg);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=1200', `--screenshot=${pngPath}`, `file://${svgPath}`], { stdio: 'ignore' });
}

try {
  for (const page of pages) render(page.file, pageSVG(page));
  for (const article of articles) render(article.file, articleSVG(article));
  console.log(`Generated ${pages.length + articles.length} OG images in ${output}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
