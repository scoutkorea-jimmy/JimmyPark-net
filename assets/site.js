/* Shared public-site behavior: nav, mobile menu, copy-to-clipboard, gallery
   modal, and live content hydration from /api/content. Pages render full static
   content (good for SEO / no-JS); this only enhances + applies admin overrides. */
(function () {
  "use strict";

  // ── Active nav + mobile menu ──────────────────────────────────────────────
  var page = document.body.getAttribute("data-page") || "home";
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

  // ── Copy to clipboard + toast ─────────────────────────────────────────────
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

  // ── Gallery modal ─────────────────────────────────────────────────────────
  var modal = document.querySelector(".gal-modal");
  if (modal) {
    var mLabel = modal.querySelector("[data-gal-label]");
    var mCat = modal.querySelector("[data-gal-cat]");
    document.querySelectorAll(".galfig").forEach(function (fig) {
      fig.addEventListener("click", function () {
        if (mLabel) mLabel.textContent = fig.getAttribute("data-glabel") || "";
        if (mCat) mCat.textContent = (fig.getAttribute("data-gcat") || "") + " · year / event placeholder";
        modal.classList.add("open");
      });
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal || (e.target.closest && e.target.closest("[data-gal-close]"))) {
        modal.classList.remove("open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.classList.remove("open");
    });
  }

  // ── Content hydration (admin overrides) ───────────────────────────────────
  function setText(sel, val) {
    document.querySelectorAll(sel).forEach(function (el) { if (val != null) el.textContent = val; });
  }
  fetch("/api/content")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.content) return;
      var c = j.content;
      // SEO
      if (c.seo) {
        if (c.seo.title) document.title = c.seo.title;
        if (c.seo.desc) {
          var m = document.querySelector('meta[name="description"]');
          if (m) m.setAttribute("content", c.seo.desc);
        }
      }
      // Contact
      if (c.contact) {
        if (c.contact.email) {
          setText("[data-bind=email]", c.contact.email);
          document.querySelectorAll("a[data-mail]").forEach(function (a) { a.href = "mailto:" + c.contact.email; });
          document.querySelectorAll("[data-copy-email]").forEach(function (b) { b.setAttribute("data-copy", c.contact.email); });
        }
        if (c.contact.phone) {
          setText("[data-bind=phone]", c.contact.phone);
          document.querySelectorAll("a[data-tel]").forEach(function (a) { a.href = "tel:" + c.contact.phone.replace(/[^0-9+]/g, ""); });
          document.querySelectorAll("[data-copy-phone]").forEach(function (b) { b.setAttribute("data-copy", c.contact.phone); });
        }
        if (c.contact.location) setText("[data-bind=location]", c.contact.location);
        var li = document.querySelector("[data-li-block]");
        if (li) {
          if (c.contact.linkedin) {
            li.style.display = "";
            var link = li.querySelector("a");
            if (link) {
              link.href = c.contact.linkedin;
              var lbl = li.querySelector("[data-li-label]");
              if (lbl) lbl.textContent = c.contact.linkedin.replace(/^https?:\/\//, "").replace(/\/$/, "");
            }
          } else { li.style.display = "none"; }
        }
      }
      // Hero image
      if (c.hero && c.hero.image) {
        document.querySelectorAll("[data-hero-image]").forEach(function (el) {
          el.style.backgroundImage = "url('" + c.hero.image + "')";
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
        });
      }
    })
    .catch(function () {});
})();
