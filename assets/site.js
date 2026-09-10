/* Shared public-site behavior + content render engine.
   Pages render full static seed content (good for SEO / no-JS). This script:
   - enhances UI (active nav, mobile menu, copy-to-clipboard, gallery modal)
   - fetches /api/content and OVERRIDES the seed: per-page SEO, section order &
     visibility, text fields (data-bind / data-gbind), collections (data-collection
     + data-template), images (data-img) and contact behaviors.
   - accepts a live-preview document via postMessage (used by /admin). */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "home";

  // ── Active nav + mobile menu ──────────────────────────────────────────────
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page && !a.classList.contains("btn")) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var icon = toggle.querySelector(".msym");
      if (icon) icon.textContent = open ? "close" : "menu";
    });
  }

  if (toggle && menu) {
    function closeMenu() {
      menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      var icon = toggle.querySelector(".msym"); if (icon) icon.textContent = "menu";
    }
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); }
    });
  }

  // ── Copy to clipboard + toast (delegated) ─────────────────────────────────
  var toast = document.querySelector(".copy-toast");
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1700);
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t).then(function () { return true; }).catch(function () { return legacyCopy(t); });
    } else { return Promise.resolve(legacyCopy(t)); }
  }
  function legacyCopy(t) {
    var ta, previous = document.activeElement;
    try {
      ta = document.createElement("textarea");
      ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); return document.execCommand("copy");
    } catch (_) { return false; }
    finally { if (ta && ta.parentNode) ta.remove(); if (previous && previous.focus) previous.focus(); }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    copyText(btn.getAttribute("data-copy") || "").then(function (ok) { showToast(ok ? 'Copied' : 'Couldn’t copy. Please select and copy the text.'); });
  });

  // ── Gallery modal (delegated, survives re-render) ─────────────────────────
  var modal = document.querySelector(".gal-modal");
  if (modal) {
    var mLabel = modal.querySelector("[data-gal-label]");
    var mCat = modal.querySelector("[data-gal-cat]");
    document.addEventListener("click", function (e) {
      var fig = e.target.closest && e.target.closest(".galfig");
      if (fig) {
        if (mLabel) mLabel.textContent = fig.getAttribute("data-glabel") || "";
        if (!fig.getAttribute('data-gimage')) return;
        if (mCat) mCat.textContent = fig.getAttribute("data-gcat") || "";
        var photo = modal.querySelector('[data-gal-image]');
        if (photo) { photo.src = fig.getAttribute('data-gimage'); photo.alt = fig.getAttribute('data-glabel') || ''; }
        modal.showModal();
        return;
      }
      if (e.target === modal || (e.target.closest && e.target.closest("[data-gal-close]"))) {
        modal.close();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.open) modal.close();
    });
  }

  // ── Render engine ─────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function get(obj, path) {
    var cur = obj;
    var parts = String(path).split(".");
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function pageData(content) { return (content.pages && content.pages[page]) || {}; }
  function sectionData(content) { return pageData(content).sections || {}; }

  // collection item templates (markup mirrors the static seeds / design.md)
  var TT = {
    travelPlaces: function (place) {
      return '<div class="travel-place"><h3>' + esc(place.name) + '</h3>' + (place.cities ? '<p>' + esc(place.cities) + '</p>' : '') + '</div>';
    },
    videoCases: function (v) {
      var href = /^https:\/\//.test(v.href || "") ? v.href : "";
      var media = v.image ? '<img src="' + esc(v.image) + '" alt="Video still: ' + esc(v.title) + '" loading="lazy" decoding="async" width="640" height="360">' : '<span class="case-placeholder">' + esc(v.title) + '</span>';
      return '<article class="card project-card video-case"><div class="case-media">' + media + '</div><div class="card-body">' +
        '<div class="case-meta"><span class="eyebrow">' + esc(v.format) + '</span>' + (v.year ? '<span class="tag">' + esc(v.year) + '</span>' : '') + '</div>' +
        '<h3>' + esc(v.title) + '</h3><p class="case-role">' + esc(v.role) + '</p><p>' + esc(v.desc) + '</p>' +
        (href ? '<a class="card-link" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc((v.linkLabel || 'Watch film') + ': ' + v.title) + '">' + esc(v.linkLabel || 'Watch film') + '<span class="msym" aria-hidden="true">north_east</span></a>' : '') + '</div></article>';
    },
    snapshotRows: function (r) {
      return '<div class="snapshot-row"><dt>' + esc(r.label) + '</dt><dd>' + esc(r.value) + '</dd></div>';
    },
    activities: function (a) {
      var green = a.accent === "green";
      var tags = (a.tags || []).map(function (t) { return '<span class="tag">' + esc(typeof t === "string" ? t : t.text) + '</span>'; }).join("");
      return '<a href="' + esc(a.href || "/work") + '" class="card capability act' + (green ? ' card--scouting' : '') + '">' +
        '<span class="eyebrow">' + esc(a.kicker) + '</span><h3>' + esc(a.title) + '</h3><p>' + esc(a.desc) + '</p>' +
        '<div class="tag-list">' + tags + '</div><span class="card-link">' + (green ? 'Explore the connections' : 'Explore this work') +
        '<span class="act-arrow msym" aria-hidden="true">arrow_forward</span></span></a>';
    },
    approachSteps: function (s) {
      return '<div class="process-step"><div class="step-number">' + esc(s.num) + '</div><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>';
    },
    projectCards: function (p) {
      var media = p.image ? '<div class="project-image" role="img" aria-label="' + esc(p.title) + '" style="background-image:url(&quot;' + esc(p.image) + '&quot;)"></div>' : '';
      return '<a href="' + esc(p.href || "/work") + '" class="card project-card soft">' + media + '<div class="card-body">' +
        '<span class="eyebrow">' + esc(p.tag) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
        '<span class="card-link">Explore project context <span class="msym" aria-hidden="true">arrow_forward</span></span></div></a>';
    },
    photoDeliverables: function (d) {
      return '<li class="deliverable"><span class="msym" aria-hidden="true">check_small</span>' + esc(d.text) + '</li>';
    },
    pills: function (t) { return '<span class="tag">' + esc(t.text) + '</span>'; },
    videoFormats: function (f) {
      return '<div class="format-row"><div class="format-name">' + esc(f.name) + '</div><div class="body-copy">' + esc(f.desc) + '</div></div>';
    },
    vibeItems: function (v) {
      var media = v.image ? '<div class="project-image" role="img" aria-label="' + esc(v.title) + '" style="background-image:url(&quot;' + esc(v.image) + '&quot;)"></div>' : '';
      return '<article class="card project-card">' + media + '<div class="card-body"><span class="tag status-tag">' + esc(v.status) + '</span>' +
        '<h3>' + esc(v.title) + '</h3><p>' + esc(v.desc) + '</p>' + (/^https:\/\//.test(v.href || '') ? '<a class="card-link" href="' + esc(v.href) + '" target="_blank" rel="noopener noreferrer">Open project<span class="msym" aria-hidden="true">north_east</span></a>' : '') + '</div></article>';
    },
    scoutStats: function (s, i) {
      return '<div class="stat' + (i === 0 ? ' stat--lead' : '') + '"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
    },
    scoutRoles: function (r) {
      return '<div class="card card--compact role-card' + (r.accent === "green" ? ' card--scouting' : '') + '"><div class="role-header"><div class="role-body"><h3>' +
        esc(r.title) + '</h3><p>' + esc(r.org) + '</p></div><span class="tag period">' + esc(r.period) + '</span></div></div>';
    },
    intlTags: function (t) { return '<span class="tag tag--scouting tag--large">' + esc(t.text) + '</span>'; },
    mediaProjects: function (m) { return '<div class="card card--compact"><h3>' + esc(m.title) + '</h3><p>' + esc(m.desc) + '</p></div>'; },
    timeline: function (t) {
      var leader = t.track ? t.track === "Leader" : t.accent === "green";
      return '<details class="tl' + (leader ? ' tl--leader' : '') + '"><span class="timeline-dot" aria-hidden="true"></span>' +
        '<summary><span class="tlchev msym" aria-hidden="true">chevron_right</span><span class="timeline-year">' + esc(t.year) + '</span>' +
        (t.track ? '<span class="tag timeline-track">' + esc(t.track) + '</span>' : '') + '<span class="timeline-title">' + esc(t.title) + '</span></summary>' +
        '<div class="tlctx">' + esc(t.context) + '</div></details>';
    },
    gallery: function (g, i) {
      if (!g.image) return '';
      var bg = g.image ? ' style="background-image:url(&quot;' + esc(g.image) + '&quot;)"' : '';
      return '<figure class="galfig' + (i === 0 ? ' gallery-first' : '') + '" data-glabel="' + esc(g.label) + '" data-gcat="' + esc(g.category) + '" data-gimage="' + esc(g.image) + '">' +
        '<button type="button" class="gallery-image" aria-label="' + esc('View ' + g.label) + '"' + bg + '><span>' + esc(g.label) + '</span></button></figure>';
    },
  };

  function applyText(scopeName, scope) {
    document.querySelectorAll("[" + scopeName + "]").forEach(function (el) {
      var v = get(scope, el.getAttribute(scopeName));
      if (v != null && typeof v !== "object") el.textContent = v;
    });
  }

  function applyDoc(content) {
    if (!content) return;
    var g = content.global || {};
    var pd = pageData(content);
    var sd = sectionData(content);

    // SEO
    var meta = pd.meta || (page === 'home' ? g.seo : {}) || {};
    if (meta.title) document.title = meta.title;
    if (meta.desc) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", meta.desc);
    }

    ["og:title", "twitter:title"].forEach(function (key) {
      var el = document.querySelector('meta[property="' + key + '"], meta[name="' + key + '"]');
      if (el && meta.title) el.setAttribute("content", meta.title);
    });
    ["og:description", "twitter:description"].forEach(function (key) {
      var el = document.querySelector('meta[property="' + key + '"], meta[name="' + key + '"]');
      if (el && meta.desc) el.setAttribute("content", meta.desc);
    });

    // text binds — section-scoped and global-scoped
    applyText("data-bind", sd);
    applyText("data-gbind", g);

    // images (background) — data-img="section.field" within page, or "@global.path"
    document.querySelectorAll("[data-img]").forEach(function (el) {
      var path = el.getAttribute("data-img");
      var v = (path.charAt(0) === "@" ? get(g, path.slice(1)) : get(sd, path)) || el.getAttribute('data-default-image');
      if (v) { el.style.backgroundImage = "url('" + v + "')"; el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center"; }
      else { el.style.backgroundImage = ""; }
      var fallback = el.querySelector("[data-image-fallback]");
      if (fallback) fallback.hidden = !!v;
    });
    // hero image back-compat
    document.querySelectorAll("[data-hero-image]").forEach(function (el) {
      var hero = sd.hero || {};
      if (hero.image) { el.style.backgroundImage = "url('" + hero.image + "')"; el.style.backgroundSize = "cover"; el.style.backgroundPosition = el.getAttribute("data-image-position") || "center"; }
      else { el.style.backgroundImage = ""; }
    });

    // link hrefs — data-href="section.field.href"
    document.querySelectorAll("[data-href]").forEach(function (el) {
      var v = get(sd, el.getAttribute("data-href"));
      if (el.hasAttribute("data-optional-link")) {
        var valid = /^https:\/\//.test(v || "");
        el.hidden = !valid;
        if (valid) el.setAttribute("href", v); else el.removeAttribute("href");
      } else if (v) el.setAttribute("href", v);
    });

    // collections
    document.querySelectorAll("[data-collection]").forEach(function (el) {
      var arr = get(sd, el.getAttribute("data-collection"));
      var t = TT[el.getAttribute("data-template")];
      if (Array.isArray(arr) && t) el.innerHTML = arr.map(function (it, i) { return t(it, i, arr); }).join("");
    });

    // Travel totals use the same entries shown in the destination list.
    var places = get(content, "pages.scouting.sections.travel.items") || [];
    var seenPlaces = {};
    places.forEach(function (place) { var name = String(place.name || "").trim().toLowerCase(); if (name) seenPlaces[name] = true; });
    document.querySelectorAll("[data-travel-count]").forEach(function (el) { el.textContent = String(Object.keys(seenPlaces).length); });

    // contact behaviors (from global.contact)
    var c = g.contact || {};
    if (c.email) {
      document.querySelectorAll("a[data-mail]").forEach(function (a) { var params = [];
        if (a.hasAttribute('data-mail-subject')) params.push('subject=' + encodeURIComponent(a.getAttribute('data-mail-subject')));
        if (a.hasAttribute('data-mail-body')) params.push('body=' + encodeURIComponent(a.getAttribute('data-mail-body')));
        a.href = "mailto:" + c.email + (params.length ? '?' + params.join('&') : ''); });
      document.querySelectorAll("[data-copy-email]").forEach(function (b) { b.setAttribute("data-copy", c.email); });
    }
    if (c.phone) {
      var dialNumber = c.phone.replace(/[^0-9+]/g, "");
      if (/^010\d{8}$/.test(dialNumber)) dialNumber = "+82" + dialNumber.slice(1);
      document.querySelectorAll("a[data-tel]").forEach(function (a) { a.href = "tel:" + dialNumber; });
      document.querySelectorAll("[data-copy-phone]").forEach(function (b) { b.setAttribute("data-copy", c.phone); });
    }
    var li = document.querySelector("[data-li-block]");
    if (li) {
      if (c.linkedin) {
        li.style.display = "";
        var link = li.querySelector("a");
        if (link) {
          link.href = c.linkedin;
          var lbl = li.querySelector("[data-li-label]");
          if (lbl) lbl.textContent = c.linkedin.replace(/^https?:\/\//, "").replace(/\/$/, "");
        }
      } else { li.style.display = "none"; }
    }

    // section order + visibility
    var order = pd.order || [];
    var hidden = pd.hidden || [];
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    var byParent = {};
    nodes.forEach(function (n) {
      var key = n.parentNode ? (n.parentNode.__jpid || (n.parentNode.__jpid = "p" + Math.random().toString(36).slice(2))) : "x";
      (byParent[key] = byParent[key] || []).push(n);
    });
    Object.keys(byParent).forEach(function (key) {
      var group = byParent[key];
      var parent = group[0].parentNode;
      var ref = group[group.length - 1].nextSibling;
      var ranked = group.slice().sort(function (a, b) {
        var ia = order.indexOf(a.getAttribute("data-section"));
        var ib = order.indexOf(b.getAttribute("data-section"));
        if (ia < 0) ia = 999; if (ib < 0) ib = 999;
        return ia - ib;
      });
      ranked.forEach(function (n) { parent.insertBefore(n, ref); });
    });
    nodes.forEach(function (n) {
      n.style.display = hidden.indexOf(n.getAttribute("data-section")) >= 0 ? "none" : "";
      if (n.getAttribute('data-section') === 'gallery') n.hidden = !(get(sd, 'gallery.figs') || []).some(function (fig) { return !!fig.image; });
    });
  }

  // Shuffle the supplied portfolio selection once per visit; keep every image visible.
  document.querySelectorAll('[data-photo-shuffle]').forEach(function (grid) {
    var photos = Array.prototype.slice.call(grid.children);
    for (var i = photos.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var swap = photos[i]; photos[i] = photos[j]; photos[j] = swap; }
    photos.forEach(function (photo) { grid.appendChild(photo); });
  });

  // ── Load live content, then accept preview messages ───────────────────────
  var previewReceived = false;
  fetch("/api/content")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (!previewReceived && j && j.content) applyDoc(j.content); })
    .catch(function () {});

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || window.parent === window || e.source !== window.parent || new URLSearchParams(location.search).get('preview') !== '1') return;
    if (e.data && e.data.type === "jp-preview" && e.data.content) {
      previewReceived = true;
      try { applyDoc(e.data.content); } catch (_) {}
    }
  });
})();
