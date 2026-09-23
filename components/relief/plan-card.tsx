"use client";

import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Headphones, Wind } from "lucide-react";

import {
  CATEGORY_LABELS,
  type ReliefCategory,
  type ReliefPlan,
} from "@/lib/relief-config";

const CATEGORY_STYLES: Record<
  ReliefCategory,
  { background: string; color: string }
> = {
  meditation: { background: "#EEE8F6", color: "#74618D" },
  music: { background: "#E5EEF4", color: "#58778E" },
  exercise: { background: "#E5F1EA", color: "#537A66" },
};

function CategoryIcon({ category }: { category: ReliefCategory }) {
  if (category === "music") return <Headphones className="h-5 w-5" />;
  if (category === "exercise") return <Activity className="h-5 w-5" />;
  return <Wind className="h-5 w-5" />;
}

interface PlanCardProps {
  plan: ReliefPlan;
  index: number;
  onStart: (plan: ReliefPlan) => void;
}

export function PlanCard({ plan, index, onStart }: PlanCardProps) {
  const categoryStyle = CATEGORY_STYLES[plan.category];

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onStart(plan)}
      className="group w-full rounded-[24px] border border-white/85 bg-white/80 p-5 text-left shadow-soft backdrop-blur transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: categoryStyle.background, color: categoryStyle.color }}
        >
          <CategoryIcon category={plan.category} />
        </div>
        <ArrowUpRight className="h-5 w-5 text-[#AAA19A] transition group-hover:text-[#5F8F78]" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
        <span
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: `${plan.accent}22`, color: plan.accent }}
        >
          {CATEGORY_LABELS[plan.category]}
        </span>
        <span className="text-[#968D86]">{plan.duration}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-ink">{plan.title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-[#746C66]">{plan.description}</p>
      <span className="mt-4 inline-flex text-sm font-semibold text-[#537A66]">
        现在开始
      </span>
    </motion.button>
  );
}
