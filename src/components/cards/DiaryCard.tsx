/**
 * 日记卡片
 * - 左侧日期导航，点击切换日记
 * - 切换时旧内容上浮淡出 → 新内容从下方淡入（anime 时间线）
 */
"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { diary } from "@/data/content";
import TiltCard from "../TiltCard";

export default function DiaryCard() {
  const [idx, setIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const select = (i: number) => {
    if (i === idx) return;
    const el = contentRef.current;
    if (el) {
      anime.remove(el);
      anime
        .timeline()
        .add({
          targets: el,
          opacity: 0,
          translateY: -16,
          duration: 180,
          easing: "easeInQuad",
        })
        .add({ targets: el, translateY: 16, duration: 0 })
        .add({
          targets: el,
          opacity: 1,
          translateY: 0,
          duration: 320,
          easing: "easeOutCubic",
        });
    }
    setIdx(i);
  };

  const d = diary[idx];

  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">日记 · DIARY</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">点击左侧日期切换</p>
        </div>
        <span key={idx} className="anim-glow text-3xl">
          {d.mood}
        </span>
      </header>

      <div className="mt-5 flex flex-1 gap-4 overflow-hidden">
        <nav className="flex w-20 flex-shrink-0 flex-col gap-1.5 overflow-y-auto pr-1">
          {diary.map((it, i) => (
            <button
              key={`${it.date}-${i}`}
              onClick={() => select(i)}
              className={`cursor-pointer rounded-lg px-2 py-2 text-left transition-all duration-300 ${
                i === idx
                  ? "bg-linear-to-r from-neon/30 to-cyan/20 text-cyan"
                  : "text-dim hover:bg-white/5 hover:text-mist"
              }`}
            >
              <p className="font-mono text-[13px] font-bold leading-tight">
                {it.date.slice(5).replace("-", ".")}
              </p>
              <p className="font-mono text-[10px] opacity-60">{it.date.slice(0, 4)}</p>
            </button>
          ))}
        </nav>

        <div ref={contentRef} className="min-w-0 flex-1">
          <h4 className="text-base font-black leading-snug text-mist">{d.title}</h4>
          <p className="mt-1 font-mono text-[11px] text-dim">{d.date}</p>
          <p className="mt-3 border-l-2 border-neon/50 pl-3 text-[13px] leading-relaxed text-mist/85">
            {d.text}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-dim/60">
        📖 第 {idx + 1} / {diary.length} 篇
      </p>
    </TiltCard>
  );
}