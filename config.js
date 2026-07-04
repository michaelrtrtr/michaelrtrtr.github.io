// ---- Discord OAuth config ----
// 1. Go to https://discord.com/developers/applications and create an application.
// 2. Copy its "Client ID" (OAuth2 tab) and paste it below.
// 3. In the OAuth2 > Redirects section, add the exact URL of your login page
//    (e.g. https://yourusername.github.io/index.html) and save.
// 4. That's it — no client secret or backend needed for this flow.

const DISCORD_CONFIG = {
  clientId: "1510808228810981467",
  // Fixed on purpose — this must be the EXACT string you add under
  // OAuth2 > Redirects in the Discord Developer Portal. Don't let it
  // auto-detect the URL, or "www vs no-www" / trailing-slash mismatches
  // will randomly break login.
  redirectUri: "https://michaelrtrtr.github.io/",
  scope: "identify",
};
