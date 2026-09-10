/* Insights uses its own authenticated store; drafts never enter public content. */
(function () {
  'use strict';
  var panel, auth, expired, store, selected = null, dirty = false, busy = false, serial = 0;
  function node(tag, text, cls) { var n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
  function errorText(code) {
    return ({ conflict: 'This collection changed in another session. Your text is preserved. Copy it before reloading Insights.', slug_taken: 'That URL is already used by another article.', title_required: 'Add a title.', body_required: 'Add article text before publishing.', invalid_slug: 'Use lowercase letters, numbers and hyphens for the URL.', invalid_date: 'Enter a valid date.', unauthorized: 'Your session expired. Sign in again.' })[code] || 'Could not save. Check the fields and try again.';
  }
  function request(method, data) {
    return fetch('/api/posts', { method: method, headers: Object.assign({ 'content-type': 'application/json' }, auth()), body: data ? JSON.stringify(data) : undefined })
      .then(function (r) { if (r.status === 401) { expired(); throw new Error('unauthorized'); } return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'network'); return j; }); });
  }
  function discard() { return !dirty || window.confirm('Discard unsaved article changes?'); }
  function choose(post) { if (busy || !discard()) return; selected = JSON.parse(JSON.stringify(post)); dirty = false; render(); }
  function field(form, label, key, type, max) {
    var id = 'insight-' + key;
    var wrap = node('div', '', 'ad-field'), lab = node('label', label, 'ad-label'); lab.htmlFor = id;
    var input = node(type === 'textarea' ? 'textarea' : 'input', '', type === 'textarea' ? 'ad-ta' : 'ad-in');
    input.id = id; input.value = selected[key] || ''; input.maxLength = max;
    if (type !== 'textarea') input.type = type || 'text'; else input.rows = key === 'body' ? 18 : 3;
    input.addEventListener('input', function () { selected[key] = input.value; dirty = true; });
    wrap.append(lab, input); form.appendChild(wrap); return input;
  }
  function render() {
    panel.replaceChildren();
    var card = node('div', '', 'ad-card');
    card.append(node('h2', 'Insights', 'ad-h'), node('p', 'Draft, edit and publish your writing. Article changes are saved here, separately from the page editor.', 'ad-sub'));
    var add = node('button', 'New draft', 'ad-btn ad-btn-primary ad-btn-sm'); add.type = 'button';
    add.onclick = function () { choose({ id: '', title: 'Untitled note', slug: 'note-' + Date.now().toString(36), date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }), category: '', summary: '', body: '', status: 'draft' }); };
    card.appendChild(add);
    var list = node('div', '', 'insight-admin-list');
    (store.posts || []).slice().sort(function (a,b) { return b.updatedAt - a.updatedAt; }).forEach(function (p) {
      var btn = node('button', p.title + ' · ' + (p.status === 'published' ? 'Published' : 'Draft'), 'ad-btn ad-btn-ghost ad-btn-sm'); btn.type = 'button';
      btn.setAttribute('aria-pressed', String(!!selected && p.id === selected.id)); btn.onclick = function () { choose(p); }; list.appendChild(btn);
    });
    if (!store.posts.length) list.appendChild(node('p', 'No articles yet. Start with a draft.', 'ad-sub'));
    card.appendChild(list); panel.appendChild(card);
    if (!selected) return;
    var editor = node('form', '', 'ad-card'), fields = node('fieldset', '', 'insight-fields');
    editor.appendChild(node('h2', selected.status === 'published' ? 'Edit published article' : 'Edit draft', 'ad-h'));
    field(fields, 'Title', 'title', 'text', 160);
    field(fields, 'Article URL · /insights/', 'slug', 'text', 100);
    field(fields, 'Date', 'date', 'date', 10);
    field(fields, 'Category', 'category', 'text', 60);
    field(fields, 'Summary', 'summary', 'textarea', 500);
    field(fields, 'Article · separate paragraphs with a blank line; start a heading with ##', 'body', 'textarea', 50000);
    var actions = node('div', '', 'insight-admin-actions');
    var save = node('button', selected.status === 'published' ? 'Save changes' : 'Save draft', 'ad-btn ad-btn-primary ad-btn-sm'); save.type = 'submit';
    var publish = node('button', selected.status === 'published' ? 'Unpublish' : 'Publish', 'ad-btn ad-btn-ghost ad-btn-sm'); publish.type = 'button';
    var remove = node('button', 'Delete article', 'ad-btn ad-btn-ghost ad-btn-sm'); remove.type = 'button'; remove.hidden = !selected.id;
    actions.append(save, publish, remove);
    if (selected.status === 'published') { var link = node('a', 'View article', 'ad-btn ad-btn-ghost ad-btn-sm'); link.href = '/insights/' + selected.slug; link.target = '_blank'; link.rel = 'noopener'; actions.appendChild(link); }
    fields.appendChild(actions); editor.appendChild(fields);
    var status = node('p', '', 'ad-msg'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); editor.appendChild(status); panel.appendChild(editor);
    async function persist(method, nextStatus) {
      if (busy) return;
      busy = true; fields.disabled = true; add.disabled = true; list.inert = true; status.textContent = 'Saving…';
      var outgoing = Object.assign({}, selected, { status: nextStatus || selected.status });
      try {
        store = await request(method, { revision: store.revision, post: outgoing });
        selected = method === 'DELETE' ? null : JSON.parse(JSON.stringify(store.posts.find(function (p) { return outgoing.id ? p.id === outgoing.id : p.slug === outgoing.slug.trim(); })));
        dirty = false; render();
        var done = node('p', method === 'DELETE' ? 'Article deleted.' : outgoing.status === 'published' ? 'Published. Your article is live.' : 'Draft saved. Only you can see it.', 'ad-msg ad-ok'); done.setAttribute('role','status'); panel.appendChild(done);
      } catch (err) { status.textContent = errorText(err.message); status.className = 'ad-msg ad-err'; }
      finally { busy = false; fields.disabled = false; add.disabled = false; list.inert = false; }
    }
    editor.onsubmit = function (event) { event.preventDefault(); persist('POST'); };
    publish.onclick = function () { persist('POST', selected.status === 'published' ? 'draft' : 'published'); };
    remove.onclick = function () { if (window.confirm('Delete “' + selected.title + '”? This cannot be undone.')) persist('DELETE'); };
  }
  window.JPInsights = {
    open: function (target, getAuth, onExpired) {
      if (busy) return;
      panel = target; auth = getAuth; expired = onExpired;
      if (store) { render(); return; }
      var attempt = ++serial;
      panel.textContent = 'Loading articles…';
      request('GET').then(function (j) { if (attempt !== serial) return; store = j; render(); }).catch(function () {
        panel.replaceChildren(node('p', 'Could not load articles. Reopen Insights to retry.', 'ad-msg ad-err'));
      });
    },
    canLeave: function () {
      if (busy || !discard()) return false;
      if (dirty) { selected = null; dirty = false; }
      return true;
    },
    reset: function () { ++serial; store = null; selected = null; dirty = false; }
  };
  window.addEventListener('beforeunload', function (e) { if (dirty || busy) { e.preventDefault(); e.returnValue = ''; } });
})();
