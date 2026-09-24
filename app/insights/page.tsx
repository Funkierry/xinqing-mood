"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  LockKeyhole,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import {
  getAverageIntensity,
  getCalendarDays,
  getDailyMoodSummaries,
  getEmotionBreakdown,
  getEntriesSince,
  getTagBreakdown,
  startOfLocalDay,
  toLocalDateKey,
  type DailyMoodSummary,
} from "@/lib/insights";
import { EMOTIONS, TAGS } from "@/lib/mood-config";
import { getMoodEntries } from "@/lib/storage";
import type { Emotion, MoodEntry, Tag } from "@/lib/types";

const PERIOD_OPTIONS = [7, 30] as const;
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function getEmotionOption(emotion: Emotion | null) {
  return EMOTIONS.find((item) => item.id === emotion);
}

function getTagLabel(tag: Tag) {
  return TAGS.find((item) => item.id === tag)?.label ?? tag;
}

function formatMonth(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(value);
}

function formatEntryTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "时间未知"
    : new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
}

function getRangeDescription(entries: MoodEntry[], days: number) {
  if (entries.length === 0) return `近 ${days} 天还没有记录`;

  const recordedDays = new Set(
    entries.map((entry) => toLocalDateKey(new Date(entry.createdAt))),
  ).size;
  if (recordedDays === 1) return "你已经为自己停下来一次";
  if (recordedDays >= Math.ceil(days * 0.6)) return "持续记录，正在让变化变得清晰";
  return `这些感受来自 ${recordedDays} 个不同的日子`;
}

