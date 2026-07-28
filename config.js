// ── Discord OAuth ─────────────────────────────────────────────────────────────
// Same as before — fill in your Discord app's Client ID
const DISCORD_CONFIG = {
  clientId: "1510808228810981467",
  redirectUri: "https://michaelrtrtr.github.io/",
  scope: "identify",
};

// ── Firebase ──────────────────────────────────────────────────────────────────
// 1. Go to console.firebase.google.com → create a project (free Spark plan)
// 2. Add a Realtime Database (Start in test mode for now)
// 3. Project Settings → Service Accounts → Database Secrets → Show → copy it
// 4. Your DB URL is shown on the Realtime Database page (looks like
//    https://your-project-default-rtdb.firebaseio.com)
// Paste both below:
const FIREBASE_CONFIG = {
  dbUrl:   "",   // e.g.  https://zero-x-a1b2c3-default-rtdb.firebaseio.com
  secret:  "",   // your database secret (legacy token, still works)
};
