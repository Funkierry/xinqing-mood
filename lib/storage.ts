import { NEGATIVE_EMOTIONS } from "@/lib/mood-config";
import type { Emotion, MoodEntry, Tag } from "@/lib/types";

const LEGACY_STORAGE_KEY = "xinqing:mood-entries:v1";
const DEVICE_ID_KEY = "xinqing:device-id:v1";
const DEVICE_STORAGE_PREFIX = "xinqing:mood-entries:v2";
let inMemoryDeviceId: string | null = null;
const EMOTIONS: Emotion[] = [
  "joy",
  "calm",
  "anxious",
  "sad",
  "angry",
  "tired",
];
const TAGS: Tag[] = [
  "study",
  "work",
  "relationship",
  "family",
  "sleep",
  "health",
  "money",
  "other",
];

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function createDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `device-${crypto.randomUUID()}`;
  }

  return `device-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function isValidDeviceId(value: string | null) {
  return Boolean(value && /^device-[a-zA-Z0-9-]{12,80}$/.test(value));
}

export function getOrCreateDeviceId() {
  if (!canUseStorage()) return null;

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (isValidDeviceId(existing)) return existing;

    const deviceId = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
    inMemoryDeviceId = deviceId;
    return deviceId;
  } catch {
    if (!inMemoryDeviceId) inMemoryDeviceId = createDeviceId();
    return inMemoryDeviceId;
  }
}

function getDeviceStorageKey() {
  const deviceId = getOrCreateDeviceId();
  return deviceId
    ? `${DEVICE_STORAGE_PREFIX}:${deviceId}`
    : LEGACY_STORAGE_KEY;
}

function isMoodEntry(value: unknown): value is MoodEntry {
  if (!value || typeof value !== "object") return false;

  const entry = value as Partial<MoodEntry>;
  return (
    typeof entry.id === "string" &&
    EMOTIONS.includes(entry.emotion as Emotion) &&
    typeof entry.intensity === "number" &&
    entry.intensity >= 1 &&
    entry.intensity <= 10 &&
    Array.isArray(entry.tags) &&
    entry.tags.every((tag) => TAGS.includes(tag)) &&
    typeof entry.createdAt === "string"
  );
}

function persist(entries: MoodEntry[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(getDeviceStorageKey(), JSON.stringify(entries));
  } catch {
    // Storage may be unavailable in private browsing or after reaching quota.
  }
}

export function getMoodEntries(): MoodEntry[] {
  if (!canUseStorage()) return [];

  try {
    const storageKey = getDeviceStorageKey();
    let raw = window.localStorage.getItem(storageKey);

    if (!raw && storageKey !== LEGACY_STORAGE_KEY) {
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) window.localStorage.setItem(storageKey, raw);
    }

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isMoodEntry)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  } catch {
    return [];
  }
}

export function saveMoodEntry(entry: MoodEntry) {
  const entries = getMoodEntries().filter((item) => item.id !== entry.id);
  persist([entry, ...entries]);
  return entry;
}

export function getMoodEntryById(id: string) {
  return getMoodEntries().find((entry) => entry.id === id);
}

export function updateMoodEntry(
  id: string,
  updates: Partial<Pick<MoodEntry, "reliefUsed" | "reliefFeedback">>,
) {
  let updated: MoodEntry | undefined;
  const entries = getMoodEntries().map((entry) => {
    if (entry.id !== id) return entry;
    updated = { ...entry, ...updates };
    return updated;
  });

  persist(entries);
  return updated;
}

function toLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCheckInStreak(entries = getMoodEntries()) {
  if (entries.length === 0) return 0;

  const recordedDays = new Set(
    entries.map((entry) => toLocalDateKey(new Date(entry.createdAt))),
  );
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let cursor = today;
  if (!recordedDays.has(toLocalDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (recordedDays.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function getCheckInDayCount(entries = getMoodEntries()) {
  return new Set(
    entries
      .map((entry) => new Date(entry.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(toLocalDateKey),
  ).size;
}

export function hasSustainedHighNegativeMood(entries = getMoodEntries()) {
  const qualifyingDays = new Set(
    entries
      .filter(
        (entry) =>
          NEGATIVE_EMOTIONS.includes(entry.emotion) && entry.intensity >= 8,
      )
      .map((entry) => toLocalDateKey(new Date(entry.createdAt))),
  );

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const latestStart = qualifyingDays.has(toLocalDateKey(today))
    ? today
    : addDays(today, -1);

  for (let offset = 0; offset < 5; offset += 1) {
    if (!qualifyingDays.has(toLocalDateKey(addDays(latestStart, -offset)))) {
      return false;
    }
  }

  return true;
}
