// Exercise migration and preservation without network requests or actual KV writes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8').replace(/^import .*;\n/m, '').replace(/export async function/g, 'async function');
const sandbox = { json: value => value, isAdmin: async () => true };
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet, put: onRequestPut });', sandbox);
const copy = value => JSON.parse(JSON.stringify(value));
async function get(value) {
  let writes = 0;
  const result = await api.get({ env: { JP_KV: { get: async () => JSON.stringify(value), put: async () => { writes++; } } } });
  assert.equal(writes, 0, 'GET must never write KV');
  return copy(result.content);
}
(async () => {
  const defaults = copy(api.defaults);
  const oldestOrder = copy(defaults);
  oldestOrder.version = 2;
  oldestOrder.pages.scouting.order = ['hero','why','stats','roles','international','mediaprojects','timeline','gallery','cta'];
  oldestOrder.pages.scouting.sections.timeline.items.forEach(item => { delete item.track; });
  assert.deepEqual((await get(oldestOrder)).pages.scouting.order, defaults.pages.scouting.order, 'Original v2 seed order must migrate without resetting custom orders');
  for (const version of [2, 5]) {
    const legacy = copy(defaults); legacy.version = version;
    const home = legacy.pages.home.sections, work = legacy.pages.work.sections, sc = legacy.pages.scouting.sections;
    delete sc.travel; legacy.pages.scouting.order = ['cta', ...legacy.pages.scouting.order.filter(id => id !== 'cta' && id !== 'travel')];
    delete work.video.cases; delete work.video.casesTitle; delete work.photography.portfolio; delete work.photography.portfolioNote;
    home.projects.items[2] = { title: 'Jamboree D-count', desc: 'An old campaign', tag: 'Campaign', href: '/scouting', image: '' };
    work.vibecoding.items[1] = { slug: 'jamboree-dcount', title: 'Jamboree D-count', desc: 'Campaign participation page', status: 'Live', accent: 'burgundy', image: '' };
    sc.mediaprojects.items.push({ title: 'Jamboree D-count', desc: 'Old countdown' });
    if (version === 2) sc.timeline.items.forEach(item => { delete item.track; });
    sc.timeline.items.push({ year: '2026–', track: version === 2 ? '' : 'Leader', title: 'Scout Tour Assistant · Jamboree D-count experiments', context: 'Jamboree D-count', accent: 'green' });
    legacy.global.contact.email = 'custom@example.test'; home.hero.image = '/custom-portrait.jpg'; home.hero.title = 'Custom headline';
    work.vibecoding.items[2].desc = 'Custom beta description'; sc.roles.items[0].title = 'Custom role'; legacy.pages.scouting.hidden = ['gallery'];
    const result = await get(legacy);
    assert.equal(result.version, 7);
    assert.equal(result.pages.work.sections.video.cases.length, defaults.pages.work.sections.video.cases.length);
    assert.equal(result.pages.scouting.sections.travel.items.length, 19);
    assert.match(result.pages.work.sections.photography.portfolio.href, /^https:\/\/drive\.google\.com\/drive\/folders\//);
    assert.ok(!/Jamboree D-count|jamboree-dcount/.test(JSON.stringify(result)));
    assert.equal(result.pages.work.sections.vibecoding.items[1].title, 'K-TrainRadar24');
    assert.equal(result.pages.work.sections.vibecoding.items[2].desc, 'Custom beta description');
    assert.deepEqual(result.global.contact, legacy.global.contact);
    assert.deepEqual(result.pages.home.sections.hero, home.hero);
    assert.deepEqual(result.pages.scouting.sections.roles, sc.roles);
    assert.deepEqual(result.pages.scouting.hidden, ['gallery']);
    assert.equal(result.pages.scouting.order[0], 'cta');
    assert.deepEqual(await get(result), result, 'v7 normalization must be idempotent');
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
  assert.equal(refreshed.version, 7);
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
  assert.deepEqual(preserved.pages.work.sections.video.cases, customized6.pages.work.sections.video.cases);
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
  const edited = copy(defaults); edited.pages.scouting.sections.travel.items = []; edited.pages.work.sections.video.cases = []; edited.pages.work.sections.photography.portfolio.href = '';
  assert.deepEqual(await get(edited), edited, 'Explicit current-schema empty values must remain editable');
  console.log('PASS: v2/v5/v6 to v7 migrations, retired project removal, additive evidence, custom values/order/visibility, empty edits, idempotence and no GET writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
