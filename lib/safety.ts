const CRISIS_KEYWORDS = [
  "不想活",
  "自杀",
  "结束生命",
  "伤害自己",
  "不想存在",
  "活不下去",
];

export function containsCrisisKeyword(note: string) {
  const normalized = note.replace(/\s+/g, "").toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
