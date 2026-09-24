"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { PlanCard } from "@/components/relief/plan-card";
import { ReliefPlayer } from "@/components/relief/relief-player";
import { EMOTIONS, TAGS } from "@/lib/mood-config";
import {
  getRecommendedReliefPlans,
  type ReliefPlan,
} from "@/lib/relief-config";
import { getMoodEntryById, updateMoodEntry } from "@/lib/storage";
import type { MoodEntry } from "@/lib/types";

type ReliefFeedback = NonNullable<MoodEntry["reliefFeedback"]>;

const FEEDBACK_OPTIONS: Array<{
  id: ReliefFeedback;
  emoji: string;
  label: string;
}> = [
  { id: "better", emoji: "😊", label: "好多了" },
  { id: "same", emoji: "😐", label: "差不多" },
  { id: "worse", emoji: "😞", label: "更糟了" },
];

export default function ReliefPage() {
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activePlan, setActivePlan] = useState<ReliefPlan | null>(null);
  const [completedPlan, setCompletedPlan] = useState<ReliefPlan | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    const entryId = new URLSearchParams(window.location.search).get("entryId");
    setEntry(entryId ? getMoodEntryById(entryId) ?? null : null);
    setHasLoaded(true);
  }, []);

  const emotion = useMemo(
    () => EMOTIONS.find((item) => item.id === entry?.emotion),
    [entry?.emotion],
  );
  const plans = useMemo(
    () => (entry ? getRecommendedReliefPlans(entry) : []),
    [entry],
  );

  function finishPlan(plan: ReliefPlan) {
    setActivePlan(null);
    setCompletedPlan(plan);
    setFeedbackSaved(false);
  }

  function saveFeedback(feedback: ReliefFeedback) {
    if (!entry || !completedPlan) return;
    const updated = updateMoodEntry(entry.id, {
      reliefUsed: completedPlan.id,
      reliefFeedback: feedback,
    });
    if (updated) setEntry(updated);
    setFeedbackSaved(true);
  }

  function tryAnother() {
    setCompletedPlan(null);
    setFeedbackSaved(false);
  }

  if (!hasLoaded) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] items-center justify-center px-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="h-9 w-9 rounded-full border-2 border-[#DCEAE3] border-t-[#5F8F78]"
          aria-label="正在读取心情记录"
        />
      </main>
    );
  }

  if (!entry || !emotion) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] items-center px-5 py-10">
        <section className="w-full rounded-[28px] border border-white/80 bg-white/80 p-7 text-center shadow-soft">
          <div className="text-5xl" aria-hidden="true">
            🌤️
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-ink">没有找到这条心情记录</h1>
          <p className="mt-3 text-sm leading-6 text-[#766E68]">
            记录可能只存在于原来的浏览器或设备中，再打卡一次就可以获得推荐。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#5F8F78] px-5 py-3.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回打卡
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pb-12 pt-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-sm font-semibold text-[#69615B] shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          返回打卡
        </Link>
        <Link href="/" aria-label="心晴首页" className="rounded-xl shadow-sm">
          <BrandMark className="h-9 w-9" />
        </Link>
      </div>

      <header className="pb-7 pt-8">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ rotate: -8, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] text-4xl shadow-sm"
            style={{ backgroundColor: emotion.softColor }}
          >
            {emotion.emoji}
          </motion.div>
          <div>
            <p className="text-sm font-medium text-[#857C75]">记录好了，辛苦了</p>
            <h1 className="mt-1 text-[27px] font-semibold leading-tight text-ink">
              现在，为自己做一件小事
            </h1>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[20px] border border-white/80 bg-white/65 p-3.5 text-sm shadow-sm">
          <span className="font-semibold" style={{ color: emotion.color }}>
            {emotion.label} · 强度 {entry.intensity}
          </span>
          {entry.tags.map((tagId) => {
            const tag = TAGS.find((item) => item.id === tagId);
            return tag ? (
              <span
                key={tag.id}
                className="rounded-full bg-[#F1ECE7] px-2.5 py-1 text-xs text-[#756C65]"
              >
                {tag.label}
              </span>
            ) : null;
          })}
        </div>
      </header>

      {entry.reliefFeedback && (
        <div className="mb-5 flex items-center gap-3 rounded-[20px] bg-[#EDF5F0] p-4 text-sm leading-6 text-[#557261]">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          这条记录已经完成过一次调节，你也可以再选一个试试。
        </div>
      )}

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8B8179]">为你匹配</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">三个此刻就能做的选择</h2>
        </div>
        <Sparkles className="mb-1 h-5 w-5 shrink-0 text-[#D1A653]" />
      </div>

      <div className="space-y-3.5">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            onStart={setActivePlan}
          />
        ))}
      </div>

      <Link
        href="/insights"
        className="mt-7 flex w-full items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold text-[#746C66] transition hover:bg-white/60"
      >
        跳过，直接去看看我的情绪
        <ChevronRight className="h-4 w-4" />
      </Link>

      <AnimatePresence>
        {activePlan && (
          <ReliefPlayer
            key={activePlan.id}
            plan={activePlan}
            onClose={() => setActivePlan(null)}
            onComplete={() => finishPlan(activePlan)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#3F3A36]/35 p-4 backdrop-blur-sm sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-[440px] rounded-[28px] bg-[#FFFDF9] p-6 text-center shadow-2xl"
            >
              {!feedbackSaved ? (
                <>
                  <p className="text-sm font-medium text-[#8B8179]">
                    {completedPlan.title}完成了
                  </p>
                  <h2 id="feedback-title" className="mt-2 text-2xl font-semibold text-ink">
                    现在感觉好点了吗？
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7A726C]">
                    没有标准答案，选择最接近此刻的感受。
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-2.5">
                    {FEEDBACK_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveFeedback(option.id)}
                        className="rounded-[20px] border border-[#EAE2DC] bg-[#FCFAF7] px-2 py-4 transition hover:border-[#A8C5B6] hover:bg-[#EEF5F1]"
                      >
                        <span className="block text-3xl" aria-hidden="true">
                          {option.emoji}
                        </span>
                        <span className="mt-2 block text-sm font-semibold text-[#655E58]">
                          {option.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 17 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#DDEDE5] text-[#4F806A]"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h2 id="feedback-title" className="mt-5 text-2xl font-semibold text-ink">
                    谢谢你的反馈
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7A726C]">
                    这会帮助你慢慢找到真正适合自己的调节方式。
                  </p>
                  <Link
                    href="/insights"
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#5F8F78] px-4 py-3.5 text-sm font-semibold text-white"
                  >
                    查看我的情绪
                  </Link>
                  <button
                    type="button"
                    onClick={tryAnother}
                    className="mt-3 w-full px-4 py-2 text-sm font-semibold text-[#63796D]"
                  >
                    再试一个方案
                  </button>
                </>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
