import type { Emotion, MoodEntry, Tag } from "@/lib/types";

export interface DailyMoodSummary {
  date: Date;
  dateKey: string;
  entries: MoodEntry[];
  averageIntensity: number | null;
  dominantEmotion: Emotion | null;
}

export interface CalendarDay extends DailyMoodSummary {
  isCurrentMonth: boolean;
  isFuture: boolean;
}

export interface EmotionBreakdownItem {
  emotion: Emotion;
  count: number;
  percentage: number;
}

export interface TagBreakdownItem {
  tag: Tag;
  count: number;
  averageIntensity: number;
}

export function startOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addLocalDays(value: Date, days: number) {
  const date = startOfLocalDay(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function toLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function groupEntriesByDay(entries: MoodEntry[]) {
  const grouped = new Map<string, MoodEntry[]>();

  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = toLocalDateKey(date);
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  });

  return grouped;
}

function getDominantEmotion(entries: MoodEntry[]): Emotion | null {
  if (entries.length === 0) return null;

  const scores = new Map<Emotion, { count: number; intensity: number }>();
  entries.forEach((entry) => {
    const current = scores.get(entry.emotion) ?? { count: 0, intensity: 0 };
    scores.set(entry.emotion, {
      count: current.count + 1,
      intensity: current.intensity + entry.intensity,
    });
  });

  return Array.from(scores.entries()).sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return b[1].intensity - a[1].intensity;
  })[0][0];
}

function summarizeDay(date: Date, entries: MoodEntry[]): DailyMoodSummary {
  return {
    date,
    dateKey: toLocalDateKey(date),
    entries,
    averageIntensity:
      entries.length > 0
        ? entries.reduce((total, entry) => total + entry.intensity, 0) /
          entries.length
        : null,
    dominantEmotion: getDominantEmotion(entries),
  };
}

export function getDailyMoodSummaries(
  entries: MoodEntry[],
  days: number,
  anchor = new Date(),
) {
  const grouped = groupEntriesByDay(entries);
  const end = startOfLocalDay(anchor);

  return Array.from({ length: days }, (_, index) => {
    const date = addLocalDays(end, index - days + 1);
    return summarizeDay(date, grouped.get(toLocalDateKey(date)) ?? []);
  });
}

export function getCalendarDays(
  entries: MoodEntry[],
  month: Date,
  today = new Date(),
): CalendarDay[] {
  const grouped = groupEntriesByDay(entries);
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addLocalDays(firstOfMonth, -mondayOffset);
  const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const gridEndOffset = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7;
  const gridEnd = addLocalDays(lastOfMonth, gridEndOffset);
  const numberOfDays =
    Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;
  const localToday = startOfLocalDay(today);

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = addLocalDays(gridStart, index);
    const summary = summarizeDay(
      date,
      grouped.get(toLocalDateKey(date)) ?? [],
    );

    return {
      ...summary,
      isCurrentMonth:
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth(),
      isFuture: date.getTime() > localToday.getTime(),
    };
  });
}

export function getEntriesSince(
  entries: MoodEntry[],
  days: number,
  anchor = new Date(),
) {
  const start = addLocalDays(anchor, -(days - 1)).getTime();
  const end = addLocalDays(anchor, 1).getTime();
  return entries.filter((entry) => {
    const time = new Date(entry.createdAt).getTime();
    return time >= start && time < end;
  });
}

export function getEmotionBreakdown(entries: MoodEntry[]): EmotionBreakdownItem[] {
  const counts = new Map<Emotion, number>();
  entries.forEach((entry) => {
    counts.set(entry.emotion, (counts.get(entry.emotion) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: entries.length > 0 ? (count / entries.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTagBreakdown(entries: MoodEntry[]): TagBreakdownItem[] {
  const values = new Map<Tag, { count: number; totalIntensity: number }>();

  entries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      const current = values.get(tag) ?? { count: 0, totalIntensity: 0 };
      values.set(tag, {
        count: current.count + 1,
        totalIntensity: current.totalIntensity + entry.intensity,
      });
    });
  });

  return Array.from(values.entries())
    .map(([tag, value]) => ({
      tag,
      count: value.count,
      averageIntensity: value.totalIntensity / value.count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.averageIntensity - a.averageIntensity;
    });
}

export function getAverageIntensity(entries: MoodEntry[]) {
  if (entries.length === 0) return null;
  return (
    entries.reduce((total, entry) => total + entry.intensity, 0) / entries.length
  );
}
