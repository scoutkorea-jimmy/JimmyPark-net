/* Jimmy Park admin — TOTP login + content editor + media library.
   Talks to /api/login, /api/me, /api/content, /api/image. */
(function () {
  "use strict";

  var SESS_KEY = "jp:admin-session";
  var IDLE_MS = 30 * 60 * 1000; // 30 min auto sign-out

  var $ = function (id) { return document.getElementById(id); };
  var session = null;           // { token, exp }
  var content = null;           // working content document
  var heroImage = "";           // current hero image url
  var uploadTarget = "media";   // "media" | "hero"
  var idleTimer = null, idleDeadline = 0, idleTick = null;

  // ── session helpers ─────────────────────────────────────────────────────
  function loadSession() {
    try {
      var s = JSON.parse(localStorage.getItem(SESS_KEY) || "null");
      if (s && s.token && s.exp && Date.now() < s.exp) return s;
    } catch (_) {}
    return null;
  }
  function saveSession(s) { session = s; try { localStorage.setItem(SESS_KEY, JSON.stringify(s)); } catch (_) {} }
  function clearSession() { session = null; try { localStorage.removeItem(SESS_KEY); } catch (_) {} }
  function authHeader() { return session ? { Authorization: "Bearer " + session.token } : {}; }

  // ── auth UI ─────────────────────────────────────────────────────────────
  function showGate(msg) {
    stopIdle();
    $("dash").style.display = "none";
    $("gate").style.display = "flex";
    $("gate-msg").textContent = msg || "";
    var otp = $("otp"); if (otp) { otp.value = ""; otp.focus(); }
  }
  function showDash() {
    $("gate").style.display = "none";
    $("dash").style.display = "block";
    startIdle();
  }

  function login() {
    var code = ($("otp").value || "").replace(/\D/g, "");
    if (code.length !== 6) { $("gate-msg").textContent = "Enter the 6-digit code."; return; }
    $("gate-msg").textContent = "Checking…";
    fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: code }),
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok && res.j.token) {
          saveSession({ token: res.j.token, exp: res.j.exp || (Date.now() + 12 * 3600 * 1000) });
          $("gate-msg").textContent = "";
          showDash();
          boot();
        } else {
          var e = res.j && res.j.error;
          $("gate-msg").textContent = e === "rate_limited" ? "Too many attempts. Try again later."
            : e === "not_configured" ? "Server not configured (TOTP_SECRET missing)."
            : "Incorrect or expired code.";
        }
      })
      .catch(function () { $("gate-msg").textContent = "Network error. Try again."; });
  }

  function logout() { clearSession(); showGate("Signed out."); }

  // ── idle auto sign-out ──────────────────────────────────────────────────
  function startIdle() {
    resetIdle();
    ["pointerdown", "keydown", "wheel", "touchstart", "input", "change"].forEach(function (ev) {
      document.addEventListener(ev, resetIdle, { passive: true, capture: true });
    });
    if (idleTick) clearInterval(idleTick);
    idleTick = setInterval(renderIdle, 1000);
    renderIdle();
  }
  function stopIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    if (idleTick) clearInterval(idleTick);
    ["pointerdown", "keydown", "wheel", "touchstart", "input", "change"].forEach(function (ev) {
      document.removeEventListener(ev, resetIdle, { capture: true });
    });
  }
  function resetIdle() {
    idleDeadline = Date.now() + IDLE_MS;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { clearSession(); showGate("Signed out after 30 minutes of inactivity."); }, IDLE_MS);
  }
  function renderIdle() {
    var el = $("idle"); if (!el) return;
    var left = Math.max(0, idleDeadline - Date.now());
    var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    el.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
    el.style.color = left < 60000 ? "#7a1e2c" : "#66615c";
  }

  // ── content load / save ─────────────────────────────────────────────────
  function boot() {
    fetch("/api/content")
      .then(function (r) { return r.json(); })
      .then(function (j) {
        content = (j && j.content) || {};
        var c = content.contact || {}, s = content.seo || {}, h = content.hero || {};
        $("c-email").value = c.email || "";
        $("c-phone").value = c.phone || "";
        $("c-li").value = c.linkedin || "";
        $("c-loc").value = c.location || "";
        $("s-title").value = s.title || "";
        $("s-desc").value = s.desc || "";
        setHero(h.image || "");
      })
      .catch(function () {});
    loadMedia();
  }

  function setHero(url) {
    heroImage = url || "";
    var p = $("hero-prev");
    if (heroImage) { p.style.backgroundImage = "url('" + heroImage + "')"; }
    else { p.style.backgroundImage = ""; }
  }

  function save() {
    var msg = $("save-msg");
    msg.textContent = "Saving…"; msg.className = "ad-msg";
    var doc = {
      seo: { title: $("s-title").value, desc: $("s-desc").value },
      contact: {
        email: $("c-email").value, phone: $("c-phone").value,
        linkedin: $("c-li").value, location: $("c-loc").value,
      },
      hero: { image: heroImage },
    };
    fetch("/api/content", {
      method: "PUT",
      headers: Object.assign({ "content-type": "application/json" }, authHeader()),
      body: JSON.stringify({ content: doc }),
    })
      .then(function (r) {
        if (r.status === 401) { clearSession(); showGate("Session expired — enter a new code."); throw new Error("401"); }
        return r.json();
      })
      .then(function (j) {
        if (j && j.ok) { content = j.content; msg.textContent = "✓ Saved"; msg.className = "ad-msg ad-ok"; setTimeout(function () { msg.textContent = ""; }, 2400); }
        else { msg.textContent = "Save failed."; msg.className = "ad-msg ad-err"; }
      })
      .catch(function (e) { if (String(e.message) !== "401") { msg.textContent = "Save failed."; msg.className = "ad-msg ad-err"; } });
  }

  // ── media library ───────────────────────────────────────────────────────
  function loadMedia() {
    fetch("/api/image?list=1", { headers: authHeader() })
      .then(function (r) { if (r.status === 401) { throw new Error("401"); } return r.json(); })
      .then(function (j) { renderMedia((j && j.items) || []); })
      .catch(function () {});
  }
  function renderMedia(items) {
    $("media-count").textContent = String(items.length);
    var box = $("media");
    box.innerHTML = "";
    items.forEach(function (m) {
      var url = "/api/image?id=" + m.id;
      var el = document.createElement("div");
      el.className = "ad-mitem";
      el.innerHTML =
        '<img src="' + url + '" alt="" loading="lazy">' +
        '<div class="ad-mbar">' +
        '<button data-hero="' + url + '">Hero</button>' +
        '<button class="del" data-del="' + m.id + '">Delete</button>' +
        "</div>";
      box.appendChild(el);
    });
  }

  // resize via canvas → JPEG blob
  function downscale(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.width, h = img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var cv = document.createElement("canvas");
        cv.width = cw; cv.height = ch;
        cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error("encode")); }, "image/jpeg", quality || 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }

  function uploadFiles(files) {
    var arr = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!arr.length) return;
    var msg = $("save-msg");
    msg.textContent = "Uploading…"; msg.className = "ad-msg";
    var lastUrl = "";
    var chain = Promise.resolve();
    arr.forEach(function (f) {
      chain = chain.then(function () {
        return downscale(f, 1600, 0.85).then(function (blob) {
          return fetch("/api/image", {
            method: "POST",
            headers: Object.assign({ "content-type": "image/jpeg", "X-Filename": f.name || "image.jpg" }, authHeader()),
            body: blob,
          }).then(function (r) {
            if (r.status === 401) { clearSession(); showGate("Session expired — enter a new code."); throw new Error("401"); }
            return r.json();
          }).then(function (j) { if (j && j.url) lastUrl = j.url; });
        });
      });
    });
    chain.then(function () {
      msg.textContent = "✓ Uploaded"; msg.className = "ad-msg ad-ok";
      setTimeout(function () { msg.textContent = ""; }, 2000);
      if (uploadTarget === "hero" && lastUrl) setHero(lastUrl);
      uploadTarget = "media";
      loadMedia();
    }).catch(function (e) {
      if (String(e.message) !== "401") { msg.textContent = "Upload failed."; msg.className = "ad-msg ad-err"; }
      uploadTarget = "media";
    });
  }

  function deleteMedia(id) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    fetch("/api/image?id=" + encodeURIComponent(id), { method: "DELETE", headers: authHeader() })
      .then(function (r) { if (r.status === 401) { clearSession(); showGate("Session expired — enter a new code."); throw new Error("401"); } return r.json(); })
      .then(function () { loadMedia(); })
      .catch(function () {});
  }

  // ── wire up ─────────────────────────────────────────────────────────────
  function wire() {
    $("otp-btn").addEventListener("click", login);
    $("otp").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
    $("logout").addEventListener("click", logout);
    $("save").addEventListener("click", save);

    var fi = $("file-input");
    fi.addEventListener("change", function () { if (fi.files && fi.files.length) uploadFiles(fi.files); fi.value = ""; });

    $("drop").addEventListener("click", function () { uploadTarget = "media"; fi.click(); });
    $("drop").addEventListener("dragover", function (e) { e.preventDefault(); });
    $("drop").addEventListener("drop", function (e) {
      e.preventDefault();
      uploadTarget = "media";
      if (e.dataTransfer && e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
    });
    $("hero-upload").addEventListener("click", function () { uploadTarget = "hero"; fi.click(); });
    $("hero-clear").addEventListener("click", function () { setHero(""); });

    $("media").addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("button");
      if (!t) return;
      if (t.hasAttribute("data-hero")) setHero(t.getAttribute("data-hero"));
      else if (t.hasAttribute("data-del")) deleteMedia(t.getAttribute("data-del"));
    });
  }

  // ── init ────────────────────────────────────────────────────────────────
  wire();
  session = loadSession();
  if (session) {
    // verify the stored session is still valid server-side
    fetch("/api/me", { headers: authHeader() })
      .then(function (r) { return r.ok; })
      .then(function (ok) { if (ok) { showDash(); boot(); } else { clearSession(); showGate(); } })
      .catch(function () { showGate(); });
  } else {
    showGate();
  }
})();
