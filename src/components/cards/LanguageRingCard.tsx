"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { languages, type LangItem } from "@/data/content";
import TiltCard from "../TiltCard";

/** 计算环形图每段弧的起止角度（从 -90° 即正上方开始顺时针） */
function segPath(startPct: number, endPct: number, r: number) {
  const cx = 100, cy = 100; // SVG 视图盒中心
  // 百分比 → 角度（deg），起点为正上方
  const a1 = (startPct / 100) * 360 - 90;
  const a2 = (endPct / 100) * 360 - 90;
  // 角度 → 坐标
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1));
  const x2 = cx + r * Math.cos(rad(a2)), y2 = cy + r * Math.sin(rad(a2));
  // 大弧标记：超过 180° 时为 1
  const large = endPct - startPct > 50 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

/**
 * 项目语言环形卡片：
 * - SVG 环形图展示各语言占比（颜色与 content.ts 一致）
 * - 整个环缓慢旋转；环外标签「双层反向旋转」→ 永远保持水平
 * - 悬停任一色段 / 标签：暂停旋转 + 色段加粗 + 中央显示语言信息
 * - 点击色段或标签文字：进入对应语言官网
 */
export default function LanguageRingCard() {
  const [active, setActive] = useState<LangItem | null>(null); // 当前悬停的语言
  const segRefs = useRef<(SVGPathElement | null)[]>([]);        // 各色段 ref（悬停加粗动画）

  // 悬停色段：记录激活语言 + anime 加粗描边 + 微微外扩
  const hoverSeg = (l: LangItem, i: number) => {
    setActive(l);
    const el = segRefs.current[i];
    if (el) {
      anime.remove(el);
      anime({
        targets: el,
        strokeWidth: [12, 20], // 描边变粗 → 视觉放大
        duration: 350,
        easing: "easeOutQuad",
      });
    }
  };
  // 离开色段：恢复默认描边宽度
  const leaveSeg = (i: number) => {
    setActive(null);
    const el = segRefs.current[i];
    if (el) {
      anime.remove(el);
      anime({ targets: el, strokeWidth: 12, duration: 300, easing: "easeOutQuad" });
    }
  };

  // 累计百分比（计算每段弧的起止）
  let acc = 0;
  const segs = languages.map((l) => {
    const s = acc;          // 本段起点（百分比）
    acc += l.pct;           // 累计到本段终点
    return { lang: l, start: s, end: acc };
  });

  return (
    <TiltCard className="card-glass card-line p-6 md:p-7">
      <header>
        <h3 className="text-sm font-black tracking-widest text-dim">项目语言 · STACK RING</h3>
        <p className="mt-1.5 text-[11px] text-dim/70">悬停查看 · 点击进入语言官网</p>
      </header>

      {/* 环形图区域：ring-zone 悬停时 CSS 暂停旋转（见 globals.css） */}
      <div className="ring-zone relative mx-auto mt-4 flex h-[240px] w-[240px] items-center justify-center md:h-[260px] md:w-[260px]">

        {/* ① SVG 环形图本体：整体正转（ring-rot 类 = 50s 一圈） */}
        <svg viewBox="0 0 200 200" className="ring-rot absolute inset-0 h-full w-full">
          {segs.map((s, i) => (
            <path
              key={s.lang.name}
              ref={(el) => { segRefs.current[i] = el; }}
              d={segPath(s.start, s.end, 80)} // 半径 80（视图盒 200）
              fill="none"
              stroke={s.lang.color}
              strokeWidth={12}                 // 默认描边 12，悬停加粗
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke] duration-200"
              onMouseEnter={() => hoverSeg(s.lang, i)}
              onMouseLeave={() => leaveSeg(i)}
              // 点击色段 → 打开语言官网
              onClick={() => window.open(s.lang.url, "_blank", "noopener,noreferrer")}
            />
          ))}
        </svg>

        {/* ② 环外标签层：与 SVG 同步正转；每个标签内部反转 → 文字永远水平 */}
        <div className="ring-rot pointer-events-none absolute inset-0">
          {segs.map((s) => {
            // 标签位置：本段中点角度对应的圆周坐标（半径略大于环 → 标签在环外）
            const mid = ((s.start + s.end) / 2 / 100) * 360 - 90;
            const rad = (mid * Math.PI) / 180;
            const R = 118; // 标签半径（超出 SVG 半径 80 → 环外）
            return (
              <div
                key={s.lang.name}
                // 定位到圆周位置；注意这里用 50% 基准 + 偏移，居中标签
                className="absolute"
                style={{
                  left: `${100 + R * Math.cos(rad) * 0.86}%`, // 0.86 按容器实际尺寸微调
                  top: `${100 + R * Math.sin(rad) * 0.86}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* 标签本体：反向旋转（ring-label-rot = 50s 反向一圈，与外层抵消） */}
                <button
                  className="ring-label-rot pointer-events-auto cursor-pointer whitespace-nowrap rounded-full border border-white/15 bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-mist transition-colors hover:border-cyan/60 hover:text-cyan"
                  // 点击标签文字 → 进入语言官网
                  onClick={() => window.open(s.lang.url, "_blank", "noopener,noreferrer")}
                  onMouseEnter={() => setActive(s.lang)}
                  onMouseLeave={() => setActive(null)}
                >
                  {s.lang.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* ③ 环心信息：默认显示总计，悬停显示对应语言的占比与备注 */}
        <div className="pointer-events-none z-10 max-w-[120px] text-center">
          {active ? (
            <>
              <p className="text-lg font-black" style={{ color: active.color }}>
                {active.pct}%
              </p>
              <p className="text-xs font-bold text-mist">{active.name}</p>
              <p className="mt-1 text-[10px] leading-snug text-dim">{active.note}</p>
            </>
          ) : (
            <>
              <p className="font-mono text-2xl font-black text-gradient">5</p>
              <p className="mt-0.5 text-[10px] tracking-[0.3em] text-dim">LANGUAGES</p>
              <p className="mt-1 text-[10px] text-dim/60">悬停查看详情</p>
            </>
          )}
        </div>
      </div>

      {/* 底部图例：颜色圆点 + 名称 + 占比（点击同样可进官网） */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {languages.map((l) => (
          <button
            key={l.name}
            onClick={() => window.open(l.url, "_blank", "noopener,noreferrer")}
            className="flex cursor-pointer items-center gap-1.5 text-[11px] text-dim transition-colors hover:text-mist"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.name} <span className="font-mono">{l.pct}%</span>
          </button>
        ))}
      </div>
    </TiltCard>
  );
}