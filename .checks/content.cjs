// Exercise migration and preservation without network requests or actual KV writes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8').replace(/^import .*;\n/m, '').replace(/export async function/g, 'async function');
const sandbox = { URL, TextEncoder, json: value => value, isAdmin: async () => true };
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet, put: onRequestPut, v9Seeds: V9_SEEDS, v10Seeds: V10_SEEDS, v9SiteRows: V10_SITE_ROWS, v11Seeds: V11_SEEDS, v10SiteRows: V11_SITE_ROWS, v12Seeds: V12_SEEDS, v11KdpRow: V12_KDP_ROW, v13Seeds: V13_SEEDS, v12HomeSites: V13_HOME_SITES, v12ChamRow: V13_CHAM_ROW });', sandbox);
const copy = value => JSON.parse(JSON.stringify(value));
// Documents saved before v9 kept the AI practice and AX workshop sections on Work.
const MOVED = ['vibecoding', 'lecture'];
// Documents saved before v12: v11 copy, Korea Dream Path as a client row, Insights card, and the
// early seed values (including a Korean subtitle) that were still live on 2026-09-19.
function applySeeds(legacy, seeds) {
  for (const [path, previous] of seeds) { let target = legacy; for (const key of path.slice(0, -1)) target = target[key]; target[path[path.length - 1]] = copy(previous); }
}
// Documents saved before v15: KB Life and the Korea Jamboree opening had no stills.
function asV14(doc) {
  const legacy = copy(doc);
  for (const rows of [legacy.pages.work.sections.video.cases, legacy.pages.home.sections.selected.cases]) rows.forEach(row => { if (['kb-life', 'korean-jamboree-opening'].includes(row.id)) row.image = ''; });
  legacy.version = 14;
  return legacy;
}
// Documents saved before v14: the Samsung keynote card had no still.
function asV13(doc) {
  const legacy = asV14(doc);
  for (const rows of [legacy.pages.work.sections.video.cases, legacy.pages.home.sections.selected.cases]) rows.forEach(row => { if (row.id === 'samsung-keynote') row.image = ''; });
  legacy.version = 13;
  return legacy;
}
// Documents saved before v13: no BP Media row, the cooperative without the AI detail-page story.
function asV12(doc) {
  const legacy = asV13(doc);
  applySeeds(legacy, api.v13Seeds);
  legacy.pages.home.sections.selected.sites = copy(api.v12HomeSites);
  legacy.pages.dev.sections.sites.items = legacy.pages.dev.sections.sites.items.filter(row => row.id !== 'bp-media').map(row => row.id === api.v12ChamRow.id ? copy(api.v12ChamRow) : row);
  legacy.version = 12;
  return legacy;
}
function asV11(doc) {
  const legacy = asV12(doc);
  applySeeds(legacy, api.v12Seeds);
  for (const rows of [legacy.pages.dev.sections.sites.items, legacy.pages.home.sections.selected.sites]) {
    rows.forEach((row, i) => { if (row.id === api.v11KdpRow.id) rows[i] = copy(api.v11KdpRow); });
  }
  legacy.version = 11;
  return legacy;
}
// Documents saved before v11 had no back-end details on website rows.
function asV10(doc) {
  const legacy = asV11(doc);
  for (const [path, previous] of api.v11Seeds) { let target = legacy; for (const key of path.slice(0, -1)) target = target[key]; target[path[path.length - 1]] = copy(previous); }
  legacy.pages.dev.sections.sites.items = copy(api.v10SiteRows);
  legacy.pages.home.sections.selected.sites = legacy.pages.home.sections.selected.sites.map(row => copy(api.v10SiteRows.find(old => old.id === row.id)));
  legacy.version = 10;
  return legacy;
}
// Documents saved before v10 lacked the website showcase fields and used v9 copy.
function asV9(doc) {
  const legacy = asV10(doc);
  for (const [path, previous] of api.v10Seeds) { let target = legacy; for (const key of path.slice(0, -1)) target = target[key]; target[path[path.length - 1]] = copy(previous); }
  legacy.pages.dev.sections.sites.items = copy(api.v9SiteRows);
  delete legacy.pages.dev.sections.intro.principles;
  for (const key of ['sites', 'sitesTitle', 'casesTitle']) delete legacy.pages.home.sections.selected[key];
  legacy.version = 9;
  return legacy;
}
function preV9(doc) {
  const legacy = copy(doc);
  for (const id of MOVED) legacy.pages.work.sections[id] = legacy.pages.dev.sections[id];
  legacy.pages.work.order = ['intro', 'video', 'vibecoding', 'lecture', 'photography', 'cta'];
  delete legacy.pages.dev;
  return legacy;
}
async function get(value) {
  let writes = 0;
  const result = await api.get({ env: { JP_KV: { get: async () => JSON.stringify(value), put: async () => { writes++; } } } });
  assert.equal(writes, 0, 'GET must never write KV');
  return copy(result.content);
}
(async () => {
  const defaults = copy(api.defaults);
  const oldestOrder = preV9(defaults);
  oldestOrder.version = 2;
  oldestOrder.pages.scouting.order = ['hero','why','stats','roles','international','mediaprojects','timeline','gallery','cta'];
  oldestOrder.pages.scouting.sections.timeline.items.forEach(item => { delete item.track; });
  assert.deepEqual((await get(oldestOrder)).pages.scouting.order, defaults.pages.scouting.order, 'Original v2 seed order must migrate without resetting custom orders');
  for (const version of [2, 5]) {
    const legacy = preV9(defaults); legacy.version = version;
    const home = legacy.pages.home.sections, work = legacy.pages.work.sections, sc = legacy.pages.scouting.sections;
    delete sc.travel; legacy.pages.scouting.order = ['cta', ...legacy.pages.scouting.order.filter(id => id !== 'cta' && id !== 'travel')];
    delete work.video.cases; delete work.video.casesTitle; delete work.photography.portfolio; delete work.photography.portfolioNote;
    home.projects.items[2] = { title: 'Jamboree D-count', desc: 'An old campaign', tag: 'Campaign', href: '/scouting', image: '' };
    work.vibecoding.items[1] = { slug: 'jamboree-dcount', title: 'Jamboree D-count', desc: 'Campaign participation page', status: 'Live', accent: 'burgundy', image: '' };
    sc.mediaprojects.items.push({ title: 'Jamboree D-count', desc: 'Old countdown' });
    if (version === 2) sc.timeline.items.forEach(item => { delete item.track; });
    sc.timeline.items.push({ year: '2026–', track: version === 2 ? '' : 'Leader', title: 'Scout Tour Assistant · Jamboree D-count experiments', context: 'Jamboree D-count', accent: 'green' });
    legacy.global.contact.email = 'custom@example.test'; home.hero.image = '/custom-portrait.jpg'; home.hero.title = 'Custom headline';
    work.vibecoding.items[0].desc = 'Custom beta description'; sc.roles.items[0].title = 'Custom role'; legacy.pages.scouting.hidden = ['gallery'];
    const result = await get(legacy);
    assert.equal(result.version, 15);
    assert.equal(result.pages.work.sections.video.cases.length, defaults.pages.work.sections.video.cases.length);
    assert.equal(result.pages.scouting.sections.travel.items.length, 19);
    assert.match(result.pages.work.sections.photography.portfolio.href, /^https:\/\/drive\.google\.com\/drive\/folders\//);
    assert.ok(!/Jamboree D-count|jamboree-dcount/.test(JSON.stringify(result)));
    assert.equal(result.pages.dev.sections.vibecoding.items[1].title, 'K-TrainRadar24');
    assert.equal(result.pages.dev.sections.vibecoding.items[0].desc, 'Custom beta description');
    assert.equal(result.pages.work.sections.vibecoding, undefined);
    assert.deepEqual(result.pages.dev.sections.sites, defaults.pages.dev.sections.sites);
    assert.deepEqual(result.global.contact, legacy.global.contact);
    assert.deepEqual(result.pages.home.sections.hero, home.hero);
    assert.deepEqual(result.pages.scouting.sections.roles, sc.roles);
    assert.deepEqual(result.pages.scouting.hidden, ['gallery']);
    assert.equal(result.pages.scouting.order[0], 'cta');
    assert.deepEqual(await get(result), result, 'v9 normalization must be idempotent');
  }
  const legacy6 = {
  "version": 6,
  "global": {
    "brand": {
      "name": "Jimmy Park",
      "roleline": "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator"
    },
    "footer": {
      "tagline": "SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.",
      "copyright": "© 2026 Jimmy Park"
    },
    "contact": {
      "email": "scoutkorea@kakao.com",
      "phone": "010.5418.6124",
      "linkedin": "https://www.linkedin.com/in/jimmy1420",
      "location": "Korea · Korean / English"
    },
    "seo": {
      "title": "Jimmy Park | Content Strategy, AI & AX Consulting",
      "desc": "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration."
    }
  },
  "pages": {
    "home": {
      "meta": {
        "title": "Jimmy Park | Content Strategy, AI & AX Consulting",
        "desc": "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration."
      },
      "order": [
        "hero",
        "activities",
        "snapshot",
        "projects",
        "approach",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "hero": {
          "eyebrow": "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator",
          "title": "Content with purpose.\nAI put to work.",
          "lead": "I plan content, build with AI, and help teams explore better ways of working — with a global network rooted in Scouting and Asia-Pacific collaboration.",
          "ctaPrimary": {
            "label": "Explore my work",
            "href": "/work"
          },
          "ctaGhost": {
            "label": "Discuss a project",
            "href": "/contact"
          },
          "image": "/assets/img/jimmy-park-portrait.jpg?v=0.5.1",
          "badge": "Jimmy Park",
          "caption": "Content, technology, and people.",
          "captionRight": "Based in Korea"
        },
        "snapshot": {
          "rows": [
            {
              "label": "Content & media",
              "value": "BP Media · Founder, 2026–"
            },
            {
              "label": "Asia-Pacific",
              "value": "Communications & Partnerships · 2nd Vice Chair, 2025–2028"
            },
            {
              "label": "International fieldwork",
              "value": "25th World Scout Jamboree · Korean Contingent Media, 2023"
            },
            {
              "label": "Based in",
              "value": "Korea · Korean / English"
            }
          ]
        },
        "activities": {
          "eyebrow": "Four ways I contribute",
          "title": "From the first idea to work people can use.",
          "items": [
            {
              "kicker": "01 / Content",
              "title": "Content Strategy",
              "desc": "Turn a communication goal into a clear message, the right format, and a plan for production and distribution.",
              "tags": [
                "Editorial planning",
                "Campaigns",
                "Video & media"
              ],
              "href": "/work#video",
              "accent": "burgundy"
            },
            {
              "kicker": "02 / AI",
              "title": "AI in Practice",
              "desc": "Use AI to turn ideas into campaign pages, content tools, and working prototypes built around real project needs.",
              "tags": [
                "Prototyping",
                "Content tools",
                "AI workflows"
              ],
              "href": "/work#vibecoding",
              "accent": "burgundy"
            },
            {
              "kicker": "03 / AX",
              "title": "AX Consulting",
              "desc": "Explore AI transformation from the work itself: identify useful opportunities, test a focused workflow, and help a team take its next step.",
              "tags": [
                "Workflow review",
                "Pilot design",
                "Workshops"
              ],
              "href": "/work#lecture",
              "accent": "burgundy"
            },
            {
              "kicker": "04 / Global",
              "title": "Global Collaboration",
              "desc": "Bring Scouting experience, Asia-Pacific relationships, and international event media work to projects that connect people across borders.",
              "tags": [
                "Asia-Pacific",
                "Scouting",
                "Partnerships"
              ],
              "href": "/scouting#roles",
              "accent": "green"
            }
          ]
        },
        "approach": {
          "eyebrow": "How we can work together",
          "title": "Start with the work. Build a useful next step.",
          "steps": [
            {
              "num": "01",
              "title": "Understand",
              "desc": "Clarify the audience, the goal, and the way work happens today."
            },
            {
              "num": "02",
              "title": "Design",
              "desc": "Choose the message, format, or AI use case that fits the need."
            },
            {
              "num": "03",
              "title": "Make & test",
              "desc": "Produce the content or build a small pilot, then review it with the people who will use it."
            },
            {
              "num": "04",
              "title": "Put it to use",
              "desc": "Prepare the output, guidance, and next steps for the team."
            }
          ]
        },
        "projects": {
          "eyebrow": "Selected Projects",
          "title": "Where the work takes shape.",
          "feature": {
            "badge": "Content strategy · Global Scouting",
            "sub": "Founder · Scouting media",
            "title": "BP Media",
            "desc": "A Scouting media platform bringing stories, events, and people into a shared editorial space. My work connects field documentation with content planning and international perspectives.",
            "href": "/scouting#mediaprojects",
            "image": ""
          },
          "items": [
            {
              "tag": "Content · Education",
              "title": "Korea Dream Path",
              "desc": "An education and youth-growth initiative connecting content, learning, and global collaboration.",
              "href": "/work#video",
              "image": ""
            },
            {
              "tag": "AI practice · Prototype",
              "title": "Scout Tour Assistant",
              "desc": "A map-based prototype that organizes meaningful Scouting places into an explorable resource.",
              "href": "/work#vibecoding",
              "image": ""
            },
            {
              "tag": "Web · Transport data",
              "title": "K-TrainRadar24",
              "desc": "A map that estimates train positions across South Korea using published timetables and public rail data.",
              "href": "https://scoutingapp.net/ktrainrader24/",
              "image": ""
            }
          ]
        },
        "cta": {
          "title": "What are you working on?",
          "body": "A content challenge, an AI idea, a team workflow, or an international project — let’s work out a useful next step.",
          "button": {
            "label": "Discuss a project",
            "href": "/contact"
          }
        }
      }
    },
    "work": {
      "sections": {
        "video": {
          "kicker": "01 / Content strategy",
          "title": "Plan the story. Shape the content.",
          "sub": "From communication goals to production and distribution",
          "desc": "I translate a project’s purpose into an audience, a message, and a format. From campaign concepts to interviews and short-form video, I plan how the content will be made and where it will be used.",
          "formats": [
            {
              "name": "Promotion",
              "desc": "For institutions, brands, projects"
            },
            {
              "name": "Event Film",
              "desc": "For records and highlights"
            },
            {
              "name": "Interview",
              "desc": "For people-centered stories"
            },
            {
              "name": "IR / PR",
              "desc": "For institutional communication"
            },
            {
              "name": "Campaign",
              "desc": "For message-driven content"
            },
            {
              "name": "Short-form",
              "desc": "For social media distribution"
            }
          ],
          "caption": "Content planning · Production · Distribution",
          "casesTitle": "Selected video work",
          "cases": [
            {
              "id": "ai2re",
              "title": "AI2RE by SPAID",
              "year": "2025",
              "role": "Planning & Direction Lead",
              "desc": "CES Innovation Award promotional film for AI2RE.",
              "href": "https://www.youtube.com/watch?v=OmnvbFs-6Ws",
              "image": "https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg",
              "format": "Technology · Promotional film",
              "linkLabel": "Watch film"
            },
            {
              "id": "manas",
              "title": "MANAS — Intelligent Navigation Support System",
              "year": "2024",
              "role": "Planning & Direction Lead",
              "desc": "A promotional film created for use at SMM in Hamburg, Germany.",
              "href": "https://www.youtube.com/watch?v=As1BN53BpFY",
              "image": "https://i.ytimg.com/vi/As1BN53BpFY/hqdefault.jpg",
              "format": "Maritime technology · Exhibition",
              "linkLabel": "Watch film"
            },
            {
              "id": "daekyo",
              "title": "Daekyo Newif · Jangsuhae",
              "year": "2024",
              "role": "Direction, Production & Editing Lead",
              "desc": "TV commercial for Daekyo Newif’s Jangsuhae deep-sea water.",
              "href": "https://www.youtube.com/watch?v=DJcwT3V79B0",
              "image": "https://i.ytimg.com/vi/DJcwT3V79B0/hqdefault.jpg",
              "format": "Brand · TV commercial",
              "linkLabel": "Watch film"
            },
            {
              "id": "kb-life",
              "title": "KB Life · Hashtag Interviews",
              "year": "",
              "role": "Lead Filming & Editing",
              "desc": "A branded interview series sharing people’s stories and perspectives on life.",
              "href": "https://www.youtube.com/playlist?list=PL7K0gdyN-9BQjyWAFqmtk9vfBv8qwmyuE",
              "image": "",
              "format": "Brand · Interview series",
              "linkLabel": "View playlist"
            },
            {
              "id": "military-concert",
              "title": "12th Infantry Division · 69th Anniversary Concert",
              "year": "2021",
              "role": "Video Direction, Filming & Editing Lead",
              "desc": "Military band concert film for the division’s 69th anniversary.",
              "href": "https://youtu.be/36-q294zBtQ",
              "image": "https://i.ytimg.com/vi/36-q294zBtQ/hqdefault.jpg",
              "format": "Live event · Concert",
              "linkLabel": "Watch film"
            },
            {
              "id": "inha-mun",
              "title": "Inha Model United Nations",
              "year": "2019",
              "role": "Lead Filming & Editing",
              "desc": "Event sketch and closing film for the first Inha University Model UN.",
              "href": "https://youtu.be/HCb285yis9M",
              "image": "https://i.ytimg.com/vi/HCb285yis9M/hqdefault.jpg",
              "format": "University · Event film",
              "linkLabel": "Watch film"
            }
          ]
        }
      }
    }
  }
};
  const refreshed = await get(legacy6);
  assert.equal(refreshed.version, 15);
  assert.deepEqual(refreshed.pages.work.order, defaults.pages.work.order);
  assert.deepEqual(refreshed.pages.dev.order, defaults.pages.dev.order);
  assert.deepEqual(refreshed.pages.home.sections.activities.items, defaults.pages.home.sections.activities.items);
  assert.ok(!/\/work#(?:vibecoding|lecture)/.test(JSON.stringify(refreshed)), 'Links must follow the moved sections');
  assert.equal(refreshed.pages.work.sections.video.cases.length, 10);
  assert.equal(refreshed.pages.home.sections.selected.cases.length, 3);
  assert.deepEqual(refreshed.pages.home.order, defaults.pages.home.order);
  assert.match(refreshed.pages.home.sections.snapshot.body, /박지민/);
  assert.equal(refreshed.pages.work.sections.video.portfolio.href, defaults.pages.work.sections.video.portfolio.href);
  assert.deepEqual(await get(refreshed), refreshed);
  const customized6 = copy(legacy6);
  customized6.pages.home.sections.hero.lead = 'Custom positioning';
  customized6.pages.home.sections.projects.items[0].desc = 'Custom project';
  customized6.pages.home.sections.projects.feature.desc = 'Custom feature';
  customized6.pages.work.sections.video.cases[0].role = 'Custom credit';
  customized6.pages.home.order = ['cta', ...customized6.pages.home.order.filter(x => x !== 'cta')];
  customized6.pages.home.hidden = ['projects'];
  const preserved = await get(customized6);
  assert.equal(preserved.pages.home.sections.hero.lead, 'Custom positioning');
  assert.equal(preserved.pages.home.sections.projects.items[0].desc, 'Custom project');
  assert.equal(preserved.pages.home.sections.projects.feature.desc, 'Custom feature');
  const v15Stills = { 'kb-life': '/assets/img/video/kb-life.jpg', 'korean-jamboree-opening': '/assets/img/video/korean-jamboree-opening.jpg' };
  assert.deepEqual(preserved.pages.work.sections.video.cases, customized6.pages.work.sections.video.cases.map(row => v15Stills[row.id] && !row.image ? { ...row, image: v15Stills[row.id] } : row), 'Custom credits stay; only empty stills are filled');
  assert.equal(preserved.pages.home.order[0], 'cta');
  assert.deepEqual(preserved.pages.home.hidden, ['projects']);
  const customLink6 = copy(legacy6);
  customLink6.pages.home.sections.hero.ctaPrimary.label = 'See my work';
  customLink6.pages.home.sections.hero.ctaGhost.href = '/custom-destination';
  const links = (await get(customLink6)).pages.home.sections.hero;
  assert.deepEqual(links.ctaPrimary, customLink6.pages.home.sections.hero.ctaPrimary, 'Custom CTA label must preserve its destination');
  assert.deepEqual(links.ctaGhost, customLink6.pages.home.sections.hero.ctaGhost, 'Custom CTA URL must preserve its label');
  const empty6 = copy(legacy6); empty6.pages.work.sections.video.cases = [];
  assert.deepEqual((await get(empty6)).pages.work.sections.video.cases, []);
  const retiredV4 = preV9(defaults); retiredV4.version = 4;
  retiredV4.pages.work.sections.vibecoding.items.push({slug:'card-news', title:'Card News Generator', desc:'Content production tool'}, {slug:'bp-media-tools', title:'BP Media Tools', desc:'Media operation support'});
  assert.equal((await get(retiredV4)).pages.dev.sections.vibecoding.items.length, 2, 'Retired legacy fields cannot crash migration');
  const oldProjectLabels = copy(defaults); oldProjectLabels.version = 2;
  oldProjectLabels.pages.home.sections.projects.items = [{"tag": "Education · Strategy · Video", "title": "Korea Dream Path", "desc": "A Life Learning Initiative for education, youth growth, and global collaboration.", "descKo": "교육 · 청소년 성장 · 국제 협력", "href": "/work", "image": ""}, {"tag": "Scouting · Web Prototype", "title": "Scout Tour Assistant", "desc": "A map-based prototype for meaningful Scouting places worldwide.", "descKo": "스카우트 장소 지도 프로토타입", "href": "/scouting", "image": ""}, {"tag": "Campaign · Scouting", "title": "Jamboree D-count", "desc": "A participation campaign page for the 16th Korea Jamboree countdown.", "descKo": "제16회 한국잼버리 캠페인", "href": "/scouting", "image": ""}];
  const labels = (await get(oldProjectLabels)).pages.home.sections.projects.items;
  assert.deepEqual(labels, defaults.pages.home.sections.projects.items, 'Old project names must not be mixed with new network destinations');
  const historical = copy(legacy6); historical.version = 2;
  historical.pages.home.sections.hero.ctaPrimary = { label: 'View Work', href: '/work' };
  historical.pages.home.sections.hero.ctaGhost = { label: 'Contact', href: '/contact' };
  const historicalResult = await get(historical);
  assert.deepEqual(historicalResult.pages.home.sections.hero.ctaPrimary, defaults.pages.home.sections.hero.ctaPrimary);
  assert.deepEqual(historicalResult.pages.home.sections.hero.ctaGhost, defaults.pages.home.sections.hero.ctaGhost);
  historical.pages.home.sections.hero.ctaPrimary.href = '/my-custom-work';
  assert.deepEqual((await get(historical)).pages.home.sections.hero.ctaPrimary, historical.pages.home.sections.hero.ctaPrimary);
  const removed = preV9(defaults); removed.version = 7;
  removed.pages.work.sections.vibecoding.items.push({ slug: 'card-news', title: 'Card News Generator' }, { slug: 'bp-media-tools', title: 'Custom tools title' });
  removed.pages.work.sections.vibecoding.items[0].href = '';
  const revised = await get(removed);
  assert.equal(revised.pages.dev.sections.vibecoding.items.length, 2);
  assert.equal(revised.pages.dev.sections.vibecoding.items[0].href, 'https://scoutingapp.net/tour/');
  assert.equal(revised.pages.scouting.sections.hero.image, '/assets/img/scouting-main.jpg?v=0.10.0');
  const edited = copy(defaults); edited.pages.scouting.sections.travel.items = []; edited.pages.work.sections.video.cases = []; edited.pages.work.sections.photography.portfolio.href = '';
  assert.deepEqual(await get(edited), edited, 'Explicit current-schema empty values must remain editable');

  // v8 → v9: Work splits into Media Work (/work) and Dev Work (/dev).
  const v8 = preV9(asV9(defaults)); v8.version = 8;
  for (const [path, previous] of api.v9Seeds) { let target = v8; for (const key of path.slice(0, -1)) target = target[key]; target[path[path.length - 1]] = copy(previous); }
  assert.deepEqual(await get(v8), defaults, 'An unchanged v8 document must upgrade to the current defaults');
  const custom8 = copy(v8);
  custom8.pages.work.sections.vibecoding.title = 'Custom AI title';
  custom8.pages.work.sections.vibecoding.items.push({ slug: 'custom-tool', title: 'Custom tool', desc: 'Mine', status: 'Beta', accent: 'neutral', image: '', href: 'https://example.test/' });
  custom8.pages.work.sections.lecture.topics = [];
  custom8.pages.work.sections.intro.title = 'Custom work headline';
  custom8.pages.work.hidden = ['lecture', 'photography'];
  custom8.pages.work.order = ['intro', 'lecture', 'photography', 'vibecoding', 'video', 'cta'];
  custom8.pages.home.sections.activities.items[1].title = 'Custom capability';
  const split = await get(custom8);
  assert.equal(split.pages.dev.sections.vibecoding.title, 'Custom AI title');
  assert.equal(split.pages.dev.sections.vibecoding.items.at(-1).title, 'Custom tool');
  assert.deepEqual(split.pages.dev.sections.lecture.topics, []);
  assert.equal(split.pages.work.sections.intro.title, 'Custom work headline');
  assert.equal(split.pages.work.sections.vibecoding, undefined);
  assert.equal(split.pages.work.sections.lecture, undefined);
  assert.deepEqual(split.pages.work.hidden, ['photography']);
  assert.deepEqual(split.pages.dev.hidden, ['lecture']);
  assert.deepEqual(split.pages.work.order, ['intro', 'photography', 'video', 'cta']);
  assert.deepEqual(split.pages.dev.order, ['intro', 'sites', 'lecture', 'vibecoding', 'cta']);
  assert.equal(split.pages.home.sections.activities.items[1].title, 'Custom capability');
  assert.equal(split.pages.home.sections.activities.items[1].href, '/dev#vibecoding');
  assert.equal(split.pages.home.sections.activities.items[2].href, '/dev#lecture');
  assert.deepEqual(split.pages.dev.sections.sites, defaults.pages.dev.sections.sites);
  assert.equal(split.pages.dev.sections.sites.items[0].title, 'Korea Dream Path', 'Korea Dream Path leads the website portfolio');
  assert.deepEqual(await get(split), split, 'v9 normalization must be idempotent');

  // v9 → v10: solution-maker copy, website showcase fields and +82 phone.
  const v9 = asV9(defaults);
  assert.deepEqual(await get(v9), defaults, 'An unchanged v9 document must upgrade to the v10 defaults');
  const custom9 = asV9(defaults);
  custom9.pages.dev.sections.sites.items[1] = { ...custom9.pages.dev.sections.sites.items[1], desc: 'Custom site description' };
  custom9.pages.dev.sections.sites.items.push({ id: 'mine', title: 'My site', format: 'Custom', year: '', role: 'Build', desc: 'Mine', stack: '', href: 'https://example.test/', linkLabel: 'Visit', image: '' });
  custom9.global.contact.phone = '010.1234.5678';
  custom9.pages.home.sections.hero.title = 'Custom headline';
  custom9.pages.contact.sections.intro.lead = 'Custom contact lead';
  const upgraded = await get(custom9);
  assert.equal(upgraded.version, 15);
  assert.deepEqual(upgraded.pages.dev.sections.sites.items[0], defaults.pages.dev.sections.sites.items[0], 'Unchanged v9 rows gain the showcase fields');
  const customRow = upgraded.pages.dev.sections.sites.items.find(row => row.id === 'charmjt');
  assert.equal(customRow.backend, '', 'Custom rows must not inherit another site’s back-end list');
  assert.equal(customRow.summary, 'Custom site description');
  assert.equal(customRow.need, '');
  assert.equal(customRow.built, '');
  assert.equal(customRow.mobileImage, '');
  assert.equal(customRow.image, custom9.pages.dev.sections.sites.items[1].image);
  assert.deepEqual(upgraded.pages.dev.sections.sites.items.at(-1), { id: 'mine', title: 'My site', format: 'Custom', year: '', role: 'Build', summary: 'Mine', need: '', built: '', stack: '', backend: '', stats: '', href: 'https://example.test/', linkLabel: 'Visit', image: '', mobileImage: '', adminImage: '', adminCaption: '' });
  assert.equal(upgraded.global.contact.phone, '010.1234.5678');
  assert.equal(upgraded.pages.home.sections.hero.title, 'Custom headline');
  assert.equal(upgraded.pages.contact.sections.intro.lead, 'Custom contact lead');
  assert.equal(upgraded.pages.home.sections.hero.lead, defaults.pages.home.sections.hero.lead);
  assert.deepEqual(upgraded.pages.home.sections.selected.sites, defaults.pages.home.sections.selected.sites);
  assert.deepEqual(await get(upgraded), upgraded, 'v10 normalization must be idempotent');
  assert.equal(defaults.global.contact.phone, '+82 10.5418.6124');

  // v10 → v11: website rows gain back-end features, facts and admin screenshots.
  assert.deepEqual(await get(asV10(defaults)), defaults, 'An unchanged v10 document must upgrade to the v11 defaults');
  const custom10 = asV10(defaults);
  custom10.pages.dev.sections.sites.items[2].summary = 'Custom nfee summary';
  custom10.pages.home.sections.selected.sites[0].title = 'Custom home card';
  const backed = await get(custom10);
  assert.equal(backed.version, 15);
  const nfee = backed.pages.dev.sections.sites.items.find(row => row.id === 'nfee');
  assert.equal(nfee.summary, 'Custom nfee summary');
  assert.equal(nfee.backend, '');
  assert.equal(nfee.adminImage, '');
  assert.deepEqual(backed.pages.dev.sections.sites.items[0], defaults.pages.dev.sections.sites.items[0]);
  assert.equal(backed.pages.home.sections.selected.sites[0].title, 'Custom home card');
  assert.equal(backed.pages.home.sections.selected.sites[0].backend, '');
  assert.deepEqual(backed.pages.home.sections.selected.sites.find(row => row.id === 'charmjt'), defaults.pages.dev.sections.sites.items.find(row => row.id === 'charmjt'), 'Unchanged home rows gain the current details');
  assert.match(defaults.pages.dev.sections.sites.items[0].backend, /\n/);
  assert.deepEqual(await get(backed), backed, 'v11 normalization must be idempotent');

  // v11 → v12: own-platform Korea Dream Path, recent films on Home, no Insights card, stale early seeds.
  const v11 = asV11(defaults);
  assert.match(v11.pages.dev.sections.vibecoding.sub, /[가-힣]/, 'Fixture reproduces the live Korean subtitle');
  assert.deepEqual(await get(v11), defaults, 'An unchanged or early-seed v11 document must upgrade to the v12 defaults');
  const custom11 = asV11(defaults);
  custom11.pages.dev.sections.vibecoding.sub = 'Custom tools subtitle';
  custom11.pages.work.meta.desc = 'Custom work description';
  custom11.pages.home.sections.selected.cases = custom11.pages.home.sections.selected.cases.slice(0, 1);
  custom11.pages.dev.sections.sites.items[0] = { ...custom11.pages.dev.sections.sites.items[0], summary: 'Custom KDP summary' };
  const owned = await get(custom11);
  assert.equal(owned.version, 15);
  assert.equal(owned.pages.dev.sections.vibecoding.sub, 'Custom tools subtitle');
  assert.equal(owned.pages.work.meta.desc, 'Custom work description');
  assert.equal(owned.pages.home.sections.selected.cases.length, 1);
  assert.equal(owned.pages.dev.sections.sites.items[0].summary, 'Custom KDP summary');
  assert.equal(owned.pages.home.sections.selected.sites[0].role, defaults.pages.home.sections.selected.sites[0].role, 'Unchanged home KDP card becomes the own-platform row');
  assert.ok(!JSON.stringify(defaults.pages.home.sections.projects.items).includes('/insights'), 'Insights leaves the home cards until it has posts');
  assert.deepEqual(defaults.pages.home.sections.selected.cases.map(item => item.id), ['samsung-keynote', 'ai2re', 'daekyo']);
  assert.deepEqual(await get(owned), owned, 'v12 normalization must be idempotent');

  // v12 → v13: BP Media joins the showcase; the cooperative row gains the AI detail-page story.
  assert.deepEqual(await get(asV12(defaults)), defaults, 'An unchanged v12 document must upgrade to the v13 defaults');
  const custom12 = asV12(defaults);
  custom12.pages.dev.sections.sites.items.push({ ...custom12.pages.dev.sections.sites.items[0], id: 'mine', title: 'Mine', href: 'https://example.test/' });
  custom12.pages.dev.sections.sites.items.reverse();
  custom12.pages.home.sections.selected.sites = custom12.pages.home.sections.selected.sites.slice(0, 2);
  const media = await get(custom12);
  assert.equal(media.version, 15);
  const ids = media.pages.dev.sections.sites.items.map(row => row.id);
  assert.equal(ids.filter(id => id === 'bp-media').length, 1, 'BP Media is added exactly once');
  assert.equal(ids.indexOf('bp-media'), ids.indexOf('korea-dream-path') + 1, 'BP Media follows Korea Dream Path in a custom order');
  assert.equal(media.pages.home.sections.selected.sites.length, 2, 'A curated home list is left alone');
  assert.match(media.pages.dev.sections.sites.items.find(row => row.id === 'charmjt').summary, /AI/);
  assert.deepEqual(await get(media), media, 'v13 normalization must be idempotent');
  const listedAlready = asV12(defaults);
  listedAlready.pages.dev.sections.sites.items.push({ ...listedAlready.pages.dev.sections.sites.items[0], id: 'my-bp', title: 'My BP', href: 'https://bpmedia.net/' });
  assert.equal((await get(listedAlready)).pages.dev.sections.sites.items.filter(row => /bpmedia\.net/.test(row.href)).length, 1, 'An owner-listed BP Media row is not duplicated');

  // v13 → v14: the Samsung card gains its keynote still; an uploaded image stays.
  assert.deepEqual(await get(asV13(defaults)), defaults, 'An unchanged v13 document must upgrade to the v14 defaults');
  const uploaded = asV13(defaults);
  uploaded.pages.work.sections.video.cases.find(row => row.id === 'samsung-keynote').image = '/api/image?id=owner-upload';
  const stills = await get(uploaded);
  assert.equal(stills.version, 15);
  assert.equal(stills.pages.work.sections.video.cases.find(row => row.id === 'samsung-keynote').image, '/api/image?id=owner-upload');
  assert.equal(stills.pages.home.sections.selected.cases.find(row => row.id === 'samsung-keynote').image, '/assets/img/video/samsung-keynote.jpg');
  assert.deepEqual(await get(stills), stills, 'v14 normalization must be idempotent');

  // v14 → v15: KB Life and the Korea Jamboree opening gain stills; uploaded images stay.
  assert.deepEqual(await get(asV14(defaults)), defaults, 'An unchanged v14 document must upgrade to the v15 defaults');
  const kbUpload = asV14(defaults);
  kbUpload.pages.work.sections.video.cases.find(row => row.id === 'kb-life').image = '/api/image?id=kb-upload';
  const filled = await get(kbUpload);
  assert.equal(filled.version, 15);
  assert.equal(filled.pages.work.sections.video.cases.find(row => row.id === 'kb-life').image, '/api/image?id=kb-upload');
  assert.equal(filled.pages.work.sections.video.cases.find(row => row.id === 'korean-jamboree-opening').image, '/assets/img/video/korean-jamboree-opening.jpg');
  assert.ok(defaults.pages.work.sections.video.cases.every(row => row.image), 'Every video card has a still');
  console.log('PASS: v2/v5/v6/v8/v9/v10/v11/v12/v13/v14 to v15 migrations, video stills, BP Media showcase, own-platform KDP, stale early seeds and Korean subtitle, website back-end details, showcase fields, +82 phone, Work → Media/Dev split with custom sections, visibility, order and links, retired project removal, additive evidence, empty edits, idempotence and no GET writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
