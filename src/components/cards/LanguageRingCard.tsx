"use client";

import { useState } from "react";
import { languages } from "@/data/content";
import TiltCard from "../TiltCard";

/** 环形图几何 */
const R = 80;
const C = 2 * Math.PI * R;
const GAP = 1;

export default function LanguageRingCard() {
  const [active, setActive] = useState<number | null>(null);
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  // 每段弧长 + 起始偏移
  let acc = 0;
  const segs = languages.map((l) => {
    const len = (l.pct / 100) * C;
    const seg = { ...l, len, start: acc };
    acc += len;
    return seg;
  });

  return (
    <TiltCard className="card-glass card-line p-6 md:p-7">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">项目语言 · STACK RING</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">悬停查看 · 点击进入官网</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[10px] text-dim">
          {languages.length} 种
        </span>
      </header>

      {/* ★ ring-zone：悬停时暂停旋转（见 globals.css） */}
      <div className="ring-zone relative mx-auto mt-4 aspect-square w-[min(72vw,260px)]">
        {/* ★ SVG 整体旋转（ring-rot = 50s 一圈，悬停暂停） */}
        <svg viewBox="0 0 200 200" className="ring-rot absolute inset-0 h-full w-full">
          {/* 底环 */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
          {/* 各语言分段（从 12 点开始顺时针） */}
          <g transform="rotate(-90 100 100)">
            {segs.map((s, i) => {
              const segLen = Math.max(s.len - GAP, 1);
              return (
                <circle
                  key={s.name}
                  cx="100" cy="100" r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={active === i ? 20 : 16}
                  strokeDasharray={`${segLen} ${C - segLen}`}
                  strokeDashoffset={-s.start}
                  strokeLinecap="butt"
                  className="cursor-pointer transition-[stroke-width,opacity] duration-300"
                  style={{ opacity: active === null || active === i ? 1 : 0.3 }}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => open(s.url)}
                />
              );
            })}
          </g>
          {/* 外圈装饰虚线环（持续旋转） */}
          <circle cx="100" cy="100" r="100" fill="none" stroke="rgba(255,255,255,0.06)"
            strokeWidth="1" strokeDasharray="4 8" style={{ transformOrigin: "center", transformBox: "fill-box" }} />
        </svg>

        {/* 中心信息（不旋转） */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-[110px] text-center">
            {active !== null ? (
              <>
                <p className="text-base font-black" style={{ color: languages[active].color }}>
                  {languages[active].name}
                </p>
                <p className="text-xl font-black text-gradient">{languages[active].pct}%</p>
                <p className="mt-1 text-[10px] leading-snug text-dim">{languages[active].note}</p>
                <p className="mt-1.5 text-[10px] text-neon">点击进入官网 ↗</p>
              </>
            ) : (
              <>
                <p className="font-mono text-2xl font-black text-gradient">{languages.length}</p>
                <p className="text-[10px] tracking-[0.3em] text-dim">LANGUAGES</p>
                <p className="mt-1 text-[10px] text-dim/60">悬停查看详情</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 底部图例（可点击进入官网） */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {languages.map((l, i) => (
          <button
            key={l.name}
            onClick={() => open(l.url)}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-dim transition-colors hover:border-white/30 hover:text-mist"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.name}
            <span className="font-mono text-dim/70">{l.pct}%</span>
          </button>
        ))}
      </div>
    </TiltCard>
  );
}