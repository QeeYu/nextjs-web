/**
 * 经历卡片
 * - 时间线样式展示教育/工作/项目经历
 * - 进行中的经历带呼吸灯标识
 * - 悬停时卡片轻微上浮 + 边框高亮
 */
"use client";

import { experiences } from "@/data/content";
import TiltCard from "../TiltCard";

export default function ExperienceCard() {
  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-8" maxTilt={4}>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">
            经历 · EXPERIENCE
          </h3>
          <p className="mt-1.5 text-[11px] text-dim/70">
            教育 · 项目 · 学习轨迹
          </p>
        </div>
        <span className="text-2xl"></span>
      </header>

      <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {experiences.map((exp, index) => (
          <div key={`${exp.period}-${index}`} className="relative flex gap-4">
            {/* ★ 时间轴竖线：left-[4px] 让线中心与圆点中心对齐 */}
            {index < experiences.length - 1 && (
              <div
                className="absolute left-[4px] top-[22px] w-[2px] bg-linear-to-b from-cyan/40 via-white/10 to-transparent"
                style={{ height: "calc(100% - 10px)" }}
              />
            )}

            {/* ★ 节点圆点：z-20 提到最上层，避免被任何东西盖住 */}
            <div className="relative z-20 flex-shrink-0 pt-1.5">
              <span
                className={`block h-2.5 w-2.5 rounded-full ${
                  exp.current
                    ? "animate-pulse bg-cyan shadow-[0_0_12px_rgba(56,225,255,1)]"
                    : "bg-white/30 ring-4 ring-white/5"
                }`}
              />
            </div>

            {/* 内容 */}
            <div className="group min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/30 hover:bg-white/[0.05] md:p-4">
              {/* 时间 + 组织 */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-[11px] font-bold tracking-wide text-cyan">
                  {exp.period}
                </span>
                {exp.current && (
                  <span className="rounded-full border border-cyan/40 bg-cyan/10 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider text-cyan">
                    NOW
                  </span>
                )}
                <span className="text-[10.5px] tracking-wide text-dim/60">
                  · {exp.org}
                </span>
              </div>

              {/* 职位/身份 */}
              <h4 className="mt-1.5 text-[14px] font-black tracking-tight text-mist transition-colors group-hover:text-cyan md:text-[15px]">
                {exp.title}
              </h4>

              {/* 描述 */}
              <p className="mt-1.5 text-[12.5px] leading-[1.7] tracking-[0.005em] text-dim/85">
                {exp.desc}
              </p>

              {/* 标签 */}
              {exp.tags && exp.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] tracking-wide text-dim/80 transition-colors group-hover:bg-white/[0.1] group-hover:text-mist"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-dim/60">
        📌 持续更新中 · Updated 2026
      </p>
    </TiltCard>
  );
}