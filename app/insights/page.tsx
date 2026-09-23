import { ArrowLeft, BarChart3, Sprout } from "lucide-react";
import Link from "next/link";

export default function InsightsPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] items-center px-5 py-10">
      <section className="w-full rounded-[28px] border border-white/80 bg-white/80 p-7 text-center shadow-soft backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E5EEF4] text-[#5F7D91]">
          <BarChart3 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-medium tracking-[0.15em] text-[#8B8179]">
          情绪洞察
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">记录正在慢慢长成规律</h1>
        <p className="mt-4 text-sm leading-6 text-[#746D67]">
          日历、趋势和触发因素分析将在阶段 3 上线。你现在的每一次打卡，都会成为之后洞察的一部分。
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#EEF5F1] px-4 py-3 text-sm text-[#587765]">
          <Sprout className="h-4 w-4" />
          多记录几次，会更容易看见变化
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-[#557865] transition hover:bg-[#EEF5F1]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回打卡页
        </Link>
      </section>
    </main>
  );
}
