import type { Emotion, Tag } from "@/lib/types";

export interface EmotionOption {
  id: Emotion;
  label: string;
  emoji: string;
  color: string;
  softColor: string;
}

export const EMOTIONS: EmotionOption[] = [
  {
    id: "joy",
    label: "开心",
    emoji: "😊",
    color: "#F2C862",
    softColor: "#FFF4D5",
  },
  {
    id: "calm",
    label: "平静",
    emoji: "😌",
    color: "#8FC7AE",
    softColor: "#E3F3EB",
  },
  {
    id: "anxious",
    label: "焦虑",
    emoji: "😟",
    color: "#B9A8D5",
    softColor: "#EFE9F7",
  },
  {
    id: "sad",
    label: "低落",
    emoji: "😔",
    color: "#94AFC6",
    softColor: "#E6EEF4",
  },
  {
    id: "angry",
    label: "生气",
    emoji: "😠",
    color: "#E68B7B",
    softColor: "#FBE7E2",
  },
  {
    id: "tired",
    label: "疲惫",
    emoji: "😮‍💨",
    color: "#A99E94",
    softColor: "#EEEAE6",
  },
];

export const TAGS: Array<{ id: Tag; label: string }> = [
  { id: "study", label: "学业" },
  { id: "work", label: "工作" },
  { id: "relationship", label: "人际" },
  { id: "family", label: "家庭" },
  { id: "sleep", label: "睡眠" },
  { id: "health", label: "健康" },
  { id: "money", label: "金钱" },
  { id: "other", label: "其他" },
];

export const NEGATIVE_EMOTIONS: Emotion[] = [
  "anxious",
  "sad",
  "angry",
  "tired",
];
