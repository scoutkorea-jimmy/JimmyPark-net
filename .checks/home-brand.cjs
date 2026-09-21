// Focused regression check for the personal-brand homepage migrations.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8')
  .replace(/^import .*;\n/m, '')
  .replace(/export async function/g, 'async function');
const sandbox = { URL, TextEncoder, json: value => value, isAdmin: async () => true };
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet, oldActivities: V38_ACTIVITIES, oldHiring: V38_HIRING_CARD });', sandbox);
const copy = value => JSON.parse(JSON.stringify(value));

async function migrate(value) {
  const result = await api.get({ env: { JP_KV: { get: async () => JSON.stringify(value) } } });
  return copy(result.content);
}

(async () => {
  const defaults = copy(api.defaults);
  const old = copy(defaults);
  old.version = 37;
  old.global.brand.roleline = 'Video · Web Development · Applied AI · Global Scouting';
  old.global.footer.tagline = 'PRACTICAL WORK, MADE TO SERVE PEOPLE.';
  old.global.seo = { title: 'Jimmy Park (박지민) | Video, Web Development & Applied AI', desc: 'Jimmy Park (박지민) supports practical collaboration through video production, web development, applied AI workflows, and global Scouting communication.' };
  old.pages.home.meta = copy(old.global.seo);
  Object.assign(old.pages.home.sections.hero, {
    eyebrow: 'Video · Web Development · Applied AI',
    title: 'Clarify the purpose.\nChoose a clear path.\nBuild with care.',
    lead: 'I’m Jimmy Park. I support teams through video production, web development, applied AI, and Scouting communication, beginning with the people and purpose behind the work.',
    ctaPrimary: { label: 'Share a project brief', href: '/contact' },
    ctaGhost: { label: 'View selected work', href: '#selected' }
  });
  old.pages.home.sections.snapshot.body = 'Jimmy Park (박지민, Park Jimin) is a Korea-based video producer, education platform builder, and AI practitioner. He creates branded films and storytelling content, leads Korea Dream Path as CEO, founded BP Media, and helps teams apply AI workflows and AX in real projects — alongside international Scouting collaboration.';
  old.pages.home.sections.snapshot.detail = 'His work spans technology films, educational web series and event media, plus live learning platforms and sites for global education, Scouting media, a food cooperative, after-school program administration and a travel community. He works in Korean and English; project credits and dated Scouting roles are listed on this site.';
  Object.assign(old.pages.home.sections.activities, { eyebrow: 'How I can help', title: 'Practical support for work that matters.', items: copy(api.oldActivities) });
  old.pages.home.sections.approach.title = 'Listen carefully. Choose responsibly. Deliver for use.';
  Object.assign(old.pages.home.sections.projects, { eyebrow: 'Stay connected', title: 'Network, background, and next roles.' });
  old.pages.home.sections.projects.items[2] = copy(api.oldHiring);

  assert.deepEqual(await migrate(old), defaults, 'Recognized v37 live copy must become the current defaults');
  const custom = copy(old);
  custom.pages.home.sections.hero.title = 'My own positioning';
  custom.pages.home.sections.projects.items[2].desc = 'Custom hiring copy';
  const upgraded = await migrate(custom);
  assert.equal(upgraded.pages.home.sections.hero.title, 'My own positioning');
  assert.equal(upgraded.pages.home.sections.projects.items[2].desc, 'Custom hiring copy');
  assert.deepEqual(await migrate(upgraded), upgraded, 'Homepage migrations must be idempotent');

  const previous = copy(defaults);
  previous.version = 38;
  previous.pages.home.sections.hero.title = 'I choose the right medium—\nand carry the work through.';
  previous.pages.home.sections.hero.lead = 'I’m Jimmy Park, a Korea-based producer and builder. I begin with the people and purpose, then take the work from first brief to finished film, working platform, or practical AI workflow. The value I bring is not one tool; it is the judgment to connect the right ones.';
  assert.deepEqual(await migrate(previous), defaults, 'The exact v38 hero must migrate to the new copy');
  previous.pages.home.sections.hero.title = 'Owner-written hero';
  assert.equal((await migrate(previous)).pages.home.sections.hero.title, 'Owner-written hero');

  const v39 = copy(defaults);
  v39.version = 39;
  v39.pages.home.sections.hero.title = 'You do not need to arrive\nwith all the answers.';
  for (const item of [...v39.pages.home.sections.selected.sites, ...v39.pages.home.sections.selected.cases]) delete item.images;
  v39.pages.home.sections.selected.cases[1].image = 'https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg';
  v39.pages.home.sections.selected.cases[2].image = 'https://i.ytimg.com/vi/DJcwT3V79B0/hqdefault.jpg';
  assert.deepEqual(await migrate(v39), defaults, 'The v39 homepage must gain local hover galleries and balanced hero copy');

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const runtime = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
  assert.match(html, /Why work with Jimmy/);
  assert.match(html, /You do not need to arrive/);
  assert.match(html, /work people can understand, use, and keep using/);
  assert.equal((html.match(/case-media case-media--cycle/g) || []).length, 6);
  assert.ok(!html.includes('i.ytimg.com'), 'Homepage representative images must be local');
  assert.match(styles, /project-card:is\(:hover, :focus-within\) \.case-media--cycle img/);
  assert.match(html, /Read my articles/);
  assert.match(runtime, /See the evidence/);
  console.log('PASS: homepage positioning, v38 hero migration, custom-copy preservation and static/runtime brand links.');
})().catch(error => { console.error(error); process.exitCode = 1; });
