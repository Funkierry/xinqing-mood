"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Flame, HeartHandshake, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { EMOTIONS, TAGS } from "@/lib/mood-config";
import { containsCrisisKeyword } from "@/lib/safety";
import {
  getCheckInStreak,
  getMoodEntries,
  hasSustainedHighNegativeMood,
  saveMoodEntry,
} from "@/lib/storage";
import type { Emotion, MoodEntry, Tag } from "@/lib/types";

function createEntryId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mood-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "早上好，今天感觉怎么样？";
  if (hour >= 12 && hour < 18) return "下午好，此刻心情如何？";
  return "晚上好，今天过得怎么样？";
}

export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("你好，此刻心情如何？");
  const [streak, setStreak] = useState(0);
  const [showCarePrompt, setShowCarePrompt] = useState(false);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [tags, setTags] = useState<Tag[]>([]);
  const [note, setNote] = useState("");
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
    const entries = getMoodEntries();
    setStreak(getCheckInStreak(entries));
    setShowCarePrompt(hasSustainedHighNegativeMood(entries));
  }, []);

  const selectedEmotion = useMemo(
    () => EMOTIONS.find((item) => item.id === emotion),
    [emotion],
  );

  function toggleTag(tag: Tag) {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function resetForm() {
    setEmotion(null);
    setIntensity(5);
    setTags([]);
    setNote("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emotion || isSubmitting) return;

    setIsSubmitting(true);
    const entry: MoodEntry = {
      id: createEntryId(),
      emotion,
      intensity,
      tags,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    saveMoodEntry(entry);

    if (containsCrisisKeyword(note)) {
      setShowCrisisModal(true);
      setStreak(getCheckInStreak());
      setShowCarePrompt(hasSustainedHighNegativeMood());
      setIsSubmitting(false);
      return;
    }

    router.push(`/relief?entryId=${encodeURIComponent(entry.id)}`);
  }

  function closeCrisisModal() {
    setShowCrisisModal(false);
    resetForm();
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pb-12 pt-7 sm:pt-10">
      <header className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium tracking-[0.18em] text-[#8B8179]">
              心晴 XINQING
            </p>
            <h1 className="text-[27px] font-semibold leading-[1.35] text-ink">
              {greeting}
            </h1>
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-2">
            <Link
              href="/insights"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#607D90] shadow-sm ring-1 ring-[#E2E4E3] transition hover:bg-white"
              aria-label="查看情绪洞察"
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-[#9A6D46] shadow-sm ring-1 ring-[#E9DED4]">
              <Flame className="h-4 w-4 fill-[#F2B36F] text-[#E89C51]" />
              {streak} 天
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#77706A]">
          不需要想太多，跟着直觉选择就好。
        </p>
      </header>

      <AnimatePresence initial={false}>
        {showCarePrompt && (
          <motion.aside
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 rounded-[20px] border border-[#E8D8C9] bg-[#FFF8EF] p-4 text-sm leading-6 text-[#765E4B] shadow-sm"
          >
            <div className="flex gap-3">
              <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[#C38261]" />
              <p>
                最近几天似乎都不太容易。除了在这里记录，也可以考虑和信任的人或专业心理咨询师聊聊，你值得被认真支持。
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E4F1EA] text-sm font-bold text-[#5B806E]">
              1
            </span>
            <h2 className="text-lg font-semibold text-ink">现在是什么心情？</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EMOTIONS.map((item) => {
              const isSelected = item.id === emotion;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  animate={{ scale: isSelected ? 1.025 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  onClick={() => setEmotion(item.id)}
                  aria-pressed={isSelected}
                  className="relative flex min-h-[92px] items-center gap-3 overflow-hidden rounded-[20px] border p-4 text-left transition-shadow"
                  style={{
                    backgroundColor: item.softColor,
                    borderColor: isSelected ? item.color : "transparent",
                    boxShadow: isSelected
                      ? `0 8px 24px ${item.color}38`
                      : "0 1px 2px rgba(60, 50, 45, 0.03)",
                  }}
                >
                  <span className="text-[32px] leading-none" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="font-semibold text-[#504943]">{item.label}</span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEE8F6] text-sm font-bold text-[#76648F]">
              2
            </span>
            <h2 className="text-lg font-semibold text-ink">这种感觉有多强烈？</h2>
          </div>

          <div className="mb-4 flex items-end justify-between">
            <span className="text-sm text-[#827A74]">轻轻的</span>
            <motion.div
              key={`${selectedEmotion?.emoji ?? "🌤️"}-${intensity}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 0.88 + intensity * 0.035 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl" aria-hidden="true">
                {selectedEmotion?.emoji ?? "🌤️"}
              </span>
              <span className="min-w-8 text-right text-2xl font-bold text-ink">
                {intensity}
              </span>
            </motion.div>
            <span className="text-sm text-[#827A74]">很强烈</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
            className="mood-range w-full"
            style={{
              "--range-color": selectedEmotion?.color ?? "#8FC7AE",
              "--range-progress": `${((intensity - 1) / 9) * 100}%`,
            } as React.CSSProperties}
            aria-label="情绪强度"
          />
          <div className="mt-2 flex justify-between px-1 text-xs text-[#AAA29B]">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF1DA] text-sm font-bold text-[#9B7440]">
              3
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">可能和什么有关？</h2>
              <p className="mt-0.5 text-xs text-[#918A84]">可以多选，也可以跳过</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TAGS.map((tag) => {
              const isSelected = tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#8BB9A4] bg-[#DDEDE5] text-[#466B5A] shadow-sm"
                      : "border-[#E8E0D9] bg-[#FCFAF7] text-[#736C66]"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F7E8E2] text-sm font-bold text-[#A36D59]">
              4
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">留下一句话</h2>
              <p className="mt-0.5 text-xs text-[#918A84]">可选，只有你能看到</p>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              placeholder="想说点什么吗？可以跳过"
              className="w-full resize-none rounded-[18px] border border-[#E8E0D9] bg-[#FCFAF7] px-4 py-3.5 text-[15px] leading-6 text-ink outline-none transition placeholder:text-[#B2AAA3] focus:border-[#9BC2B0] focus:ring-4 focus:ring-[#DDEDE5]/60"
            />
            <span className="absolute bottom-3 right-3 text-xs text-[#AAA29B]">
              {note.length}/200
            </span>
          </div>
        </section>

        <motion.button
          type="submit"
          whileTap={emotion ? { scale: 0.98 } : undefined}
          disabled={!emotion || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#5F8F78] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(95,143,120,0.28)] transition hover:bg-[#527E69] disabled:cursor-not-allowed disabled:bg-[#C8C1BA] disabled:shadow-none"
        >
          <Sparkles className="h-5 w-5" />
          {emotion ? "记录下来" : "先选择一种心情"}
        </motion.button>
        <p className="text-center text-xs leading-5 text-[#918A84]">
          所有记录只保存在你的设备上
        </p>
      </form>

      <AnimatePresence>
        {showCrisisModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#3F3A36]/35 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto rounded-[28px] bg-[#FFFDF9] p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeCrisisModal}
                className="absolute right-4 top-4 rounded-full p-2 text-[#867E77] transition hover:bg-[#F2EDE7]"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7E3DC]">
                <HeartHandshake className="h-6 w-6 text-[#B76F58]" />
              </div>
              <h2 id="care-title" className="pr-8 text-xl font-semibold text-ink">
                你不是一个人，现在就可以找人聊聊
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6F6862]">
                谢谢你愿意写下这些感受。此刻最重要的是你的安全，请尽快联系信任的人陪在身边，或联系专业援助。
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#F8F1EA] p-4">
                  <p className="text-sm font-semibold text-[#5D554F]">中国</p>
                  <a
                    className="mt-2 block text-sm font-medium text-[#9A6049] underline decoration-[#D7AA98] underline-offset-4"
                    href="tel:4001619995"
                  >
                    全国心理援助热线：400-161-9995
                  </a>
                  <a
                    className="mt-2 block text-sm font-medium text-[#9A6049] underline decoration-[#D7AA98] underline-offset-4"
                    href="tel:01082951332"
                  >
                    北京心理危机研究与干预中心：010-82951332
                  </a>
                </div>
                <div className="rounded-2xl bg-[#EEF4F1] p-4">
                  <p className="text-sm font-semibold text-[#5D554F]">澳大利亚</p>
                  <a
                    className="mt-2 block text-sm font-medium text-[#527963] underline decoration-[#9FC1AF] underline-offset-4"
                    href="tel:131114"
                  >
                    Lifeline：13 11 14
                  </a>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#8B837C]">
                如果你正处于紧急危险中，请立即联系当地急救服务，或前往最近的急诊部门。
              </p>
              <button
                type="button"
                onClick={closeCrisisModal}
                className="mt-5 w-full rounded-2xl bg-[#5F8F78] px-5 py-3.5 text-sm font-semibold text-white"
              >
                我知道了，先照顾好自己
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
