const ICONS = {
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>`,
  automation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke-linejoin="round"/></svg>`,
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

  setSrc("profile-avatar", profile.avatar);
  setText("profile-name", profile.username);
  setText("profile-handle", "@" + profile.handle);
  setText("profile-id", profile.id);

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

  const applyBtn = $("nickname-apply");
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

function initMap() {
  const canvas = $("map-canvas");
  const shell = $("map-shell");
  if (!canvas || !shell) return;
  const ctx = canvas.getContext("2d");

  const nodes = [
    { x: 0, y: 0, label: "Core" },
    { x: 180, y: -90, label: "Node A" },
    { x: -160, y: -60, label: "Node B" },
    { x: 120, y: 130, label: "Node C" },
    { x: -190, y: 110, label: "Node D" },
    { x: 40, y: -180, label: "Node E" },
    { x: -60, y: 190, label: "Node F" },
  ];

  const links = [
    [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [3, 6],
  ];

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = shell.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    draw();
  }

  function worldToScreen(x, y) {
    const rect = shell.getBoundingClientRect();
    return {
      x: (rect.width / 2) + (x + offsetX) * scale,
      y: (rect.height / 2) + (y + offsetY) * scale,
    };
  }

  function draw() {
    const rect = shell.getBoundingClientRect();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const gridSize = 40 * scale;
    const originX = (rect.width / 2) + (offsetX * scale) % gridSize;
    const originY = (rect.height / 2) + (offsetY * scale) % gridSize;
    ctx.fillStyle = "rgba(124, 92, 252, 0.14)";
    for (let x = originX % gridSize; x < rect.width; x += gridSize) {
      for (let y = originY % gridSize; y < rect.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = "rgba(124, 92, 252, 0.35)";
    ctx.lineWidth = 1.4;
    links.forEach(([a, b]) => {
      const pa = worldToScreen(nodes[a].x, nodes[a].y);
      const pb = worldToScreen(nodes[b].x, nodes[b].y);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    nodes.forEach((n, i) => {
      const p = worldToScreen(n.x, n.y);
      const r = (i === 0 ? 9 : 6) * Math.min(scale, 1.6);

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
      glow.addColorStop(0, i === 0 ? "rgba(76, 224, 210, 0.5)" : "rgba(124, 92, 252, 0.45)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = i === 0 ? "#4ce0d2" : "#7c5cfc";
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(231, 233, 243, 0.85)";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.label, p.x, p.y - r - 8);
    });
  }

  function zoomAt(factor, cx, cy) {
    const rect = shell.getBoundingClientRect();
    const before = { x: (cx - rect.width / 2) / scale - offsetX, y: (cy - rect.height / 2) / scale - offsetY };
    scale = Math.min(3, Math.max(0.4, scale * factor));
    const after = { x: (cx - rect.width / 2) / scale - offsetX, y: (cy - rect.height / 2) / scale - offsetY };
    offsetX += after.x - before.x;
    offsetY += after.y - before.y;
    draw();
  }

  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    canvas.classList.add("grabbing");
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    offsetX += (e.clientX - lastX) / scale;
    offsetY += (e.clientY - lastY) / scale;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
    canvas.classList.remove("grabbing");
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = shell.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (!dragging || e.touches.length !== 1) return;
    e.preventDefault();
    offsetX += (e.touches[0].clientX - lastX) / scale;
    offsetY += (e.touches[0].clientY - lastY) / scale;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    draw();
  }, { passive: false });

  canvas.addEventListener("touchend", () => { dragging = false; });

  const zoomInBtn = $("map-zoom-in");
  if (zoomInBtn) zoomInBtn.addEventListener("click", () => {
    const rect = shell.getBoundingClientRect();
    zoomAt(1.2, rect.width / 2, rect.height / 2);
  });

  const zoomOutBtn = $("map-zoom-out");
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => {
    const rect = shell.getBoundingClientRect();
    zoomAt(0.83, rect.width / 2, rect.height / 2);
  });

  const resetBtn = $("map-reset");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    scale = 1; offsetX = 0; offsetY = 0; draw();
  });

  window.addEventListener("resize", resize);
  resize();

  window.__mapWidget = { resize, draw };
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
  safeRun(initMap, "initMap");
});
