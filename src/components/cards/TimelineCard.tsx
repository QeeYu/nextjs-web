/**
 * 时间线卡片
 * 展示从化工到全栈的成长路径
 */
"use client";

import { useRef, useEffect } from "react";
import { timeline } from "@/data/content";
import TiltCard from "../TiltCard";

export default function TimelineCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">成长时间线 · TIMELINE</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">从化工到代码的旅程</p>
        </div>
        <span className="text-2xl">🗺️</span>
      </header>

      <div ref={containerRef} className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto">
        {timeline.map((item, index) => (
          <div key={item.date} className="relative flex gap-4 pl-4">
            {/* 连接线 */}
            {index < timeline.length - 1 && (
              <div className="absolute left-[18px] top-[32px] h-[calc(100%+4px)] w-[2px] bg-white/10" />
            )}
            {/* 时间节点图标 */}
            <div className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-neon/30 bg-ink text-base">
              {item.icon}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs font-bold text-cyan">{item.date}</span>
                <h4 className="text-sm font-bold text-mist">{item.title}</h4>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-dim/70">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-dim/50">← 向左滑动查看完整历程</p>
    </TiltCard>
  );
}