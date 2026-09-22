import { NEGATIVE_EMOTIONS } from "@/lib/mood-config";
import type { Emotion, MoodEntry, Tag } from "@/lib/types";

const STORAGE_KEY = "xinqing:mood-entries:v1";
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getMoodEntries(): MoodEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
