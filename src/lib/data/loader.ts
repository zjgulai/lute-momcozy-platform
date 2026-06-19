import fs from "fs";
import path from "path";

const DATA_ROOT = path.resolve(
  process.cwd(),
  "../lute-momcozy-audit/src/_data"
);

function readJson<T>(filePath: string): T | null {
  try {
    const abs = path.resolve(DATA_ROOT, filePath);
    return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

function readDir(dir: string): string[] {
  try {
    return fs.readdirSync(path.resolve(DATA_ROOT, dir));
  } catch {
    return [];
  }
}

export function loadPublicCrossAudit() {
  return readJson("public-cross-audit.json");
}

export function loadLatestSession() {
  const files = readDir("sessions")
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (!files.length) return null;
  return readJson(`sessions/${files[files.length - 1]}`);
}

export function loadAllSessions() {
  return readDir("sessions")
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson(`sessions/${f}`))
    .filter(Boolean);
}

export function loadLatestContentSession() {
  const files = readDir("content-sessions")
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (!files.length) return null;
  return readJson(`content-sessions/${files[files.length - 1]}`);
}

export function loadLatestCompetitors() {
  const files = readDir("competitors")
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (!files.length) return null;
  return readJson(`competitors/${files[files.length - 1]}`);
}

export function loadBotEvidence() {
  return readJson("bot-evidence.json");
}
