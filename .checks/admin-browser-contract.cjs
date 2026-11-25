// Verify the browser contract using fixture data and message ports, without remote requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/admin.js'), 'utf8');
function definition(start, next) {
  const left = source.indexOf('  function ' + start + '(');
  const right = source.indexOf('  function ' + next + '(', left);
  assert(left >= 0 && right > left);
  return source.slice(left, right);
}

const site = 'https://jimmypark.net';
const frame = { contentWindow: {} };
const messages = [];
const port = { postMessage: message => messages.push(message), close() {} };
const scope = {
  page: '', frameReady: false, previewHeight: 0, previewPort: null, session: {}, previewPage: 'press',
  publicOrigin: site, previewPages: ['home', 'work', 'press'], $: () => frame, applyDevice() {},
  selectTab(target) { scope.selected = target; },
  content: { global: { brand: {} }, pages: {
    work: { hidden: ['unused'], sections: { unused: 'editor-only', photography: {
      projects: [{ name: 'Photo project', album: 'album-private', articles: [
        { kind: 'press', title: 'Public title', outlet: 'Press', href: 'https://example.com/', body: 'editor-only' }
      ] }]
    } } },
    scouting: { sections: { travel: { items: [{ name: 'Korea' }] } } },
    privateDrafts: { body: 'editor-only' }
  } }
};
vm.runInNewContext(definition('previewData', 'schedulePreview'), scope);
const event = (type, fields) => ({ source: frame.contentWindow, origin: site, ports: [port], data: { type, page: scope.previewPage, ...fields } });
scope.previewMessage(event('jp-preview-ready'));
assert.equal(messages.length, 1);
assert.equal(messages[0].travelCount, 1);
assert.deepEqual(Object.keys(messages[0].content), ['pages']);
assert.equal(messages[0].content.pages.work.sections.photography.projects[0].articles[0].title, 'Public title');
assert.doesNotMatch(JSON.stringify(messages), /album-private|editor-only|privateDrafts/);
scope.previewPage = 'work';
scope.postPreview();
assert.deepEqual(Object.keys(messages[1].content.pages), ['work']);
assert.deepEqual(Object.keys(messages[1].content.pages.work.sections), ['photography']);
assert(!Object.hasOwn(messages[1].content.pages.work.sections.photography, 'projects'));
assert(scope.content.pages.work.sections.photography.projects.length, 'projection must preserve live editor state');
scope.previewMessage(event('jp-preview-height', { height: 610 }));
assert.equal(scope.previewHeight, 610);
scope.previewMessage(event('jp-preview-nav', { target: 'home' }));
assert.equal(scope.selected, 'home');
scope.session = null; scope.postPreview();
assert.equal(messages.length, 2);
console.log('PASS editor preview scopes content, preserves independent pages and processes renderer navigation and height.');

async function checkLogoutAndActivity() {
  const elements = new Map();
  const fetches = [];
  let status = 503;
  let gate = null;
  let now = 5000;
  const session = {
    Date: { now: () => now }, AbortSignal, session: { exp: 1000000 }, sessionEpoch: 1,
    loggingOut: false, frameReady: true, previewPort: null, prevTimer: null,
    content: { saved: true }, contentLoaded: true, editRevision: 0, savedRevision: 0, saving: false,
    sessionCheckPending: false, activityCheckAt: 0, idleDeadline: 1000000,
    setTimeout, clearTimeout, window: { JPInsights: { reset() {} } },
    $(id) {
      if (!elements.has(id)) elements.set(id, { replaceChildren() {} });
      return elements.get(id);
    },
    showGate: message => { gate = message; },
    clearSession() { session.session = null; }, armIdle() {},
    checkSession() { session.activityCheckAt = now; fetches.push('activity'); },
    async fetch(url, opts) { fetches.push([url, opts.method]); return { status, ok: status === 200, json: async () => ({ok: status === 200}) }; }
  };
  const logout = source.slice(source.indexOf('  async function endSession('), source.indexOf('  function logout()'));
  const activity = source.slice(source.indexOf('  function recordActivity('), source.indexOf('  async function checkSession('));
  vm.runInNewContext(logout + activity, session);
  await session.endSession(false);
  assert(session.session); assert.equal(gate, null);
  assert.match(elements.get('save-msg').textContent, /could not be confirmed/);
  now=70000; session.recordActivity({isTrusted: false}); assert.equal(fetches.length,1);
  session.recordActivity({isTrusted: true}); session.recordActivity({isTrusted: true});
  assert.equal(fetches.filter(item => item === 'activity').length,1);
  status = 200; await session.endSession(false);
  assert.equal(session.session,null); assert.equal(gate,'Signed out.');
  assert.deepEqual(fetches[fetches.length - 1], ['/api/logout','POST']);
  console.log('PASS manual logout confirms the server result, handles failure, and trusted user activity throttles session refresh.');
}
checkLogoutAndActivity().catch(error => { console.error(error); process.exitCode = 1; });
