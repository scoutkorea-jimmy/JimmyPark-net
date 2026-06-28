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
      return '<div style="padding:15px 0;' + bb + '"><div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#171717;">' + esc(r.label) + '</div><div style="font-size:11px;color:#9b3544;margin-top:2px;">' + esc(r.labelKo) + '</div></div>' +
        '<div style="font-size:15.5px;color:#2c2925;padding:15px 0;' + bb + 'display:flex;align-items:center;">' + esc(r.value) + '</div>';
    },
    activities: function (a) {
      var green = a.accent === "green";
      var kc = green ? "#2f5a45" : "#9b3544";
      var arrow = green ? "#a9c0b5" : "#bdb6ab";
      var tags = (a.tags || []).map(function (t) {
        var tx = typeof t === "string" ? t : (t.text || "");
        return green
          ? '<span style="font-size:12px;color:#2f5a45;border:1px solid #d7e3dc;background:#f6faf7;border-radius:999px;padding:5px 12px;">' + esc(tx) + '</span>'
          : '<span style="font-size:12px;color:#4a463f;border:1px solid #e6e1da;border-radius:999px;padding:5px 12px;">' + esc(tx) + '</span>';
      }).join("");
      return '<a href="' + esc(a.href || "#") + '" class="act" style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start;padding:clamp(22px,3vw,30px) clamp(8px,1.5vw,14px);border-bottom:1px solid #e6e1da;">' +
        '<div><span style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + kc + ';">' + esc(a.kicker) + '</span>' +
        '<div style="margin-top:6px;"><span style="font-size:clamp(21px,2.8vw,28px);font-weight:700;letter-spacing:-.01em;">' + esc(a.title) + '</span><span style="margin-left:11px;font-size:13.5px;color:#8a847c;">' + esc(a.titleKo) + '</span></div>' +
        '<p style="margin:8px 0 0;font-size:14.5px;color:#66615c;max-width:60ch;line-height:1.65;">' + esc(a.desc) + '</p>' +
        '<div class="out"><div style="display:flex;flex-wrap:wrap;gap:7px;">' + tags + '</div></div></div>' +
        '<span class="act-arrow msym" aria-hidden="true" style="font-size:20px;color:' + arrow + ';padding-top:4px;">arrow_outward</span></a>';
    },
    approachSteps: function (s) {
      return '<div><div style="font-size:30px;font-weight:300;color:#cdbfb3;line-height:1;">' + esc(s.num) + '</div>' +
        '<div style="margin-top:12px;font-weight:700;font-size:16px;">' + esc(s.title) + '</div>' +
        '<div style="font-size:12px;color:#9b3544;margin-top:2px;">' + esc(s.titleKo) + '</div>' +
        '<p style="margin:8px 0 0;font-size:13.5px;color:#66615c;line-height:1.65;">' + esc(s.desc) + '</p></div>';
    },
    projectCards: function (p) {
      var bg = p.image
        ? "background:url('" + esc(p.image) + "') center/cover;"
        : "background:linear-gradient(150deg,#f1ede6,#e7e0d4);";
      return '<a href="' + esc(p.href || "#") + '" class="soft" style="background:#fff;border:1px solid #e6e1da;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;">' +
        '<div style="position:relative;aspect-ratio:16/11;' + bg + '"><span style="position:absolute;top:12px;left:12px;font-size:10.5px;font-weight:600;background:rgba(255,255,255,.9);color:#3a3631;padding:4px 10px;border-radius:999px;">' + esc(p.tag) + '</span></div>' +
        '<div style="padding:17px 19px;"><h3 style="margin:0;font-size:16.5px;font-weight:700;">' + esc(p.title) + '</h3>' +
        '<p style="margin:6px 0 0;font-size:13px;color:#66615c;line-height:1.6;">' + esc(p.desc) + '</p>' +
        '<div class="pmeta" style="font-size:11.5px;color:#8a847c;">' + esc(p.descKo) + '</div></div></a>';
    },
    photoDeliverables: function (d) {
      return '<li style="font-size:13.5px;color:#3a3631;display:flex;gap:9px;"><span class="msym" aria-hidden="true" style="font-size:17px;color:#9b3544;">check_small</span>' + esc(d.text) + '</li>';
    },
    pills: function (t) {
      return '<span style="font-size:12.5px;padding:7px 14px;border:1px solid #e6e1da;border-radius:999px;color:#3a3631;">' + esc(t.text) + '</span>';
    },
    videoFormats: function (f) {
      return '<div style="display:grid;grid-template-columns:130px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid #e6e1da;"><div style="font-weight:700;font-size:15px;">' + esc(f.name) + '</div><div style="font-size:13.5px;color:#66615c;">' + esc(f.desc) + '</div></div>';
    },
    vibeItems: function (v) {
      var badge = { Live: "color:#7a1e2c;background:#f6edee;", Prototype: "color:#2f5a45;background:#eef4ef;" }[v.status] || "color:#4a463f;background:#efeae2;";
      var media = v.image ? "background:url('" + esc(v.image) + "') center/cover;" : (v.accent === "green" ? "background:linear-gradient(150deg,#eef4ef,#e3ece6);" : "background:linear-gradient(150deg,#f1ede6,#e7e0d4);");
      var dot = '<span style="width:9px;height:9px;border-radius:50%;background:#dcd5ca;"></span>';
      return '<div class="soft" style="border:1px solid #e6e1da;border-radius:20px;overflow:hidden;background:#fff;">' +
        '<div style="background:#f2f0ec;border-bottom:1px solid #e6e1da;padding:9px 12px;display:flex;align-items:center;gap:6px;">' + dot + dot + dot + '<span style="margin-left:8px;font-size:11px;color:#8a847c;">' + esc(v.slug) + '</span></div>' +
        '<div style="aspect-ratio:16/10;' + media + '"></div>' +
        '<div style="padding:15px 17px;"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-weight:700;font-size:15px;">' + esc(v.title) + '</div><span style="font-size:10.5px;font-weight:600;' + badge + 'padding:3px 9px;border-radius:999px;">' + esc(v.status) + '</span></div>' +
        '<div style="font-size:13px;color:#66615c;margin-top:5px;">' + esc(v.desc) + '</div></div></div>';
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
      var green = t.accent === "green";
      var dot = green ? "#2f5a45" : "#cdbfb3";
      var chev = green ? "#9cbcae" : "#b9b1a5";
      var yc = green ? "#2f5a45" : "#9b3544";
      return '<details class="tl" style="position:relative;padding:0 0 18px;"><span style="position:absolute;left:-33px;top:6px;width:12px;height:12px;border-radius:50%;background:' + dot + ';"></span>' +
        '<summary style="display:flex;align-items:center;gap:10px;"><span class="tlchev msym" aria-hidden="true" style="font-size:18px;color:' + chev + ';">chevron_right</span>' +
        '<span style="font-size:13px;font-weight:700;color:' + yc + ';min-width:84px;">' + esc(t.year) + '</span>' +
        '<span style="font-weight:600;font-size:15.5px;">' + esc(t.title) + '</span></summary>' +
        '<div class="tlctx" style="padding-left:28px;font-size:13.5px;color:#66615c;line-height:1.65;">' + esc(t.context) + '</div></details>';
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

    // text binds — section-scoped and global-scoped
    applyText("data-bind", sd);
    applyText("data-gbind", g);

    // images (background) — data-img="section.field" within page, or "@global.path"
    document.querySelectorAll("[data-img]").forEach(function (el) {
      var path = el.getAttribute("data-img");
      var v = path.charAt(0) === "@" ? get(g, path.slice(1)) : get(sd, path);
      if (v) { el.style.backgroundImage = "url('" + v + "')"; el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center"; }
    });
    // hero image back-compat
    document.querySelectorAll("[data-hero-image]").forEach(function (el) {
      var hero = sd.hero || {};
      if (hero.image) { el.style.backgroundImage = "url('" + hero.image + "')"; el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center"; }
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
