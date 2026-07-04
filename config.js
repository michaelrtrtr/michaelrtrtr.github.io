// ---- Discord OAuth config ----
// 1. Go to https://discord.com/developers/applications and create an application.
// 2. Copy its "Client ID" (OAuth2 tab) and paste it below.
// 3. In the OAuth2 > Redirects section, add the exact URL of your login page
//    (e.g. https://yourusername.github.io/index.html) and save.
// 4. That's it — no client secret or backend needed for this flow.

const DISCORD_CONFIG = {
  clientId: "1510808228810981467",
  // Auto-matches whatever URL this page is actually running on,
  // so it works both locally and once you publish it.
  redirectUri: window.location.origin + window.location.pathname,
  scope: "identify",
};
