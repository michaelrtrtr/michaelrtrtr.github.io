const ICONS = {
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/></svg>`,
  servers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><circle cx="7" cy="7" r="0.8" fill="currentColor" stroke="none"/><circle cx="7" cy="17" r="0.8" fill="currentColor" stroke="none"/></svg>`,
  automation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke-linejoin="round"/></svg>`,
  logs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.5-2-3.4-2.4.7a8.06 8.06 0 0 0-1.7-1L15 3h-4l-.3 2.4a8.06 8.06 0 0 0-1.7 1l-2.4-.7-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a8.06 8.06 0 0 0 1.7 1L11 21h4l.3-2.4a8.06 8.06 0 0 0 1.7-1l2.4.7 2-3.4-2-1.6Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
};

function applyIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = ICONS[el.dataset.icon] || "";
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("username");

  if (!username) {
    // No profile in the URL — nobody's actually logged in. Bounce back.
    window.location.href = "index.html";
    return;
  }

  const handle = params.get("handle") || username;
  const avatar = params.get("avatar") || "https://cdn.discordapp.com/embed/avatars/0.png";

  document.getElementById("chip-avatar").src = avatar;
  document.getElementById("chip-name").textContent = username;
  document.getElementById("chip-tag").textContent = "@" + handle;
  document.getElementById("hello-name").textContent = username;
}

function wireNav() {
  const items = document.querySelectorAll(".nav-item[data-tab]");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      document.getElementById("panel-title").textContent = item.dataset.label;
      showToast(`${item.dataset.label} — nothing wired up here yet`);
    });
  });
}

function wireButtons() {
  document.querySelectorAll(".btn[data-inert]").forEach((btn) => {
    btn.addEventListener("click", () => showToast("This button doesn't do anything yet"));
  });

  document.getElementById("logout-item").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyIcons();
  loadProfile();
  wireNav();
  wireButtons();
});
