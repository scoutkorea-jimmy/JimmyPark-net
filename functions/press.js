import { onRequestGet as readContent } from './api/content.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';
import { renderPressProjects } from '../assets/press-view.mjs';

export async function onRequestGet(context) {
  const response = await readContent(context);
  const data = await response.json();
  const ok = response.ok && data.ok;
  const listing = ok ? renderPressProjects(data.content.pages.work.sections.photography.projects) :
    '<p>Publication records are temporarily unavailable. Please try again shortly.</p>';
  const description = 'Photography assignments by Jimmy Park and the news stories, organizational reports and brand publications featuring his work.';
  const content = '<div class="site-container press-page"><h1 class="heading page-title">Press photography</h1>' +
    '<p class="hero-lead">I photograph events for news coverage and partner publications. Each project lists my role. Headlines appear in English and link to the original stories.</p>' +
    '<div id="press-records">' + listing + '</div>' +
    '<section class="press-cta"><h2>Need photographs for an event or press coverage?</h2>' +
    '<p>Share the date, place and how the images will be used. I deliver press-ready selections promptly.</p>' +
    '<a class="btn btn-primary site-button" href="/contact">Book event photography <span class="msym" aria-hidden="true">arrow_forward</span></a></section></div>';
  const values = { TITLE: 'Press Photography | Jimmy Park', DESC: description, URL: 'https://jimmypark.net/press', TYPE: 'website',
    IMAGE: 'https://jimmypark.net/assets/img/og/media-work.png', IMAGE_ALT: 'Jimmy Park | Press photography',
    ROBOTS: ok ? '' : '<meta name="robots" content="noindex">', CONTENT: content };
  let shell = INSIGHTS_SHELL.replace('data-page="insights"', 'data-page="press"')
    .replaceAll('data-nav="press"', 'data-nav="press" aria-current="page"')
    .replace('</head>', '<link rel="stylesheet" href="/assets/press.css?v=0.32.2"></head>');
  if (new URL(context.request.url).searchParams.get('preview') === '1') {
    shell = shell.replace('</body>', '<script type="module" src="/assets/press-preview.mjs"></script></body>');
  }
  return new Response(shell.replace(/__(TITLE|DESC|URL|TYPE|IMAGE|IMAGE_ALT|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: ok ? 200 : 503, headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}
  });
}

export async function onRequestHead(context) {
  const page = await onRequestGet(context);
  return new Response(null, { status: page.status, headers: page.headers });
}
