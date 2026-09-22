export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <section className="w-full max-w-[480px] overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-7 text-center shadow-soft backdrop-blur sm:p-10">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[24px] bg-mint/65 text-4xl shadow-sm" aria-hidden="true">
          ☀️
        </div>

        <p className="mb-3 text-sm font-medium tracking-[0.2em] text-[#7D756E]">
          XINQING
        </p>
        <h1 className="text-2xl font-semibold leading-snug text-ink sm:text-3xl">
          心晴 · 情绪日记与自我关怀
        </h1>
        <p className="mt-4 text-base leading-7 text-[#655F5A]">
          30 秒，记录此刻的心情
        </p>

        <div className="mt-9 rounded-2xl bg-peach/45 px-5 py-4 text-sm font-medium text-[#755F53]">
          功能开发中，敬请期待
        </div>
      </section>
    </main>
  );
}
