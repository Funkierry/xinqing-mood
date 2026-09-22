export type Emotion =
  | "joy"
  | "calm"
  | "anxious"
  | "sad"
  | "angry"
  | "tired";

export type Tag =
  | "study"
  | "work"
  | "relationship"
  | "family"
  | "sleep"
  | "health"
  | "money"
  | "other";

export interface MoodEntry {
  id: string;
  emotion: Emotion;
  intensity: number;
  tags: Tag[];
  note?: string;
  createdAt: string;
  reliefUsed?: string;
  reliefFeedback?: "better" | "same" | "worse";
}
