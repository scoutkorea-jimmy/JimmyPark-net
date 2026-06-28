/* Jimmy Park admin — full-site CMS.
   TOTP login → schema-driven editor for every page/section/collection, with an
   image picker (media library), section show/hide + reorder, a live preview
   iframe (postMessage), and Save → PUT /api/content. */
(function () {
  "use strict";

  var SESS_KEY = "jp:admin-session";
  var IDLE_MS = 30 * 60 * 1000;
  var $ = function (id) { return document.getElementById(id); };

  var session = null;       // { token, exp }
  var content = null;       // working document (deep copy of server doc)
  var activeTab = "global"; // global | home | work | scouting | contact | media
  var previewPage = "home"; // which page the iframe shows
  var deviceMode = "desktop"; // desktop | mobile — preview viewport width
  var pendingPick = null;   // fn(url) used by the image picker / upload
  var idleTimer = null, idleDeadline = 0, idleTick = null, prevTimer = null;

  // ── small DOM helpers ─────────────────────────────────────────────────────
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === "class") n.className = props[k];
      else if (k === "html") n.innerHTML = props[k];
      else if (k === "text") n.textContent = props[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), props[k]);
      else n.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ── schema ────────────────────────────────────────────────────────────────
  var ACCENT_BG = [{ v: "burgundy", t: "Burgundy" }, { v: "green", t: "Green" }];
  var ACCENT_NG = [{ v: "neutral", t: "Neutral" }, { v: "green", t: "Green" }];
  var STATUS = [{ v: "Live", t: "Live" }, { v: "Prototype", t: "Prototype" }, { v: "Beta", t: "Beta" }, { v: "In Progress", t: "In Progress" }];
  var F = function (k, label, type, options) { return { k: k, label: label, type: type || "text", options: options }; };

  var SCHEMA = {
    global: {
      title: "Global", kind: "global",
      groups: [
        { title: "Brand", path: ["global", "brand"], fields: [F("name", "Name"), F("nameKo", "Name (KO)"), F("roleline", "Role line")] },
        { title: "Footer", path: ["global", "footer"], fields: [F("tagline", "Tagline"), F("copyright", "Copyright")] },
        { title: "Contact (site-wide)", path: ["global", "contact"], fields: [F("email", "Email"), F("phone", "Phone"), F("linkedin", "LinkedIn URL (blank = hidden)"), F("location", "Location / language")] },
        { title: "Default SEO", path: ["global", "seo"], fields: [F("title", "Default title"), F("desc", "Default description", "textarea")] },
      ],
    },
    home: { title: "Home", kind: "page", page: "home", sections: [
      { id: "hero", title: "Hero", fields: [F("eyebrow", "Eyebrow"), F("title", "Title"), F("nameKo", "Name (KO)"), F("lead", "Lead", "textarea"), F("leadKo", "Lead (KO)", "textarea"), F("badge", "Image badge"), F("caption", "Caption"), F("captionRight", "Caption (right)")], links: [["ctaPrimary", "Primary button"], ["ctaGhost", "Secondary button"]], images: [["image", "Hero image"]] },
      { id: "snapshot", title: "Profile snapshot", collections: [{ k: "rows", label: "Rows", fields: [F("label", "Label"), F("labelKo", "Label (KO)"), F("value", "Value")], tmpl: { label: "", labelKo: "", value: "" } }] },
      { id: "activities", title: "What I Actually Do", fields: [F("eyebrow", "Eyebrow"), F("title", "Title")], collections: [{ k: "items", label: "Activities", fields: [F("kicker", "Kicker"), F("title", "Title"), F("titleKo", "Title (KO)"), F("desc", "Description", "textarea"), F("tags", "Tags (comma-separated)", "taglist"), F("href", "Link"), F("accent", "Accent", "select", ACCENT_BG)], tmpl: { kicker: "", title: "", titleKo: "", desc: "", tags: [], href: "/work", accent: "burgundy" } }] },
      { id: "approach", title: "How I Approach", fields: [F("eyebrow", "Eyebrow"), F("title", "Title"), F("titleKo", "Title (KO)")], collections: [{ k: "steps", label: "Steps", fields: [F("num", "Number"), F("title", "Title"), F("titleKo", "Title (KO)"), F("desc", "Description", "textarea")], tmpl: { num: "", title: "", titleKo: "", desc: "" } }] },
      { id: "projects", title: "Selected Projects", fields: [F("eyebrow", "Eyebrow"), F("title", "Title")], objects: [{ k: "feature", label: "Feature card", fields: [F("badge", "Badge"), F("sub", "Sub-label"), F("title", "Title"), F("desc", "Description", "textarea"), F("descKo", "Description (KO)"), F("href", "Link")], images: [["image", "Image"]] }], collections: [{ k: "items", label: "Project cards", fields: [F("tag", "Tag"), F("title", "Title"), F("desc", "Description", "textarea"), F("descKo", "Description (KO)"), F("href", "Link")], images: [["image", "Image"]], tmpl: { tag: "", title: "", desc: "", descKo: "", href: "/work", image: "" } }] },
      { id: "cta", title: "Contact CTA", fields: [F("title", "Title"), F("body", "Body", "textarea"), F("bodyKo", "Body (KO)")], links: [["button", "Button"]] },
    ] },
    work: { title: "Work", kind: "page", page: "work", sections: [
      { id: "intro", title: "Intro", fields: [F("eyebrow", "Eyebrow"), F("eyebrowKo", "Eyebrow (KO)"), F("title", "Title"), F("lead", "Lead", "textarea"), F("leadKo", "Lead (KO)", "textarea")] },
      { id: "photography", title: "Photography", fields: [F("kicker", "Kicker"), F("title", "Title"), F("sub", "Sub-label"), F("desc", "Description", "textarea"), F("caption", "Caption")], images: [["image", "Image"]], collections: [{ k: "deliverables", label: "Deliverables", fields: [F("text", "Text")], tmpl: { text: "" } }, { k: "usefulFor", label: "Useful for (pills)", fields: [F("text", "Text")], tmpl: { text: "" } }] },
      { id: "video", title: "Video", fields: [F("kicker", "Kicker"), F("title", "Title"), F("sub", "Sub-label"), F("desc", "Description", "textarea"), F("caption", "Caption")], collections: [{ k: "formats", label: "Formats", fields: [F("name", "Name"), F("desc", "Description")], tmpl: { name: "", desc: "" } }] },
      { id: "vibecoding", title: "Vibe Coding", fields: [F("kicker", "Kicker"), F("title", "Title"), F("sub", "Sub-label"), F("desc", "Description", "textarea")], collections: [{ k: "items", label: "Projects", fields: [F("slug", "Slug (browser bar)"), F("title", "Title"), F("desc", "Description"), F("status", "Status", "select", STATUS), F("accent", "Accent", "select", ACCENT_NG)], images: [["image", "Image"]], tmpl: { slug: "", title: "", desc: "", status: "Prototype", accent: "neutral", image: "" } }] },
      { id: "lecture", title: "Lecture", fields: [F("kicker", "Kicker"), F("title", "Title"), F("sub", "Sub-label"), F("desc", "Description", "textarea")], collections: [{ k: "topics", label: "Topics", fields: [F("name", "Name"), F("desc", "Description")], tmpl: { name: "", desc: "" } }] },
      { id: "cta", title: "CTA", fields: [F("title", "Title"), F("body", "Body", "textarea"), F("bodyKo", "Body (KO)")], links: [["button", "Button"]] },
    ] },
    scouting: { title: "Scouting", kind: "page", page: "scouting", sections: [
      { id: "hero", title: "Hero", fields: [F("eyebrow", "Eyebrow"), F("eyebrowKo", "Eyebrow (KO)"), F("title", "Title"), F("leadKo", "Lead (KO)", "textarea"), F("badge", "Image badge"), F("caption", "Caption")], images: [["image", "Hero image"]] },
      { id: "why", title: "Why Scouting Matters", fields: [F("eyebrow", "Eyebrow"), F("body", "Body", "textarea"), F("bodyKo", "Body (KO)")] },
      { id: "stats", title: "Stats", collections: [{ k: "items", label: "Stats", fields: [F("value", "Value"), F("label", "Label")], tmpl: { value: "", label: "" } }] },
      { id: "roles", title: "Key Roles", fields: [F("title", "Title")], collections: [{ k: "items", label: "Roles", fields: [F("title", "Title"), F("org", "Org / sub"), F("period", "Period"), F("accent", "Accent", "select", ACCENT_NG)], tmpl: { title: "", org: "", period: "", accent: "neutral" } }] },
      { id: "international", title: "International Experience", fields: [F("title", "Title"), F("body", "Body", "textarea")], collections: [{ k: "tags", label: "Tags", fields: [F("text", "Text")], tmpl: { text: "" } }] },
      { id: "mediaprojects", title: "Media Projects", fields: [F("title", "Title")], objects: [{ k: "feature", label: "Feature card", fields: [F("badge", "Badge"), F("title", "Title"), F("desc", "Description", "textarea")], images: [["image", "Image"]] }], collections: [{ k: "items", label: "Cards", fields: [F("title", "Title"), F("desc", "Description", "textarea")], tmpl: { title: "", desc: "" } }] },
      { id: "timeline", title: "Timeline", fields: [F("title", "Title"), F("note", "Note")], collections: [{ k: "items", label: "Entries", fields: [F("year", "Year"), F("title", "Title"), F("context", "Context", "textarea"), F("accent", "Accent", "select", ACCENT_NG)], tmpl: { year: "", title: "", context: "", accent: "neutral" } }] },
      { id: "gallery", title: "Field Gallery", fields: [F("title", "Title")], collections: [{ k: "figs", label: "Images", fields: [F("label", "Label"), F("category", "Category")], images: [["image", "Image"]], tmpl: { label: "", category: "Scouting field", image: "" } }] },
      { id: "cta", title: "CTA", fields: [F("title", "Title"), F("bodyKo", "Body (KO)")], links: [["button", "Button"]] },
    ] },
    contact: { title: "Contact", kind: "page", page: "contact", sections: [
      { id: "intro", title: "Intro", fields: [F("eyebrow", "Eyebrow"), F("eyebrowKo", "Eyebrow (KO)"), F("title", "Title"), F("lead", "Lead", "textarea"), F("leadKo", "Lead (KO)", "textarea")] },
    ] },
  };

  // ── session helpers ───────────────────────────────────────────────────────
  function loadSession() {
    try { var s = JSON.parse(localStorage.getItem(SESS_KEY) || "null"); if (s && s.token && s.exp && Date.now() < s.exp) return s; } catch (_) {}
    return null;
  }
  function saveSession(s) { session = s; try { localStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (_) {} }
  function clearSession() { session = null; try { localStorage.removeItem(SESS_KEY); } catch (_) {} }
  function authHeader() { return session ? { Authorization: "Bearer " + session.token } : {}; }

  function showGate(msg) { stopIdle(); $("dash").style.display = "none"; $("gate").style.display = "flex"; $("gate-msg").textContent = msg || ""; var o = $("otp"); if (o) { o.value = ""; o.focus(); } }
  function showDash() { $("gate").style.display = "none"; $("dash").style.display = "block"; startIdle(); applyDevice(); }

  function login() {
    var code = ($("otp").value || "").replace(/\D/g, "");
    if (code.length !== 6) { $("gate-msg").textContent = "Enter the 6-digit code."; return; }
    $("gate-msg").textContent = "Checking…";
    fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: code }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok && res.j.token) {
          saveSession({ token: res.j.token, exp: res.j.exp || (Date.now() + 12 * 3600 * 1000) });
          $("gate-msg").textContent = ""; showDash(); boot();
        } else {
          var e = res.j && res.j.error;
          $("gate-msg").textContent = e === "rate_limited" ? "Too many attempts. Try again later." : e === "not_configured" ? "Server not configured (TOTP_SECRET missing)." : "Incorrect or expired code.";
        }
      })
      .catch(function () { $("gate-msg").textContent = "Network error. Try again."; });
  }
  function logout() { clearSession(); showGate("Signed out."); }

  // ── idle auto sign-out ────────────────────────────────────────────────────
  function startIdle() {
    resetIdle();
    ["pointerdown", "keydown", "wheel", "touchstart", "input", "change"].forEach(function (ev) { document.addEventListener(ev, resetIdle, { passive: true, capture: true }); });
    if (idleTick) clearInterval(idleTick); idleTick = setInterval(renderIdle, 1000); renderIdle();
  }
  function stopIdle() {
    if (idleTimer) clearTimeout(idleTimer); if (idleTick) clearInterval(idleTick);
    ["pointerdown", "keydown", "wheel", "touchstart", "input", "change"].forEach(function (ev) { document.removeEventListener(ev, resetIdle, { capture: true }); });
  }
  function resetIdle() { idleDeadline = Date.now() + IDLE_MS; if (idleTimer) clearTimeout(idleTimer); idleTimer = setTimeout(function () { clearSession(); showGate("Signed out after 30 minutes of inactivity."); }, IDLE_MS); }
  function renderIdle() { var e = $("idle"); if (!e) return; var left = Math.max(0, idleDeadline - Date.now()); var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000); e.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s; e.style.color = left < 60000 ? "#7a1e2c" : "#66615c"; }

  // ── boot: load content + media + build UI ─────────────────────────────────
  function boot() {
    fetch("/api/content").then(function (r) { return r.json(); }).then(function (j) {
      content = (j && j.content) ? j.content : {};
      ensureShape();
      buildTabs();
      selectTab("global");
      loadMedia();
    }).catch(function () {});
  }

  function ensureShape() {
    content.global = content.global || {}; content.pages = content.pages || {};
    ["home", "work", "scouting", "contact"].forEach(function (p) {
      var ps = content.pages[p] = content.pages[p] || {};
      ps.meta = ps.meta || { title: "", desc: "" };
      ps.sections = ps.sections || {};
      ps.hidden = ps.hidden || [];
      // normalise order to include every known section id
      var ids = SCHEMA[p].sections.map(function (s) { return s.id; });
      var ord = (ps.order || []).filter(function (x) { return ids.indexOf(x) >= 0; });
      ids.forEach(function (id) { if (ord.indexOf(id) < 0) ord.push(id); });
      ps.order = ord;
    });
  }

  // ── tabs ──────────────────────────────────────────────────────────────────
  function buildTabs() {
    var bar = $("tabs"); bar.innerHTML = "";
    ["global", "home", "work", "scouting", "contact", "media"].forEach(function (t) {
      var label = t === "media" ? "Media" : SCHEMA[t] ? SCHEMA[t].title : t;
      bar.appendChild(el("button", { class: "ad-tab" + (t === activeTab ? " active" : ""), text: label, "data-tab": t, onclick: function () { selectTab(t); } }));
    });
  }
  function selectTab(t) {
    activeTab = t;
    Array.prototype.forEach.call($("tabs").children, function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === t); });
    $("media-panel").style.display = t === "media" ? "block" : "none";
    $("editor").style.display = t === "media" ? "none" : "block";
    if (t === "media") { loadMedia(); return; }
    if (SCHEMA[t] && SCHEMA[t].kind === "page") { if (previewPage !== t) { previewPage = t; setPreviewSrc(); } }
    renderEditor();
  }

  // ── editor rendering ──────────────────────────────────────────────────────
  function renderEditor() {
    var root = $("editor"); root.innerHTML = "";
    var sc = SCHEMA[activeTab];
    if (!sc) return;
    if (sc.kind === "global") {
      sc.groups.forEach(function (g) {
        var obj = g.path.reduce(function (o, k) { return (o[k] = o[k] || {}); }, content);
        var card = el("div", { class: "ad-card ad-sec" });
        card.appendChild(el("h2", { class: "ad-h", text: g.title }));
        g.fields.forEach(function (f) { card.appendChild(fieldEl(obj, f)); });
        root.appendChild(card);
      });
      return;
    }
    // page tab: SEO + layout + sections
    var page = sc.page, ps = content.pages[page];
    root.appendChild(seoCard(ps));
    root.appendChild(layoutCard(sc, ps));
    ps.order.forEach(function (id) {
      var s = sc.sections.filter(function (x) { return x.id === id; })[0];
      if (s) root.appendChild(sectionCard(page, s, ps));
    });
  }

  function seoCard(ps) {
    var card = el("div", { class: "ad-card ad-sec" });
    card.appendChild(el("h2", { class: "ad-h", text: "Page SEO" }));
    card.appendChild(el("p", { class: "ad-sub", text: "Title and meta description for this page." }));
    card.appendChild(fieldEl(ps.meta, F("title", "Title")));
    card.appendChild(fieldEl(ps.meta, F("desc", "Description", "textarea")));
    return card;
  }

  function layoutCard(sc, ps) {
    var card = el("div", { class: "ad-card ad-sec" });
    card.appendChild(el("h2", { class: "ad-h", text: "Layout — sections" }));
    card.appendChild(el("p", { class: "ad-sub", text: "Reorder or hide whole sections. Changes preview instantly." }));
    var list = el("div", {});
    ps.order.forEach(function (id, idx) {
      var s = sc.sections.filter(function (x) { return x.id === id; })[0]; if (!s) return;
      var hidden = ps.hidden.indexOf(id) >= 0;
      var row = el("div", { class: "ad-item-bar", style: "margin-bottom:8px;" }, [
        el("span", { class: "ad-sec-title" + (hidden ? " ad-hide" : ""), text: s.title }),
        el("div", { class: "grp" }, [
          el("button", { class: "ad-mini", text: "↑", onclick: function () { moveOrder(ps, idx, -1); } }),
          el("button", { class: "ad-mini", text: "↓", onclick: function () { moveOrder(ps, idx, 1); } }),
          el("button", { class: "ad-mini", text: hidden ? "Show" : "Hide", onclick: function () { toggleHidden(ps, id); } }),
        ]),
      ]);
      list.appendChild(row);
    });
    card.appendChild(list);
    return card;
  }
  function moveOrder(ps, idx, dir) { var j = idx + dir; if (j < 0 || j >= ps.order.length) return; var a = ps.order; var t = a[idx]; a[idx] = a[j]; a[j] = t; renderEditor(); schedulePreview(); }
  function toggleHidden(ps, id) { var i = ps.hidden.indexOf(id); if (i >= 0) ps.hidden.splice(i, 1); else ps.hidden.push(id); renderEditor(); schedulePreview(); }

  function sectionCard(page, s, ps) {
    var data = ps.sections[s.id] = ps.sections[s.id] || {};
    var card = el("div", { class: "ad-card ad-sec" });
    card.appendChild(el("h2", { class: "ad-h", text: s.title }));
    (s.fields || []).forEach(function (f) { card.appendChild(fieldEl(data, f)); });
    (s.links || []).forEach(function (lk) { card.appendChild(linkEl(data, lk[0], lk[1])); });
    (s.images || []).forEach(function (im) { card.appendChild(imageEl(data, im[0], im[1])); });
    (s.objects || []).forEach(function (ob) {
      var od = data[ob.k] = data[ob.k] || {};
      var sub = el("div", { class: "ad-item" });
      sub.appendChild(el("div", { class: "ad-label", text: ob.label }));
      (ob.fields || []).forEach(function (f) { sub.appendChild(fieldEl(od, f)); });
      (ob.images || []).forEach(function (im) { sub.appendChild(imageEl(od, im[0], im[1])); });
      card.appendChild(sub);
    });
    (s.collections || []).forEach(function (col) { card.appendChild(collectionEl(data, col)); });
    return card;
  }

  // field factories — all mutate the live object then schedule a preview
  function fieldEl(obj, f) {
    if (f.type === "select") {
      var sel = el("select", { class: "ad-in", onchange: function () { obj[f.k] = sel.value; schedulePreview(); } });
      (f.options || []).forEach(function (o) { sel.appendChild(el("option", { value: o.v, text: o.t })); });
      sel.value = obj[f.k] != null ? obj[f.k] : (f.options[0] && f.options[0].v);
      return wrapField(f.label, sel);
    }
    if (f.type === "taglist") {
      var tin = el("input", { class: "ad-in", value: (obj[f.k] || []).map(function (t) { return typeof t === "string" ? t : t.text; }).join(", "), oninput: function () { obj[f.k] = tin.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) { return { text: s }; }); schedulePreview(); } });
      return wrapField(f.label, tin);
    }
    if (f.type === "textarea") {
      var ta = el("textarea", { class: "ad-ta", rows: "3", oninput: function () { obj[f.k] = ta.value; schedulePreview(); } }); ta.value = obj[f.k] || "";
      return wrapField(f.label, ta);
    }
    var inp = el("input", { class: "ad-in", type: "text", oninput: function () { obj[f.k] = inp.value; schedulePreview(); } }); inp.value = obj[f.k] || "";
    return wrapField(f.label, inp);
  }
  function wrapField(label, control) { return el("div", { class: "ad-field" }, [el("label", { class: "ad-label", text: label }), control]); }

  function linkEl(obj, key, label) {
    var o = obj[key] = obj[key] || { label: "", href: "" };
    var a = el("input", { class: "ad-in", value: o.label || "", placeholder: "Label", oninput: function () { o.label = a.value; schedulePreview(); } });
    var b = el("input", { class: "ad-in", value: o.href || "", placeholder: "/path or https://", oninput: function () { o.href = b.value; schedulePreview(); } });
    return el("div", { class: "ad-field" }, [el("label", { class: "ad-label", text: label }), el("div", { class: "ad-row2" }, [a, b])]);
  }

  function imageEl(obj, key, label) {
    var thumb = el("div", { class: "ad-imgthumb" });
    if (obj[key]) thumb.style.backgroundImage = "url('" + obj[key] + "')";
    var btn = el("button", { class: "ad-mini", text: obj[key] ? "Change" : "Set image", onclick: function () { openPicker(function (url) { obj[key] = url; thumb.style.backgroundImage = url ? "url('" + url + "')" : ""; btn.textContent = url ? "Change" : "Set image"; schedulePreview(); }); } });
    return el("div", { class: "ad-field" }, [el("label", { class: "ad-label", text: label }), el("div", { class: "ad-imgpick" }, [thumb, btn])]);
  }

  function collectionEl(data, col) {
    var arr = data[col.k] = data[col.k] || [];
    var wrap = el("div", { style: "margin-top:8px;" });
    wrap.appendChild(el("div", { class: "ad-label", text: col.label + " (" + arr.length + ")" }));
    arr.forEach(function (item, idx) {
      var box = el("div", { class: "ad-item" });
      box.appendChild(el("div", { class: "ad-item-bar" }, [
        el("span", { style: "font-size:11px; color:#9a948b; font-weight:700;", text: "#" + (idx + 1) }),
        el("div", { class: "grp" }, [
          el("button", { class: "ad-mini", text: "↑", onclick: function () { moveItem(arr, idx, -1, col, data); } }),
          el("button", { class: "ad-mini", text: "↓", onclick: function () { moveItem(arr, idx, 1, col, data); } }),
          el("button", { class: "ad-mini del", text: "Delete", onclick: function () { arr.splice(idx, 1); renderEditor(); schedulePreview(); } }),
        ]),
      ]));
      (col.fields || []).forEach(function (f) { box.appendChild(fieldEl(item, f)); });
      (col.images || []).forEach(function (im) { box.appendChild(imageEl(item, im[0], im[1])); });
      wrap.appendChild(box);
    });
    wrap.appendChild(el("button", { class: "ad-btn ad-btn-ghost ad-btn-sm", html: '<span class="msym" aria-hidden="true" style="font-size:16px;">add</span>Add ' + col.label, onclick: function () { arr.push(clone(col.tmpl)); renderEditor(); schedulePreview(); } }));
    return wrap;
  }
  function moveItem(arr, idx, dir, col, data) { var j = idx + dir; if (j < 0 || j >= arr.length) return; var t = arr[idx]; arr[idx] = arr[j]; arr[j] = t; renderEditor(); schedulePreview(); }

  // ── preview ───────────────────────────────────────────────────────────────
  // Render the iframe at a true device width, then scale it to fit the column so
  // "Desktop" shows the actual desktop layout (not the narrow-column responsive one).
  var DEVICE = { desktop: { w: 1280, h: 1000 }, mobile: { w: 390, h: 844 } };
  function applyDevice() {
    var frame = $("preview"), stage = $("preview-stage");
    if (!frame || !stage) return;
    var avail = stage.clientWidth;
    if (avail < 2) return; // stage hidden / not laid out yet — recomputed once visible
    var d = DEVICE[deviceMode];
    var scale = Math.min(1, avail / d.w);
    frame.style.width = d.w + "px";
    frame.style.height = d.h + "px";
    frame.style.transform = "scale(" + scale + ")";
    frame.style.marginLeft = Math.max(0, (avail - d.w * scale) / 2) + "px";
    stage.style.height = Math.round(d.h * scale) + "px";
  }
  function setDevice(mode) {
    deviceMode = mode;
    $("dev-desktop").classList.toggle("active", mode === "desktop");
    $("dev-mobile").classList.toggle("active", mode === "mobile");
    applyDevice();
  }
  function previewPath() { return (previewPage === "home" ? "/" : "/" + previewPage) + "?preview=1"; }
  function setPreviewSrc() { $("preview-page").textContent = previewPage; $("preview").src = previewPath(); }
  function postPreview() { try { var f = $("preview"); if (f && f.contentWindow) f.contentWindow.postMessage({ type: "jp-preview", content: content }, location.origin); } catch (_) {} }
  function schedulePreview() { clearTimeout(prevTimer); prevTimer = setTimeout(postPreview, 140); }

  // ── save ──────────────────────────────────────────────────────────────────
  function save() {
    var msg = $("save-msg"); msg.textContent = "Saving…"; msg.className = "ad-msg";
    fetch("/api/content", { method: "PUT", headers: Object.assign({ "content-type": "application/json" }, authHeader()), body: JSON.stringify({ content: content }) })
      .then(function (r) { if (r.status === 401) { clearSession(); showGate("Session expired — enter a new code."); throw new Error("401"); } return r.json(); })
      .then(function (j) {
        if (j && j.ok) { content = j.content; ensureShape(); msg.textContent = "✓ Saved & live"; msg.className = "ad-msg ad-ok"; setTimeout(function () { msg.textContent = ""; }, 2600); postPreview(); }
        else { msg.textContent = "Save failed."; msg.className = "ad-msg ad-err"; }
      })
      .catch(function (e) { if (String(e.message) !== "401") { msg.textContent = "Save failed."; msg.className = "ad-msg ad-err"; } });
  }

  // ── media library ─────────────────────────────────────────────────────────
  function loadMedia() {
    fetch("/api/image?list=1", { headers: authHeader() })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); })
      .then(function (j) { renderMedia((j && j.items) || []); }).catch(function () {});
  }
  function renderMedia(items) {
    $("media-count").textContent = String(items.length);
    var box = $("media"); box.innerHTML = "";
    items.forEach(function (m) {
      var url = "/api/image?id=" + m.id;
      box.appendChild(el("div", { class: "ad-mitem", html: '<img src="' + url + '" alt="" loading="lazy"><div class="ad-mbar"><button data-del="' + m.id + '" class="del">Delete</button></div>' }));
    });
  }
  function renderPicker(items) {
    var grid = $("picker-grid"); grid.innerHTML = "";
    items.forEach(function (m) {
      var url = "/api/image?id=" + m.id;
      var cell = el("div", { class: "ad-mitem", style: "cursor:pointer;", html: '<img src="' + url + '" alt="" loading="lazy">' });
      cell.addEventListener("click", function () { if (pendingPick) pendingPick(url); closePicker(); });
      grid.appendChild(cell);
    });
  }
  function openPicker(cb) {
    pendingPick = cb;
    fetch("/api/image?list=1", { headers: authHeader() }).then(function (r) { return r.json(); }).then(function (j) { renderPicker((j && j.items) || []); }).catch(function () { renderPicker([]); });
    $("picker").classList.add("open");
  }
  function closePicker() { $("picker").classList.remove("open"); }

  function downscale(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () { URL.revokeObjectURL(url); var w = img.width, h = img.height, scale = Math.min(1, maxDim / Math.max(w, h)); var cw = Math.round(w * scale), ch = Math.round(h * scale); var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; cv.getContext("2d").drawImage(img, 0, 0, cw, ch); cv.toBlob(function (b) { b ? resolve(b) : reject(new Error("encode")); }, "image/jpeg", quality || 0.85); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }
  function uploadFiles(files) {
    var arr = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!arr.length) return;
    var msg = $("save-msg"); msg.textContent = "Uploading…"; msg.className = "ad-msg";
    var lastUrl = "", chain = Promise.resolve();
    arr.forEach(function (f) {
      chain = chain.then(function () {
        return downscale(f, 1600, 0.85).then(function (blob) {
          return fetch("/api/image", { method: "POST", headers: Object.assign({ "content-type": "image/jpeg", "X-Filename": f.name || "image.jpg" }, authHeader()), body: blob })
            .then(function (r) { if (r.status === 401) { clearSession(); showGate("Session expired — enter a new code."); throw new Error("401"); } return r.json(); })
            .then(function (j) { if (j && j.url) lastUrl = j.url; });
        });
      });
    });
    chain.then(function () {
      msg.textContent = "✓ Uploaded"; msg.className = "ad-msg ad-ok"; setTimeout(function () { msg.textContent = ""; }, 2000);
      loadMedia();
      if (pendingPick && lastUrl) { pendingPick(lastUrl); closePicker(); }
    }).catch(function (e) { if (String(e.message) !== "401") { msg.textContent = "Upload failed."; msg.className = "ad-msg ad-err"; } });
  }
  function deleteMedia(id) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    fetch("/api/image?id=" + encodeURIComponent(id), { method: "DELETE", headers: authHeader() })
      .then(function (r) { if (r.status === 401) throw new Error("401"); return r.json(); }).then(function () { loadMedia(); }).catch(function () {});
  }

  // ── wire up ───────────────────────────────────────────────────────────────
  function wire() {
    $("otp-btn").addEventListener("click", login);
    $("otp").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
    $("logout").addEventListener("click", logout);
    $("save").addEventListener("click", save);

    var fi = $("file-input");
    fi.addEventListener("change", function () { if (fi.files && fi.files.length) uploadFiles(fi.files); fi.value = ""; });
    $("drop").addEventListener("click", function () { pendingPick = null; fi.click(); });
    $("drop").addEventListener("dragover", function (e) { e.preventDefault(); });
    $("drop").addEventListener("drop", function (e) { e.preventDefault(); pendingPick = null; if (e.dataTransfer && e.dataTransfer.files) uploadFiles(e.dataTransfer.files); });
    $("media").addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("button[data-del]"); if (t) deleteMedia(t.getAttribute("data-del")); });

    $("picker-close").addEventListener("click", closePicker);
    $("picker").addEventListener("click", function (e) { if (e.target === $("picker")) closePicker(); });
    $("picker-upload").addEventListener("click", function () { fi.click(); });
    $("picker-clear").addEventListener("click", function () { if (pendingPick) pendingPick(""); closePicker(); });

    $("dev-desktop").addEventListener("click", function () { setDevice("desktop"); });
    $("dev-mobile").addEventListener("click", function () { setDevice("mobile"); });
    $("prev-refresh").addEventListener("click", setPreviewSrc);
    $("preview").addEventListener("load", function () { postPreview(); applyDevice(); });
    window.addEventListener("resize", applyDevice);
  }

  // ── init ──────────────────────────────────────────────────────────────────
  wire();
  session = loadSession();
  if (session) {
    fetch("/api/me", { headers: authHeader() }).then(function (r) { return r.ok; }).then(function (ok) { if (ok) { showDash(); boot(); } else { clearSession(); showGate(); } }).catch(function () { showGate(); });
  } else { showGate(); }
})();
