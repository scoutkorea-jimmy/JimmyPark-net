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
  var motionOK = !!(window.IntersectionObserver && window.matchMedia && window.matchMedia("(prefers-reduced-motion: no-preference)").matches);
  if (motionOK) document.documentElement.classList.add("motion");

  // ── Active nav + mobile menu ──────────────────────────────────────────────
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page && !a.classList.contains("btn")) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  // M3 modal navigation drawer: scrim, scroll lock, focus on open, close on scrim/link/Escape.
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      var icon = toggle.querySelector(".msym");
      if (icon) icon.textContent = open ? "close" : "menu";
      var first = open && menu.querySelector("a");
      if (first) first.focus();
    });
  }

  if (toggle && menu) {
    function closeMenu() {
      menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      var icon = toggle.querySelector(".msym"); if (icon) icon.textContent = "menu";
    }
    menu.addEventListener("click", function (e) { if (e.target === menu || e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); toggle.focus(); }
    });
  }

  // M3 top app bar: the surface tones up once content scrolls beneath it; a linear progress
  // indicator on its lower edge follows the reading position.
  var appBar = document.querySelector(".site-header");
  if (appBar) {
    var bar = null;
    if (motionOK) { var track = document.createElement("div"); track.className = "md-progress"; track.setAttribute("aria-hidden", "true"); bar = document.createElement("span"); track.appendChild(bar); appBar.appendChild(track); }
    var ticking = false;
    var tone = function () {
      ticking = false;
      appBar.classList.toggle("is-scrolled", window.scrollY > 4);
      if (bar) { var max = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")"; }
    };
    tone();
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(tone); } }, { passive: true });
  }

  // M3 ripple on press for buttons, navigation, interactive cards and disclosures.
  var RIPPLE_HOSTS = ".site-button, .nav-link, .mobile-links a, .copybtn, .nav-toggle, a.card, a.card-link, .backend-toggle, .format-details > summary, .travel-details > summary";
  if (motionOK) document.addEventListener("pointerdown", function (e) {
    var host = e.target.closest && e.target.closest(RIPPLE_HOSTS);
    if (!host || !host.closest(".portfolio")) return;
    var r = host.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    var dot = document.createElement("span");
    dot.className = "md-ripple";
    dot.style.width = dot.style.height = size + "px";
    dot.style.left = (e.clientX - r.left - size / 2) + "px";
    dot.style.top = (e.clientY - r.top - size / 2) + "px";
    host.appendChild(dot);
    dot.addEventListener("animationend", function () { dot.remove(); });
  });

  // Scroll reveals: each kind of element gets its own entrance; grid items are staggered.
  var REVEALS = [
    ["rise", ".eyebrow, .section-title, .section-subtitle, .case-section-title, .selected-group-head, .video-portfolio, .photo-portfolio, .profile-intro, .timeline-era, .timeline-year-group, .showcase-body, .showcase-backend, .contact-card, .deliverable-list, .label-heading, .format-details, .travel-details, .principle-grid .process-step"],
    ["card", ".collection-grid > *"],
    ["zoom", ".photo-item, .scouting-hero-photo, [data-img], .gallery-image"],
    ["wipe", ".cta-panel, .info-panel, .feature-card"],
    ["slide", ".timeline-entry, .timeline-year-group, .snapshot-row, .backend-list li, .brief-list li, .showcase-facts > div, .browser-frame"],
    ["pop", ".phone-frame"]
  ];
  var revealObserver = motionOK ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var group = [entry.target];
      // A wipe panel clips its children while it opens, so they may never register as visible;
      // reveal them with the panel instead (their own stagger delays still apply).
      if (entry.target.getAttribute("data-reveal") === "wipe") group = group.concat(Array.prototype.slice.call(entry.target.querySelectorAll("[data-reveal]:not(.is-revealed)")));
      // Phone swipe rows: cards beyond the right edge never meet the viewport, so the row enters as one.
      var row = entry.target.parentElement;
      if (row && row.scrollWidth > row.clientWidth + 1) group = group.concat(Array.prototype.slice.call(row.querySelectorAll(":scope > [data-reveal]:not(.is-revealed)")));
      group.forEach(function (el) {
        el.classList.add("is-revealed");
        revealObserver.unobserve(el);
        countUp(el);
      });
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0 }) : null;
  // Opening a disclosure shows its items at once (with their stagger) instead of waiting for scroll.
  if (revealObserver) document.addEventListener("toggle", function (e) {
    if (!e.target.open || !e.target.querySelectorAll) return;
    // Disclosures that start open (desktop) also fire toggle at load; leave off-screen ones to the observer.
    var box = e.target.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    e.target.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(function (el) {
      el.classList.add("is-revealed");
      revealObserver.unobserve(el);
    });
  }, true);
  function registerReveals() {
    if (!revealObserver) return;
    REVEALS.forEach(function (pair) {
      document.querySelectorAll(pair[1]).forEach(function (el) {
        if (el.hasAttribute("data-reveal") || el.closest(".portfolio-hero, [data-section='intro'], .site-header, .site-footer, .mobile-menu")) return;
        if (pair[0] === "rise" && el.closest(".card, .cta-panel, .info-panel")) return;
        if (el.parentElement && el.parentElement.closest("[data-reveal]:not(.site-showcase)") && pair[0] !== "slide" && pair[0] !== "pop") return;
        var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.setAttribute("data-reveal", pair[0]);
        el.style.setProperty("--reveal-delay", Math.min(siblings, 6) * 70 + "ms");
        // Content hydrated after the visitor scrolled past it is already "seen": show it as is.
        if (el.getBoundingClientRect().bottom < 0) { el.classList.add("is-revealed"); return; }
        revealObserver.observe(el);
      });
    });
  }
  function countUp(root) {
    root.querySelectorAll ? [root].concat(Array.prototype.slice.call(root.querySelectorAll("[data-travel-count], .stat-value"))).forEach(function (el) {
      if (!el.matches || !el.matches("[data-travel-count], .stat-value") || el.__counted) return;
      var m = /^(\d{1,4})(.*)$/.exec((el.textContent || "").trim());
      if (!m) return;
      el.__counted = true;
      var target = +m[1], rest = m[2], start = null;
      var step = function (t) { if (start === null) start = t; var k = Math.min(1, (t - start) / 1100), eased = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(target * eased) + rest; if (k < 1) window.requestAnimationFrame(step); };
      window.requestAnimationFrame(step);
    }) : null;
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


  function timelineStartYear(item) {
    var m = String((item && item.year) || "").match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : 0;
  }

  var TIMELINE_KIND_LABELS = {
    award: "Award",
    photography: "Photography",
    instructor: "Instructor",
    participation: "Participation",
    leadership: "Leadership",
    training: "Training",
    mentoring: "Mentoring",
    media: "Media",
    publication: "Publication",
    bid: "Bid campaign"
  };

  function timelineKindLabel(kind) {
    return TIMELINE_KIND_LABELS[kind] || "Participation";
  }

  function timelineYearSummary(items) {
    var list = items || [];
    var titles = list.map(function (t) { return String(t.title || "").trim(); }).filter(Boolean);
    var kinds = [];
    list.forEach(function (t) {
      var label = timelineKindLabel(t.kind);
      if (kinds.indexOf(label) === -1) kinds.push(label);
    });
    var kindBit = kinds.length ? kinds.join(" · ") : "";
    if (!titles.length) return kindBit || "No entries.";
    if (titles.length === 1) return (kindBit ? kindBit + " — " : "") + titles[0] + ".";
    if (titles.length === 2) return (kindBit ? kindBit + ": " : "") + titles[0] + "; " + titles[1] + ".";
    var head = titles[0] + "; " + titles[1] + "; " + titles[2];
    if (titles.length === 3) return (kindBit ? kindBit + ": " : "") + head + ".";
    return (kindBit ? kindBit + ": " : "") + head + " · +" + (titles.length - 3) + " more.";
  }

  function renderTimelineByYear(items) {
    var groups = {};
    (items || []).forEach(function (item) {
      var y = timelineStartYear(item);
      if (!y) return;
      if (!groups[y]) groups[y] = [];
      groups[y].push(item);
    });
    var years = Object.keys(groups).map(Number).sort(function (a, b) { return b - a; });
    if (!years.length) return "";
    return years.map(function (year, idx) {
      var list = groups[year].slice().sort(function (a, b) {
        return String(a.year || "").localeCompare(String(b.year || ""));
      });
      var summary = timelineYearSummary(list);
      var open = idx === 0 ? " open" : "";
      var body = list.map(function (t) { return TT.timelineEntry(t); }).join("");
      return '<details class="timeline-year-group"' + open + '>' +
        '<summary class="timeline-year-summary">' +
          '<span class="timeline-year-label">' + esc(String(year)) + '</span>' +
          '<span class="timeline-year-count">' + list.length + (list.length === 1 ? " entry" : " entries") + '</span>' +
          '<span class="timeline-year-blurb">' + esc(summary) + '</span>' +
        '</summary>' +
        '<div class="timeline-year-body">' + body + '</div>' +
      '</details>';
    }).join("");
  }


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
    siteCases: function (s) {
      var href = /^https:\/\//.test(s.href || "") ? s.href : "";
      var media = s.image ? '<img src="' + esc(s.image) + '" alt="Homepage of ' + esc(s.title) + '" loading="lazy" decoding="async" width="1280" height="720">' : '<span class="case-placeholder">' + esc(s.title) + '</span>';
      return '<article class="card project-card site-case"><div class="case-media">' + media + '</div><div class="card-body">' +
        '<div class="case-meta"><span class="eyebrow">' + esc(s.format) + '</span>' + (s.year ? '<span class="tag">' + esc(s.year) + '</span>' : '') + '</div>' +
        '<h3>' + esc(s.title) + '</h3><p class="case-role">' + esc(s.role) + '</p><p>' + esc(s.summary) + '</p>' +
        (href ? '<a class="card-link" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc((s.linkLabel || 'Visit site') + ': ' + s.title) + '">' + esc(s.linkLabel || 'Visit site') + '<span class="msym" aria-hidden="true">north_east</span></a>' : '') + '</div></article>';
    },
    siteShowcase: function (s) {
      var href = /^https:\/\//.test(s.href || "") ? s.href : "";
      var domain = href.replace(/^https:\/\//, "").replace(/\/$/, "");
      var screen = s.image ? '<img src="' + esc(s.image) + '" alt="Desktop homepage of ' + esc(s.title) + '" loading="lazy" decoding="async" width="1280" height="720">' : '<span class="case-placeholder">' + esc(s.title) + '</span>';
      var phone = s.mobileImage ? '<div class="phone-frame"><img src="' + esc(s.mobileImage) + '" alt="Mobile homepage of ' + esc(s.title) + '" loading="lazy" decoding="async" width="360" height="780"></div>' : '';
      var facts = [['The need', s.need], ['What I built', s.built], ['Role', s.role]].filter(function (f) { return f[1]; })
        .map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');
      var stack = String(s.stack || '').split('·').map(function (t) { return t.trim(); }).filter(Boolean)
        .map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var backendItems = String(s.backend || '').split('\n').map(function (t) { return t.trim(); }).filter(Boolean);
      var stats = String(s.stats || '').split('·').map(function (t) { return t.trim(); }).filter(Boolean)
        .map(function (t) { return '<span class="stat-chip">' + esc(t) + '</span>'; }).join('');
      var adminShot = s.adminImage ? '<figure class="backend-shot"><div class="browser-frame"><div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><span class="browser-url">Admin console</span></div>' +
        '<div class="browser-screen browser-screen--admin"><img src="' + esc(s.adminImage) + '" alt="Admin console of ' + esc(s.title) + '" loading="lazy" decoding="async" width="1280" height="800"></div></div>' +
        (s.adminCaption ? '<figcaption>' + esc(s.adminCaption) + '</figcaption>' : '') + '</figure>' : '';
      var backend = backendItems.length || adminShot ? '<div class="showcase-backend"><div class="backend-head"><span class="eyebrow">Behind the site</span><h4 class="backend-title">Admin console &amp; back end</h4>' +
        (stats ? '<div class="stat-chips">' + stats + '</div>' : '') + '</div><details class="backend-details" open><summary class="backend-toggle"><span class="backend-toggle-show">Show admin features' + (adminShot ? ' &amp; screenshot' : '') + '</span><span class="backend-toggle-hide">Hide admin features</span><span class="msym" aria-hidden="true">expand_more</span></summary><div class="backend-grid' + (adminShot ? ' has-shot' : '') + '">' + adminShot +
        (backendItems.length ? '<ul class="backend-list">' + backendItems.map(function (t) { return '<li><span class="msym" aria-hidden="true">check_circle</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ul>' : '') + '</div></details></div>' : '';
      return '<article class="site-showcase"><div class="showcase-stage' + (phone ? ' has-phone' : '') + '"><div class="browser-frame"><div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span>' +
        (domain ? '<span class="browser-url">' + esc(domain) + '</span>' : '') + '</div><div class="browser-screen">' + screen + '</div></div>' + phone + '</div>' +
        '<div class="showcase-body"><div class="case-meta"><span class="eyebrow">' + esc(s.format) + '</span>' + (s.year ? '<span class="tag">' + esc(s.year) + '</span>' : '') + '</div>' +
        '<h3>' + esc(s.title) + '</h3>' + (s.summary ? '<p class="showcase-summary">' + esc(s.summary) + '</p>' : '') +
        (facts ? '<dl class="showcase-facts">' + facts + '</dl>' : '') + (stack ? '<div class="tag-list">' + stack + '</div>' : '') +
        (href ? '<a class="btn btn-primary site-button" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc((s.linkLabel || 'Visit site') + ': ' + s.title) + '">' + esc(s.linkLabel || 'Visit site') + '<span class="msym" aria-hidden="true">north_east</span></a>' : '') +
        '</div>' + backend + '</article>';
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
        '<span class="card-link">Learn more <span class="msym" aria-hidden="true">arrow_forward</span></span></div></a>';
    },
    photoDeliverables: function (d) {
      return '<li class="deliverable"><span class="msym" aria-hidden="true">check_small</span>' + esc(d.text) + '</li>';
    },
    pills: function (t) { return '<span class="tag">' + esc(t.text) + '</span>'; },
    videoFormats: function (f) {
      return '<div class="format-row"><div class="format-name">' + esc(f.name) + '</div><div class="body-copy">' + esc(f.desc) + '</div></div>';
    },
    lectureTalks: function (t) {
      var href = t.href || "";
      var external = /^https:\/\//.test(href);
      var internal = href.charAt(0) === "/" && href.charAt(1) !== "/";
      var link = external || internal;
      var eyebrow = t.category || t.org || "";
      return '<article class="card project-card lecture-talk"><div class="card-body">' +
        '<div class="case-meta">' + (eyebrow ? '<span class="eyebrow">' + esc(eyebrow) + '</span>' : '') +
        (t.year ? '<span class="tag">' + esc(t.year) + '</span>' : '') + '</div>' +
        '<h3>' + esc(t.title) + '</h3>' +
        (t.org ? '<p class="case-role">' + esc(t.org) + (t.role ? ' · ' + esc(t.role) : '') + '</p>' : (t.role ? '<p class="case-role">' + esc(t.role) + '</p>' : '')) +
        (t.summary ? '<p>' + esc(t.summary) + '</p>' : '') +
        (link ? '<a class="card-link" href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
          '>Details<span class="msym" aria-hidden="true">north_east</span></a>' : '') +
        '</div></article>';
    },
    vibeItems: function (v) {
      var media = v.image ? '<div class="project-image" role="img" aria-label="' + esc(v.title) + '" style="background-image:url(&quot;' + esc(v.image) + '&quot;)"></div>' : '';
      return '<article class="card project-card">' + media + '<div class="card-body"><span class="tag status-tag">' + esc(v.status) + '</span>' +
        '<h3>' + esc(v.title) + '</h3><p>' + esc(v.desc) + '</p>' + (/^https:\/\//.test(v.href || '') ? '<a class="card-link" href="' + esc(v.href) + '" target="_blank" rel="noopener noreferrer">Open project<span class="msym" aria-hidden="true">north_east</span></a>' : '') + '</div></article>';
    },
    scoutStats: function (s, i) {
      return '<div class="stat"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
    },
    scoutRoles: function (r) {
      return '<div class="card card--compact role-card' + (r.accent === "green" ? ' card--scouting' : '') + '"><div class="role-header"><div class="role-body"><h3>' +
        esc(r.title) + '</h3><p>' + esc(r.org) + '</p></div><span class="tag period">' + esc(r.period) + '</span></div></div>';
    },
    intlTags: function (t) { return '<span class="tag tag--scouting tag--large">' + esc(t.text) + '</span>'; },
    mediaProjects: function (m) { return '<div class="card card--compact"><h3>' + esc(m.title) + '</h3><p>' + esc(m.desc) + '</p></div>'; },
    timelineEntry: function (t) {
      var href = t.href || "";
      var link = /^https:\/\//.test(href);
      var kind = t.kind || "participation";
      var kindLabel = timelineKindLabel(kind);
      return '<article class="timeline-entry"><div class="timeline-year">' + esc(t.year) + '</div><div class="timeline-content">' +
        '<div class="timeline-chips"><span class="tag timeline-kind timeline-kind--' + esc(kind) + '">' + esc(kindLabel) + '</span></div>' +
        '<h3>' + esc(t.title) + '</h3>' + (t.context ? '<p>' + esc(t.context) + '</p>' : '') +
        (link ? '<a class="card-link" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">Host association<span class="msym" aria-hidden="true">north_east</span></a>' : '') +
        '</div></article>';
    },
    // Kept for admin preview compatibility; year grouping uses renderTimelineByYear.
    timeline: function (t, i, items) {
      return TT.timelineEntry(t);
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

  function safeSiteUrl(value, externalOnly) {
    if (typeof value !== 'string') return '';
    var url = value.trim();
    if (!url || /[\u0000-\u0020\\]/.test(url)) return '';
    if (!externalOnly && (url.charAt(0) === '#' || (url.charAt(0) === '/' && url.slice(0,2) !== '//'))) return url;
    if (url.slice(0,8) !== 'https://') return '';
    try { var parsed = new URL(url); return parsed.hostname && !parsed.username && !parsed.password ? url : ''; } catch (_) { return ''; }
  }
  function cleanPreviewUrls(value) {
    if (!value || typeof value !== 'object') return value;
    Object.keys(value).forEach(function (key) {
      if (['href','image','linkedin'].indexOf(key) >= 0 && typeof value[key] === 'string') value[key] = safeSiteUrl(value[key], key === 'linkedin');
      else if (value[key] && typeof value[key] === 'object') cleanPreviewUrls(value[key]);
    });
    return value;
  }

  function applyDoc(content) {
    if (!content) return;
    content = cleanPreviewUrls(content);
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

    // Keep the profile's machine-readable identity aligned with editable visible content.
    if (page === 'home') {
      var personNode = document.querySelector('script[type="application/ld+json"]');
      if (personNode) try {
        var person = JSON.parse(personNode.textContent);
        if (person['@type'] === 'Person') {
          person.name = (g.brand || {}).name || person.name;
          person.description = (sd.snapshot || {}).body || person.description;
          if ((sd.hero || {}).image) person.image = new URL(sd.hero.image, 'https://jimmypark.net').href;
          person.sameAs = (g.contact || {}).linkedin ? [g.contact.linkedin] : [];
          if ((g.contact || {}).email) person.email = g.contact.email;
          personNode.textContent = JSON.stringify(person).replace(/</g, '\\u003c');
        }
      } catch (_) {}
    }

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
      var tmplName = el.getAttribute("data-template");
      var t = TT[tmplName];
      if (!Array.isArray(arr) || !t) return;
      if (tmplName === "timeline") el.innerHTML = renderTimelineByYear(arr);
      else el.innerHTML = arr.map(function (it, i) { return t(it, i, arr); }).join("");
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
    compactDetails();
    registerReveals();
  }

  // Phones: long back-end lists start collapsed; the facts (chips) stay visible. Without JS they stay open.
  function compactDetails() {
    if (!window.matchMedia || !window.matchMedia('(max-width: 599px)').matches) return;
    document.querySelectorAll('.backend-details[open]').forEach(function (d) { d.open = false; });
  }
  compactDetails();

  // Shuffle the supplied portfolio selection once per visit; keep every image visible.
  document.querySelectorAll('[data-photo-shuffle]').forEach(function (grid) {
    var photos = Array.prototype.slice.call(grid.children);
    for (var i = photos.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var swap = photos[i]; photos[i] = photos[j]; photos[j] = swap; }
    photos.forEach(function (photo) { grid.appendChild(photo); });
  });

  registerReveals();

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
