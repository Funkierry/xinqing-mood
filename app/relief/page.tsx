import { ArrowLeft, Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ReliefPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] items-center px-5 py-10">
      <section className="w-full rounded-[28px] border border-white/80 bg-white/80 p-7 text-center shadow-soft backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#DDEDE5] text-[#4F806A]">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="mt-6 text-sm font-medium tracking-[0.18em] text-[#8B8179]">
          已经记录好了
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">谢谢你照看此刻的自己</h1>
        <p className="mt-4 text-sm leading-6 text-[#746D67]">
          这条心情已安全保存在你的设备上。个性化调节建议将在下一阶段上线。
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#FFF1DA] px-4 py-3 text-sm text-[#8A6A3E]">
          <Sparkles className="h-4 w-4" />
          推荐调节功能开发中
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
