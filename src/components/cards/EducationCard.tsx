/**
 * 教育背景卡片
 * - 展示学校、专业、时间
 * - 分组列出核心课程
 * - 纯 CSS + emoji，零依赖
 */
"use client";

import TiltCard from "../TiltCard";

const GROUPS = [
  {
    label: "化学基础",
    color: "#38e1ff",
    items: ["无机化学", "分析化学", "有机化学", "物理化学", "仪器分析"],
  },
  {
    label: "化工核心",
    color: "#b4ff39",
    items: ["化工原理", "化工热力学", "化学反应工程", "化工分离过程", "化工传递过程"],
  },
  {
    label: "工程实践",
    color: "#ff5c8a",
    items: ["工程制图", "化工原理课程设计", "机械设备基础课程设计", "化工仪表及自动化"],
  },
];

export default function EducationCard() {
  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7" maxTilt={4}>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">
            教育背景 · EDUCATION
          </h3>
          <p className="mt-1.5 text-[11px] text-dim/70">
            本科在读 · 化工方向
          </p>
        </div>
        <span className="text-2xl">🎓</span>
      </header>

      {/* 学校信息 */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/25 to-neon/15 text-2xl ring-1 ring-white/10">
          🎓
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-black leading-tight text-mist">
            西北大学
          </h4>
          <p className="mt-0.5 text-[12.5px] font-bold text-cyan">
            能源化学工程 · 本科在读
          </p>
          <p className="mt-1 font-mono text-[10.5px] tracking-wide text-dim/70">
            2023.09 - 2027.06 · 西安
          </p>
        </div>
      </div>

      {/* 课程分组 */}
      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {GROUPS.map((g) => (
          <div key={g.label} className="group">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="h-3 w-[3px] rounded-full"
                style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }}
              />
              <span className="text-[11px] font-black tracking-[0.15em] text-mist/80">
                {g.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pl-[11px]">
              {g.items.map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] leading-tight text-dim/90 transition-colors group-hover:bg-white/[0.08]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部成就条 */}
      <div className="mt-4 flex items-center justify-center gap-4 border-t border-white/5 pt-3 text-[10.5px] text-dim">
        <span className="flex items-center gap-1">
          <span className="text-lime">📚</span>
          <span className="font-mono">38+</span> 门课程
        </span>
        <span className="h-3 w-px bg-white/10" />
        <span className="flex items-center gap-1">
          <span className="text-cyan">⚗️</span>
          <span className="font-mono">30+</span> 项实验
        </span>
        <span className="h-3 w-px bg-white/10" />
        <span className="flex items-center gap-1">
          <span className="text-pink">🛠️</span>
          <span className="font-mono">2</span> 次课设
        </span>
      </div>
    </TiltCard>
  );
}