function TrendChart({
  summaries,
  days,
}: {
  summaries: DailyMoodSummary[];
  days: number;
}) {
  const hasData = summaries.some((day) => day.averageIntensity !== null);

  return (
    <div className="mt-5">
      <div className="relative h-[154px] border-b border-[#E8E1DA]">
        {[10, 5].map((value) => (
          <div
            key={value}
            className="absolute inset-x-0 border-t border-dashed border-[#E9E3DD]"
            style={{ bottom: `${value * 10}%` }}
          >
            <span className="absolute -top-2.5 right-0 bg-white/80 pl-1.5 text-[10px] text-[#AAA29B]">
              {value}
            </span>
          </div>
        ))}

        <div
          className={`absolute inset-0 grid items-end gap-1.5 pr-6 ${
            days === 7 ? "grid-cols-7" : "grid-cols-[repeat(30,minmax(5px,1fr))]"
          }`}
        >
          {summaries.map((day, index) => {
            const emotion = getEmotionOption(day.dominantEmotion);
            const value = day.averageIntensity;
            const showLabel =
              days === 7 || index === 0 || index === summaries.length - 1 || index % 5 === 4;

            return (
              <div
                key={day.dateKey}
                className="group relative flex h-full min-w-0 items-end justify-center"
                title={
                  value === null
                    ? `${day.date.getMonth() + 1}月${day.date.getDate()}日：没有记录`
                    : `${day.date.getMonth() + 1}月${day.date.getDate()}日：平均强度 ${value.toFixed(1)}`
                }
              >
                {value !== null ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${Math.max(value * 10, 8)}%`, opacity: 1 }}
                    transition={{ delay: index * 0.015, duration: 0.38 }}
                    className={`w-full rounded-t-full ${days === 7 ? "max-w-6" : "max-w-2.5"}`}
                    style={{ backgroundColor: emotion?.color ?? "#8FC7AE" }}
                  />
                ) : (
                  <span className="mb-0.5 h-1 w-1 rounded-full bg-[#DDD7D1]" />
                )}
                {showLabel && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#9A928B]">
                    {day.date.getMonth() + 1}/{day.date.getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between text-xs text-[#918A84]">
        <span>{hasData ? "柱高代表当天的平均情绪强度" : "完成打卡后，趋势会出现在这里"}</span>
        <span>满分 10</span>
      </div>
    </div>
  );
}

function EmptyInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/80 bg-white/80 p-7 text-center shadow-soft backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E6F1EB] text-[#5F8F78]">
        <Leaf className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-ink">第一条记录，会是洞察的起点</h2>
      <p className="mt-3 text-sm leading-6 text-[#756E68]">
        不需要每天都状态很好。诚实地记下此刻，过一段时间就能看见情绪的节奏与线索。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#5F8F78] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(95,143,120,0.24)]"
      >
        <Sparkles className="h-4 w-4" />
        记录现在的心情
      </Link>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#938B84]">
        <LockKeyhole className="h-3.5 w-3.5" />
        所有记录只保存在这台设备上
      </div>
    </motion.section>
  );
}

export default function InsightsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]>(7);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const localToday = startOfLocalDay(new Date());
    setEntries(getMoodEntries());
    setToday(localToday);
    setCurrentMonth(new Date(localToday.getFullYear(), localToday.getMonth(), 1));
    setSelectedDateKey(toLocalDateKey(localToday));
    setHasLoaded(true);
  }, []);

  const periodEntries = useMemo(
    () => (today ? getEntriesSince(entries, period, today) : []),
    [entries, period, today],
  );
  const dailySummaries = useMemo(
    () => (today ? getDailyMoodSummaries(entries, period, today) : []),
    [entries, period, today],
  );
  const emotionBreakdown = useMemo(
    () => getEmotionBreakdown(periodEntries),
    [periodEntries],
  );
  const tagBreakdown = useMemo(
    () => getTagBreakdown(periodEntries).slice(0, 4),
    [periodEntries],
  );
  const calendarDays = useMemo(
    () =>
      today && currentMonth
        ? getCalendarDays(entries, currentMonth, today)
        : [],
    [currentMonth, entries, today],
  );

  const recordedDays = useMemo(
    () =>
      new Set(
        periodEntries.map((entry) => toLocalDateKey(new Date(entry.createdAt))),
      ).size,
    [periodEntries],
  );
  const averageIntensity = getAverageIntensity(periodEntries);
  const dominantEmotion = getEmotionOption(emotionBreakdown[0]?.emotion ?? null);
  const relievedCount = periodEntries.filter(
    (entry) => entry.reliefFeedback === "better",
  ).length;
  const selectedDay = calendarDays.find(
    (day) => day.dateKey === selectedDateKey,
  );
  const canGoNextMonth =
    Boolean(today && currentMonth) &&
    (currentMonth!.getFullYear() < today!.getFullYear() ||
      (currentMonth!.getFullYear() === today!.getFullYear() &&
        currentMonth!.getMonth() < today!.getMonth()));

  function moveMonth(offset: number) {
    if (!currentMonth || (offset > 0 && !canGoNextMonth)) return;
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
    setSelectedDateKey(null);
  }

  if (!hasLoaded) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] items-center justify-center px-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="h-9 w-9 rounded-full border-2 border-[#DCEAE3] border-t-[#5F8F78]"
          aria-label="正在读取情绪记录"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pb-12 pt-6 sm:pt-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3.5 py-2 text-sm font-semibold text-[#69615B] shadow-sm transition hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回打卡
      </Link>

      <header className="pb-7 pt-7">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8 shrink-0" />
          <p className="text-sm font-medium tracking-[0.14em] text-[#718477]">
            心晴 · 情绪洞察
          </p>
        </div>
        <h1 className="mt-1 text-[29px] font-semibold leading-tight text-ink">
          看见感受，也看见变化
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#77706A]">
          这里没有好坏评判，只有属于你的情绪节奏。
        </p>
      </header>

      {entries.length === 0 ? (
        <EmptyInsights />
      ) : (
        <div className="space-y-5">
          <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#637D6F]">
                  <TrendingUp className="h-4 w-4" />
                  最近的节奏
                </div>
                <p className="mt-1 text-xs leading-5 text-[#918A84]">
                  {getRangeDescription(periodEntries, period)}
                </p>
              </div>
              <div className="flex rounded-xl bg-[#F0ECE7] p-1">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      period === option
                        ? "bg-white text-[#557865] shadow-sm"
                        : "text-[#8B837C]"
                    }`}
                    aria-pressed={period === option}
                  >
                    {option} 天
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#EFF5F1] px-3 py-3.5">
                <p className="text-[11px] text-[#7D8F85]">记录天数</p>
                <p className="mt-1 text-xl font-semibold text-[#486957]">
                  {recordedDays}<span className="ml-1 text-xs font-medium">天</span>
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F0E7] px-3 py-3.5">
                <p className="text-[11px] text-[#9B8978]">平均强度</p>
                <p className="mt-1 text-xl font-semibold text-[#806349]">
                  {averageIntensity?.toFixed(1) ?? "—"}<span className="ml-1 text-xs font-medium">/ 10</span>
                </p>
              </div>
              <div className="rounded-2xl bg-[#EEF1F6] px-3 py-3.5">
                <p className="text-[11px] text-[#7F8998]">调节后好转</p>
                <p className="mt-1 text-xl font-semibold text-[#5F7087]">
                  {relievedCount}<span className="ml-1 text-xs font-medium">次</span>
                </p>
              </div>
            </div>

            <TrendChart summaries={dailySummaries} days={period} />
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">心情构成</h2>
                <p className="mt-1 text-xs text-[#918A84]">按这段时间的记录次数统计</p>
              </div>
              {dominantEmotion && (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor: dominantEmotion.softColor,
                    color: dominantEmotion.color,
                  }}
                >
                  <span>{dominantEmotion.emoji}</span>
                  最常出现
                </div>
              )}
            </div>

            {emotionBreakdown.length > 0 ? (
              <div className="mt-5 space-y-3.5">
                {emotionBreakdown.map((item) => {
                  const option = getEmotionOption(item.emotion);
                  if (!option) return null;
                  return (
                    <div key={item.emotion}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-[#5E5752]">
                          <span aria-hidden="true">{option.emoji}</span>
                          {option.label}
                        </span>
                        <span className="text-xs text-[#8D857F]">
                          {item.count} 次 · {Math.round(item.percentage)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#EEE9E4]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.45 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-[#F5F2EE] p-4 text-sm leading-6 text-[#827A74]">
                这段时间还没有记录，可以切换到 30 天看看。
              </p>
            )}
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
            <h2 className="text-lg font-semibold text-ink">可能有关的事情</h2>
            <p className="mt-1 text-xs text-[#918A84]">常出现的标签，也许藏着一些线索</p>
            {tagBreakdown.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {tagBreakdown.map((item, index) => (
                  <motion.div
                    key={item.tag}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-[18px] border border-[#EAE3DD] bg-[#FCFAF7] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#625B55]">
                        {getTagLabel(item.tag)}
                      </span>
                      <span className="rounded-full bg-[#E8F1EC] px-2 py-0.5 text-[10px] font-semibold text-[#5E7D6C]">
                        {item.count} 次
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#948C85]">
                      平均强度 {item.averageIntensity.toFixed(1)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-[#F5F2EE] p-4 text-sm leading-6 text-[#827A74]">
                下次打卡时选择关联标签，会更容易发现影响情绪的事情。
              </p>
            )}
          </section>

          {today && currentMonth && (
            <section className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#668371]" />
                  <h2 className="text-lg font-semibold text-ink">情绪日历</h2>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveMonth(-1)}
                    className="rounded-full p-2 text-[#786F69] transition hover:bg-[#F1ECE7]"
                    aria-label="上一个月"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[88px] text-center text-sm font-semibold text-[#615A55]">
                    {formatMonth(currentMonth)}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveMonth(1)}
                    disabled={!canGoNextMonth}
                    className="rounded-full p-2 text-[#786F69] transition hover:bg-[#F1ECE7] disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label="下一个月"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((day) => (
                  <span key={day} className="pb-2 text-[11px] font-medium text-[#9A928B]">
                    {day}
                  </span>
                ))}
                {calendarDays.map((day) => {
                  const option = getEmotionOption(day.dominantEmotion);
                  const isSelected = selectedDateKey === day.dateKey;
                  const isToday = day.dateKey === toLocalDateKey(today);
                  return (
                    <button
                      key={day.dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(day.dateKey)}
                      disabled={day.isFuture}
                      aria-label={`${day.date.getMonth() + 1}月${day.date.getDate()}日，${
                        day.entries.length ? `${day.entries.length} 条记录` : "没有记录"
                      }`}
                      className={`relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl text-xs transition ${
                        isSelected
                          ? "ring-2 ring-[#7FA58F] ring-offset-1"
                          : "hover:bg-[#F3EFEB]"
                      } ${
                        day.isCurrentMonth && !day.isFuture
                          ? "text-[#5E5752]"
                          : "text-[#C1BAB4]"
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? option?.softColor ?? "#F0ECE7"
                          : undefined,
                      }}
                    >
                      <span className={isToday ? "font-bold text-[#4F7B65]" : ""}>
                        {day.date.getDate()}
                      </span>
                      {option && (
                        <span
                          className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <motion.div
                  key={selectedDay.dateKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 border-t border-[#EAE3DD] pt-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#625B55]">
                      {selectedDay.date.getMonth() + 1} 月 {selectedDay.date.getDate()} 日
                    </p>
                    <span className="text-xs text-[#948C85]">
                      {selectedDay.entries.length} 条记录
                    </span>
                  </div>
                  {selectedDay.entries.length > 0 ? (
                    <div className="mt-3 space-y-2.5">
                      {selectedDay.entries.map((entry) => {
                        const option = getEmotionOption(entry.emotion);
                        return (
                          <article
                            key={entry.id}
                            className="rounded-[18px] bg-[#F8F5F1] p-3.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-[#5E5752]">
                                <span className="text-xl" aria-hidden="true">{option?.emoji}</span>
                                <span>{option?.label}</span>
                                <span className="font-normal text-[#9A928B]">· 强度 {entry.intensity}</span>
                              </div>
                              <span className="flex items-center gap-1 text-[11px] text-[#9A928B]">
                                <Clock3 className="h-3 w-3" />
                                {formatEntryTime(entry.createdAt)}
                              </span>
                            </div>
                            {entry.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-white px-2 py-1 text-[10px] text-[#7D756F]"
                                  >
                                    {getTagLabel(tag)}
                                  </span>
                                ))}
                              </div>
                            )}
                            {entry.note && (
                              <p className="mt-2.5 whitespace-pre-wrap break-words text-xs leading-5 text-[#716963]">
                                {entry.note}
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-2xl bg-[#F7F4F0] px-4 py-3 text-xs leading-5 text-[#918A84]">
                      这一天没有记录。留白也是生活的一部分。
                    </p>
                  )}
                </motion.div>
              )}
            </section>
          )}

          <div className="flex items-start gap-2 px-2 text-xs leading-5 text-[#918A84]">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>洞察基于保存在这台设备上的记录生成，不会上传到云端。</p>
          </div>
        </div>
      )}
    </main>
  );
}
