"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { diary } from "@/data/content";
import TiltCard from "../TiltCard";

/**
 * 日记卡片：
 * - 左侧竖排日期导航（年月日压缩显示），点击切换右侧日记内容
 * - 切换时：旧内容上浮淡出 → 新内容下方淡入（anime 时间线）
 * - 整卡固定高度，内容区滚动 → 卡片尺寸稳定不跳动
 */
export default function DiaryCard() {
  const [idx, setIdx] = useState(0);                    // 当前选中的日记索引
  const contentRef = useRef<HTMLDivElement>(null);      // 右侧内容区（切换动画目标）

  // 切换日记：播放「先隐后现」时间线，动画完成回调里其实已由 React 更新了文本
  const select = (i: number) => {
    if (i === idx) return; // 点击同一条 → 不播动画
    const el = contentRef.current;
    if (el) {
      anime.remove(el);
      anime.timeline()
        // ① 旧内容：上浮 + 淡出（内容此刻仍是旧的）
        .add({ targets: el, opacity: 0, translateY: -16, duration: 180, easing: "easeInQuad" })
        // ② 位置归零（内容已由 setState 更新为新日记）
        .add({ targets: el, translateY: 16, duration: 0 })
        // ③ 新内容：从下方淡入
        .add({ targets: el, opacity: 1, translateY: 0, duration: 320, easing: "easeOutCubic" });
    }
    setIdx(i);
  };

  const d = diary[idx]; // 当前展示的日记

  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black tracking-widest text-dim">日记 · DIARY</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">点击左侧日期切换</p>
        </div>
        {/* 当前心情大 emoji：切换时 CSS 缩放弹一下 */}
        <span key={idx} className="anim-glow text-3xl">{d.mood}</span>
      </header>

      <div className="mt-5 flex flex-1 gap-4 overflow-hidden">
        {/* —— 左侧：日期导航（可纵向滚动） —— */}
        <nav className="flex w-20 flex-shrink-0 flex-col gap-1.5 overflow-y-auto pr-1">
          {diary.map((it, i) => (
            <button
              key={`${it.date}-${i}`}
              onClick={() => select(i)}
              // 选中态：渐变底 + 青色文字；未选中：透明底 + 灰字
              className={`cursor-pointer rounded-lg px-2 py-2 text-left transition-all duration-300 ${
                i === idx
                  ? "bg-linear-to-r from-neon/30 to-cyan/20 text-cyan"
                  : "text-dim hover:bg-white/5 hover:text-mist"
              }`}
            >
              {/* 日期压缩显示：06-08 两行（月日 / 年） */}
              <p className="font-mono text-[13px] font-bold leading-tight">
                {it.date.slice(5).replace("-", ".")}
              </p>
              <p className="font-mono text-[10px] opacity-60">{it.date.slice(0, 4)}</p>
            </button>
          ))}
        </nav>

        {/* —— 右侧：日记正文（切换动画的目标元素） —— */}
        <div ref={contentRef} className="min-w-0 flex-1">
          {/* 标题行：标题 + 日期 */}
          <h4 className="text-base font-black leading-snug text-mist">{d.title}</h4>
          <p className="mt-1 font-mono text-[11px] text-dim">{d.date}</p>
          {/* 正文：带竖线装饰，行高宽松易读 */}
          <p className="mt-3 border-l-2 border-neon/50 pl-3 text-[13px] leading-relaxed text-mist/85">
            {d.text}
          </p>
        </div>
      </div>

      {/* 底部计数 */}
      <p className="mt-4 text-center text-[11px] text-dim/60">
        📖 第 {idx + 1} / {diary.length} 篇
      </p>
    </TiltCard>
  );
}