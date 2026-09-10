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
  function showToast() {
    if (!toast) return;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1700);
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).catch(function () { legacyCopy(t); });
    } else { legacyCopy(t); }
  }
  function legacyCopy(t) {
    try {
      var ta = document.createElement("textarea");
      ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (_) {}
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    copyText(btn.getAttribute("data-copy") || "");
    showToast();
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
        if (mCat) mCat.textContent = (fig.getAttribute("data-gcat") || "") + " · year / event placeholder";
        modal.classList.add("open");
        return;
      }
      if (e.target === modal || (e.target.closest && e.target.closest("[data-gal-close]"))) {
        modal.classList.remove("open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.classList.remove("open");
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
    snapshotRows: function (r, i, arr) {
      var bb = i === arr.length - 1 ? "" : "border-bottom:1px solid #e6e1da;";
      return '<div style="padding:15px 0;' + bb + '"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#171717;">' + esc(r.label) + '</div></div>' +
        '<div style="font-size:15.5px;color:#2c2925;padding:15px 0;' + bb + 'display:flex;align-items:center;">' + esc(r.value) + '</div>';
    },
    activities: function (a) {
      var green = a.accent === "green";
      var tags = (a.tags || []).map(function (t) {
        return '<span style="font-size:14px;color:#4a463f;border:1px solid #e6e1da;border-radius:999px;padding:4px 10px;">' + esc(typeof t === "string" ? t : t.text) + '</span>';
      }).join("");
      return '<a href="' + esc(a.href || "/work") + '" class="act capability" style="display:flex;flex-direction:column;align-items:start;padding:clamp(24px,3vw,34px);border:1px solid ' + (green ? '#d7e3dc;background:#f6faf7;' : '#e6e1da;background:#fff;') + 'border-radius:22px;">' +
        '<span style="font-size:14px;font-weight:700;letter-spacing:.06em;color:' + (green ? '#2f5a45' : '#9b3544') + ';">' + esc(a.kicker) + '</span>' +
        '<h3 style="margin:16px 0 0;font-size:clamp(24px,3vw,30px);font-weight:700;line-height:1.2;">' + esc(a.title) + '</h3>' +
        '<p style="margin:14px 0 22px;font-size:16px;color:#66615c;line-height:1.75;max-width:48ch;">' + esc(a.desc) + '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:auto;">' + tags + '</div>' +
        '<span style="margin-top:24px;font-size:14px;font-weight:600;color:' + (green ? '#2f5a45' : '#7a1e2c') + ';display:inline-flex;gap:8px;align-items:center;">' + (green ? 'Explore the connections' : 'Explore this work') + '<span class="act-arrow msym" aria-hidden="true">arrow_forward</span></span></a>';
    },
    approachSteps: function (s) {
      return '<div><div style="font-size:30px;font-weight:300;color:#cdbfb3;line-height:1;">' + esc(s.num) + '</div>' +
        '<div style="margin-top:12px;font-weight:700;font-size:16px;">' + esc(s.title) + '</div>' +
        '<p style="margin:8px 0 0;font-size:16px;color:#66615c;line-height:1.75;">' + esc(s.desc) + '</p></div>';
    },
    projectCards: function (p) {
      var media = p.image ? '<div role="img" aria-label="' + esc(p.title) + '" style="aspect-ratio:16/10;background:url(&quot;' + esc(p.image) + '&quot;) center/cover;"></div>' : '';
      return '<a href="' + esc(p.href || "/work") + '" class="soft project-card" style="background:#fff;border:1px solid #e6e1da;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;">' + media +
        '<div style="padding:26px;display:flex;flex-direction:column;flex:1;"><span style="font-size:14px;color:#9b3544;font-weight:600;">' + esc(p.tag) + '</span>' +
        '<h3 style="margin:18px 0 0;font-size:23px;font-weight:700;line-height:1.3;">' + esc(p.title) + '</h3>' +
        '<p style="margin:12px 0 24px;font-size:16px;color:#66615c;line-height:1.75;">' + esc(p.desc) + '</p>' +
        '<span style="margin-top:auto;font-size:14px;font-weight:600;color:#7a1e2c;">Explore project context <span class="msym" aria-hidden="true" style="font-size:17px;vertical-align:middle;">arrow_forward</span></span></div></a>';
    },
    photoDeliverables: function (d) {
      return '<li style="font-size:13.5px;color:#3a3631;display:flex;gap:9px;"><span class="msym" aria-hidden="true" style="font-size:17px;color:#9b3544;">check_small</span>' + esc(d.text) + '</li>';
    },
    pills: function (t) {
      return '<span style="font-size:12.5px;padding:7px 14px;border:1px solid #e6e1da;border-radius:999px;color:#3a3631;">' + esc(t.text) + '</span>';
    },
    videoFormats: function (f) {
      return '<div style="display:grid;grid-template-columns:minmax(100px,.8fr) 1.2fr;gap:14px;padding:18px 0;border-bottom:1px solid #e6e1da;"><div style="font-weight:700;font-size:15px;">' + esc(f.name) + '</div><div style="font-size:16px;color:#66615c;">' + esc(f.desc) + '</div></div>';
    },
    vibeItems: function (v) {
      var media = v.image ? '<div role="img" aria-label="' + esc(v.title) + '" style="aspect-ratio:16/10;background:url(&quot;' + esc(v.image) + '&quot;) center/cover;"></div>' : '';
      return '<article class="project-card" style="border:1px solid #e6e1da;border-radius:22px;overflow:hidden;background:#fff;">' + media +
        '<div style="padding:26px;"><span style="display:inline-block;font-size:14px;font-weight:600;color:#4a463f;background:#f7f6f3;border:1px solid #e6e1da;padding:4px 11px;border-radius:999px;">' + esc(v.status) + '</span>' +
        '<h3 style="margin:18px 0 0;font-size:22px;font-weight:700;line-height:1.3;">' + esc(v.title) + '</h3>' +
        '<p style="font-size:16px;color:#66615c;margin:12px 0 0;line-height:1.75;">' + esc(v.desc) + '</p></div></article>';
    },
    scoutStats: function (s, i) {
      if (i === 0) return '<div><div style="font-size:clamp(26px,3.4vw,36px);font-weight:800;color:#2f5a45;letter-spacing:-.02em;">' + esc(s.value) + '</div><div style="margin-top:6px;font-size:13.5px;color:#4a463f;">' + esc(s.label) + '</div></div>';
      return '<div><div style="font-size:clamp(17px,2.2vw,21px);font-weight:800;color:#2f5a45;">' + esc(s.value) + '</div><div style="margin-top:6px;font-size:13.5px;color:#4a463f;">' + esc(s.label) + '</div></div>';
    },
    scoutRoles: function (r) {
      var green = r.accent === "green";
      var card = green ? "border:1px solid #dbe6df;background:#f6faf7;" : "border:1px solid #e6e1da;";
      var tc = green ? "color:#2f5a45;" : "";
      var badge = green ? "color:#2f5a45;background:#e6efe9;" : "color:#4a463f;background:#f2f0ec;";
      return '<div style="' + card + 'border-radius:20px;padding:26px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">' +
        '<div><div style="font-weight:800;font-size:18px;' + tc + '">' + esc(r.title) + '</div><div style="font-size:13.5px;color:#66615c;margin-top:3px;">' + esc(r.org) + '</div></div>' +
        '<span style="font-size:11.5px;font-weight:600;' + badge + 'padding:6px 12px;border-radius:999px;white-space:nowrap;">' + esc(r.period) + '</span></div></div>';
    },
    intlTags: function (t) {
      return '<span style="font-size:13.5px;font-weight:600;color:#2f5a45;background:#fff;border:1px solid #d7e3dc;border-radius:14px;padding:11px 18px;">' + esc(t.text) + '</span>';
    },
    mediaProjects: function (m) {
      return '<div style="border:1px solid #e6e1da;border-radius:20px;padding:22px;"><div style="font-weight:700;font-size:16px;">' + esc(m.title) + '</div><p style="margin:8px 0 0;font-size:13px;color:#66615c;line-height:1.65;">' + esc(m.desc) + '</p></div>';
    },
    timeline: function (t) {
      var leader = t.track ? t.track === "Leader" : t.accent === "green";
      var dot = leader ? "#2f5a45" : "#9b3544";
      var chev = leader ? "#9cbcae" : "#cdbcae";
      var yc = leader ? "#2f5a45" : "#9b3544";
      var badge = t.track
        ? '<span style="font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-radius:999px;padding:3px 9px;' + (leader ? "color:#2f5a45;background:#e6efe9;" : "color:#7a1e2c;background:#f6edee;") + '">' + esc(t.track) + '</span>'
        : "";
      return '<details class="tl" style="position:relative;padding:0 0 18px;"><span style="position:absolute;left:-33px;top:6px;width:12px;height:12px;border-radius:50%;background:' + dot + ';"></span>' +
        '<summary style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span class="tlchev msym" aria-hidden="true" style="font-size:18px;color:' + chev + ';">chevron_right</span>' +
        '<span style="font-size:13px;font-weight:700;color:' + yc + ';min-width:84px;">' + esc(t.year) + '</span>' +
        badge +
        '<span style="font-weight:600;font-size:15.5px;">' + esc(t.title) + '</span></summary>' +
        '<div class="tlctx" style="padding-left:28px;font-size:16px;color:#66615c;line-height:1.75;">' + esc(t.context) + '</div></details>';
    },
    gallery: function (g, i) {
      var bg = g.image ? "background:url('" + esc(g.image) + "') center/cover;" : "background:linear-gradient(150deg,#eef4ef,#e2ece5);";
      var attrs = 'class="galfig" data-glabel="' + esc(g.label) + '" data-gcat="' + esc(g.category) + '"';
      if (i === 0) {
        return '<figure ' + attrs + ' style="margin:0;grid-row:span 2;"><div style="height:100%;min-height:260px;border-radius:22px;border:1px solid #dbe6df;' + bg + 'position:relative;cursor:zoom-in;"><span style="position:absolute;bottom:13px;left:13px;font-size:12px;color:#5e7a6c;font-style:italic;">' + esc(g.label) + '</span></div></figure>';
      }
      return '<figure ' + attrs + ' style="margin:0;"><div style="aspect-ratio:4/3;border-radius:18px;border:1px solid #dbe6df;' + bg + 'position:relative;cursor:zoom-in;"><span style="position:absolute;bottom:11px;left:11px;font-size:11.5px;color:#5e7a6c;font-style:italic;">' + esc(g.label) + '</span></div></figure>';
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
    var meta = pd.meta || g.seo || {};
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
      var v = path.charAt(0) === "@" ? get(g, path.slice(1)) : get(sd, path);
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
      if (v) el.setAttribute("href", v);
    });

    // collections
    document.querySelectorAll("[data-collection]").forEach(function (el) {
      var arr = get(sd, el.getAttribute("data-collection"));
      var t = TT[el.getAttribute("data-template")];
      if (Array.isArray(arr) && t) el.innerHTML = arr.map(function (it, i) { return t(it, i, arr); }).join("");
    });

    // contact behaviors (from global.contact)
    var c = g.contact || {};
    if (c.email) {
      document.querySelectorAll("a[data-mail]").forEach(function (a) { a.href = "mailto:" + c.email; });
      document.querySelectorAll("[data-copy-email]").forEach(function (b) { b.setAttribute("data-copy", c.email); });
    }
    if (c.phone) {
      document.querySelectorAll("a[data-tel]").forEach(function (a) { a.href = "tel:" + c.phone.replace(/[^0-9+]/g, ""); });
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
    });
  }

  // ── Load live content, then accept preview messages ───────────────────────
  fetch("/api/content")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j && j.content) applyDoc(j.content); })
    .catch(function () {});

  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "jp-preview" && e.data.content) {
      try { applyDoc(e.data.content); } catch (_) {}
    }
  });
})();
