"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORY_LABELS, type ReliefPlan } from "@/lib/relief-config";

interface ReliefPlayerProps {
  plan: ReliefPlan;
  onClose: () => void;
  onComplete: () => void;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ReliefPlayer({ plan, onClose, onComplete }: ReliefPlayerProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-cream"
    >
      <main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pb-10 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-[#655E58] shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          返回推荐
        </button>

        <header className="pb-6 pt-8 text-center">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${plan.accent}22`, color: plan.accent }}
          >
            {CATEGORY_LABELS[plan.category]} · {plan.duration}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-ink">{plan.title}</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756D67]">
            {plan.description}
          </p>
        </header>

        <section className="rounded-[28px] border border-white/85 bg-white/80 p-6 shadow-soft backdrop-blur">
          {plan.interaction === "breathing" && (
            <BreathingPractice plan={plan} onComplete={onComplete} />
          )}
          {(plan.interaction === "meditation" ||
            plan.interaction === "exercise" ||
            plan.interaction === "rest") && (
            <TimedPractice plan={plan} onComplete={onComplete} />
          )}
          {plan.interaction === "audio" && (
            <AudioPractice plan={plan} onComplete={onComplete} />
          )}
          {plan.interaction === "writing" && (
            <WritingPractice onComplete={onComplete} />
          )}
          {plan.interaction === "reflection" && (
            <ReflectionPractice plan={plan} onComplete={onComplete} />
          )}
          {plan.interaction === "share" && (
            <SharePractice onComplete={onComplete} />
          )}
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-[#918981]">
          任何时候觉得不舒服，都可以暂停或退出。
        </p>
      </main>
    </motion.div>
  );
}

function BreathingPractice({
  plan,
  onComplete,
}: {
  plan: ReliefPlan;
  onComplete: () => void;
}) {
  const phases = useMemo(() => plan.phases ?? [], [plan.phases]);
  const rounds = plan.rounds ?? 4;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0]?.duration ?? 4);
  const [round, setRound] = useState(1);
  const [running, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const completionSent = useRef(false);
  const phase = phases[phaseIndex];

  useEffect(() => {
    if (!running || phases.length === 0) return;

    const interval = window.setInterval(() => {
      setPhaseRemaining((current) => {
        if (current > 1) return current - 1;

        const nextIndex = (phaseIndex + 1) % phases.length;
        if (nextIndex === 0 && round >= rounds) {
          setRunning(false);
          if (!completionSent.current) {
            completionSent.current = true;
            window.setTimeout(onComplete, 0);
          }
          return phases[phaseIndex].duration;
        }

        if (nextIndex === 0) setRound((currentRound) => currentRound + 1);
        setPhaseIndex(nextIndex);
        return phases[nextIndex].duration;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onComplete, phaseIndex, phases, round, rounds, running]);

  function toggleRunning() {
    setHasStarted(true);
    setRunning((current) => !current);
  }

  function reset() {
    completionSent.current = false;
    setRunning(false);
    setHasStarted(false);
    setPhaseIndex(0);
    setPhaseRemaining(phases[0]?.duration ?? 4);
    setRound(1);
  }

  if (!phase) return null;

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-[#7D756E]">
        第 {round} / {rounds} 轮
      </p>
      <div className="my-9 flex h-64 items-center justify-center">
        <motion.div
          animate={{ scale: running ? phase.scale : 0.84 }}
          transition={{
            duration: running ? phaseRemaining : 0.3,
            ease: "easeInOut",
          }}
          className="flex h-44 w-44 items-center justify-center rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${plan.accent}B8, ${plan.accent}55)`,
            boxShadow: `0 20px 55px ${plan.accent}55`,
          }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white/75 shadow-inner">
            <span className="text-lg font-semibold text-ink">
              {running ? phase.label : hasStarted ? "已暂停" : "准备好了吗"}
            </span>
            <span className="mt-1 text-3xl font-bold" style={{ color: plan.accent }}>
              {phaseRemaining}
            </span>
          </div>
        </motion.div>
      </div>

      <p className="mb-5 text-sm leading-6 text-[#7B736D]">
        {running
          ? `${phase.label} ${phase.duration} 秒，跟随圆圈的节奏。`
          : "坐稳或躺好，让肩膀自然下沉。"}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={toggleRunning}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-4 py-3.5 text-sm font-semibold text-white"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "暂停" : hasStarted ? "继续" : "开始呼吸"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border border-[#E7DED7] bg-[#FCFAF7] px-4 text-[#746C66]"
          aria-label="重新开始"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      {hasStarted && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 text-sm font-semibold text-[#5A7F6C] underline decoration-[#A8C5B6] underline-offset-4"
        >
          结束练习，记录感受
        </button>
      )}
    </div>
  );
}

function TimedPractice({
  plan,
  onComplete,
}: {
  plan: ReliefPlan;
  onComplete: () => void;
}) {
  const totalSeconds = plan.timerSeconds ?? 300;
  const instructions = plan.instructions ?? ["跟随自己的节奏，慢慢来。"];
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const completionSent = useRef(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (remaining !== 0 || completionSent.current) return;
    completionSent.current = true;
    setRunning(false);
    onComplete();
  }, [onComplete, remaining]);

  const progress = 1 - remaining / totalSeconds;
  const instructionIndex = Math.min(
    instructions.length - 1,
    Math.floor(progress * instructions.length),
  );

  function toggleRunning() {
    setHasStarted(true);
    setRunning((current) => !current);
  }

  function reset() {
    completionSent.current = false;
    setRemaining(totalSeconds);
    setRunning(false);
    setHasStarted(false);
  }

  return (
    <div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#877F78]">
          {running ? "正在进行" : hasStarted ? "已暂停" : "准备开始"}
        </p>
        <p className="mt-2 text-5xl font-semibold tabular-nums text-ink">
          {formatTime(remaining)}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E9E2DC]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: plan.accent }}
            animate={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <motion.div
        key={instructionIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 rounded-[20px] p-5 text-center text-base font-medium leading-7 text-[#5F5852]"
        style={{ backgroundColor: `${plan.accent}18` }}
      >
        {instructions[instructionIndex]}
      </motion.div>

      {plan.interaction === "exercise" && (
        <ol className="mb-6 space-y-3">
          {instructions.map((instruction, index) => (
            <li key={instruction} className="flex gap-3 text-sm leading-6 text-[#756D67]">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: plan.accent }}
              >
                {index + 1}
              </span>
              {instruction}
            </li>
          ))}
        </ol>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={toggleRunning}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-4 py-3.5 text-sm font-semibold text-white"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "暂停" : hasStarted ? "继续" : "开始计时"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border border-[#E7DED7] bg-[#FCFAF7] px-4 text-[#746C66]"
          aria-label="重置计时"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      {hasStarted && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 w-full text-sm font-semibold text-[#5A7F6C] underline decoration-[#A8C5B6] underline-offset-4"
        >
          完成这次练习
        </button>
      )}
    </div>
  );
}

function AudioPractice({
  plan,
  onComplete,
}: {
  plan: ReliefPlan;
  onComplete: () => void;
}) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.16);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      try {
        sourceRef.current?.stop();
      } catch {
        // The source may already be stopped.
      }
      void audioContextRef.current?.close();
    };
  }, []);

  async function toggleWhiteNoise() {
    if (isPlaying) {
      try {
        sourceRef.current?.stop();
      } catch {
        // The source may already be stopped.
      }
      sourceRef.current = null;
      await audioContextRef.current?.close();
      audioContextRef.current = null;
      setIsPlaying(false);
      return;
    }

    const context = new AudioContext();
    const sampleCount = context.sampleRate * 2;
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(context.destination);
    source.start();

    audioContextRef.current = context;
    sourceRef.current = source;
    gainRef.current = gain;
    setIsPlaying(true);
  }

  return (
    <div className="text-center">
      <div
        className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle, ${plan.accent}44, ${plan.accent}12 65%, transparent 66%)`,
        }}
      >
        <motion.div
          animate={isPlaying ? { scale: [0.9, 1.12, 0.9] } : { scale: 0.9 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundColor: plan.accent }}
        >
          {isPlaying ? <Volume2 className="h-9 w-9" /> : <VolumeX className="h-9 w-9" />}
        </motion.div>
      </div>

      {plan.generatedAudio ? (
        <>
          <button
            type="button"
            onClick={toggleWhiteNoise}
            className="mt-6 inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-5 py-3.5 text-sm font-semibold text-white"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "暂停白噪音" : "播放白噪音"}
          </button>
          <label className="mx-auto mt-6 block max-w-xs text-left text-xs font-medium text-[#817971]">
            音量
            <input
              type="range"
              min="0.03"
              max="0.35"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="mt-2 w-full accent-[#5F8F78]"
            />
          </label>
        </>
      ) : (
        <a
          href={plan.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-5 py-3.5 text-sm font-semibold text-white"
        >
          打开公开歌单
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      <p className="mt-6 text-sm leading-6 text-[#7A726C]">
        戴耳机时请保持舒适音量，也可以只是安静地听一会儿。
      </p>
      <button
        type="button"
        onClick={onComplete}
        className="mt-5 w-full rounded-2xl border border-[#D9E6DF] bg-[#EEF5F1] px-4 py-3.5 text-sm font-semibold text-[#527663]"
      >
        我听好了，记录感受
      </button>
    </div>
  );
}

function WritingPractice({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("");
  const [shredding, setShredding] = useState(false);

  function finishShredding() {
    if (!shredding) return;
    setText("");
    setShredding(false);
    onComplete();
  }

  return (
    <div>
      <p className="text-center text-sm leading-6 text-[#766E68]">
        这里写下的内容不会保存。把不满、委屈或愤怒都留在这里。
      </p>
      <motion.div
        animate={
          shredding
            ? { opacity: 0, scaleY: 0.08, rotate: -2, y: 80 }
            : { opacity: 1, scaleY: 1, rotate: 0, y: 0 }
        }
        transition={{ duration: 0.75, ease: "easeIn" }}
        onAnimationComplete={finishShredding}
        className="origin-bottom"
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={9}
          placeholder="尽管写吧，不需要组织语言……"
          className="mt-5 w-full resize-none rounded-[20px] border border-[#E8DDD6] bg-[#FCF8F5] p-4 text-sm leading-6 text-ink outline-none focus:border-[#D69A86] focus:ring-4 focus:ring-[#F6E5DF]"
        />
      </motion.div>
      <button
        type="button"
        disabled={!text.trim() || shredding}
        onClick={() => setShredding(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C97767] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#C8C1BA]"
      >
        <Trash2 className="h-4 w-4" />
        写完了，粉碎它
      </button>
    </div>
  );
}

function ReflectionPractice({
  plan,
  onComplete,
}: {
  plan: ReliefPlan;
  onComplete: () => void;
}) {
  const prompts = plan.prompts ?? ["写下此刻的想法"];
  const [answers, setAnswers] = useState(() => prompts.map(() => ""));
  const isComplete = answers.every((answer) => answer.trim());

  return (
    <div>
      <p className="text-center text-sm leading-6 text-[#766E68]">
        不用写得完美，真实的一句话就足够。
      </p>
      <div className="mt-5 space-y-3">
        {prompts.map((prompt, index) => (
          <label key={prompt} className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#817970]">
              {prompt}
            </span>
            <textarea
              value={answers[index]}
              onChange={(event) =>
                setAnswers((current) =>
                  current.map((answer, answerIndex) =>
                    answerIndex === index ? event.target.value : answer,
                  ),
                )
              }
              rows={prompts.length === 1 ? 5 : 2}
              className="w-full resize-none rounded-2xl border border-[#E5DDD7] bg-[#FCFAF7] px-4 py-3 text-sm leading-6 text-ink outline-none focus:border-[#9DBFAC] focus:ring-4 focus:ring-[#E3F0E9]"
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!isComplete}
        onClick={onComplete}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#C8C1BA]"
      >
        <Check className="h-4 w-4" />
        保存这份感受
      </button>
    </div>
  );
}

function SharePractice({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState(
    "我刚刚在「心晴」记录了此刻的心情，也想把这份对自己的关照分享给你。",
  );
  const [status, setStatus] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const browserNavigator = navigator as unknown as {
      share?: (data: ShareData) => Promise<void>;
    };
    setCanNativeShare(Boolean(browserNavigator.share));
  }, []);

  async function share() {
    try {
      const browserNavigator = navigator as unknown as {
        share?: (data: ShareData) => Promise<void>;
        clipboard?: { writeText: (value: string) => Promise<void> };
      };

      if (browserNavigator.share) {
        await browserNavigator.share({ title: "心晴", text });
        setStatus("已分享");
      } else if (browserNavigator.clipboard) {
        await browserNavigator.clipboard.writeText(text);
        setStatus("文字已复制，可以发给朋友了");
      } else {
        setStatus("请长按上方文字复制后分享");
        return;
      }
      window.setTimeout(onComplete, 500);
    } catch {
      setStatus("没有完成分享，没关系，可以稍后再试");
    }
  }

  return (
    <div className="text-center">
      <Share2 className="mx-auto h-12 w-12 text-[#C28762]" />
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        className="mt-5 w-full resize-none rounded-[20px] border border-[#E6DDD6] bg-[#FCFAF7] p-4 text-sm leading-6 text-ink outline-none focus:border-[#BFA58F]"
      />
      <button
        type="button"
        onClick={share}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5F8F78] px-4 py-3.5 text-sm font-semibold text-white"
      >
        {canNativeShare ? (
          <Share2 className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        分享这段话
      </button>
      {status && <p className="mt-3 text-sm text-[#746C66]">{status}</p>}
    </div>
  );
}
