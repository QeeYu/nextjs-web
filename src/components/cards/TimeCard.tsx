"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import TiltCard from "../TiltCard";

// 星期中文映射表
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
// 数字补齐两位（7 → "07"）
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 当前时间卡片（实时）：
 * - 每秒刷新；发生变化的数字播放 3D 翻牌动画
 * - 悬停任意数字/日期/问候 → anime.js 弹跳、晃动等灵动反馈
 * - 附带“年度进度条”小彩蛋
 */
export default function TimeCard() {
  // 初始为 null：SSR 阶段渲染占位符，避免服务端/客户端时间不一致导致水合报错
  const [now, setNow] = useState<Date | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]); // 时间每个字符的 ref
  const prevStrRef = useRef(""); // 上一秒的时间字符串（用于对比哪些位变化了）

  // 每秒刷新时间
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 时间字符串："HH:MM:SS"（无时间时显示占位）
  const timeStr = now
    ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    : "--:--:--";

  // 时间变化 → 对“发生变化的字符”播放翻牌动画（rotateX 从 90° 翻回 0°）
  useEffect(() => {
    if (!now || !prevStrRef.current) { prevStrRef.current = timeStr; return; }
    timeStr.split("").forEach((c, i) => {
      if (c !== prevStrRef.current[i] && charRefs.current[i]) {
        anime.remove(charRefs.current[i]!);
        anime({
          targets: charRefs.current[i],
          rotateX: [90, 0],
          duration: 450,
          easing: "easeOutBack", // 带一点过冲 → 更“弹”
        });
      }
    });
    prevStrRef.current = timeStr;
  }, [timeStr, now]);

  // 悬停单个数字：上浮 + 弹回 + 变色（灵动效果）
  const popChar = (i: number) => {
    const el = charRefs.current[i];
    if (!el) return;
    anime.remove(el);
    anime({
      targets: el,
      // 属性关键帧：先快速上浮，再弹性回位
      translateY: [
        { value: -10, duration: 150, easing: "easeOutQuad" },
        { value: 0, duration: 600, easing: "easeOutElastic(1.3, .45)" },
      ],
      // 颜色关键帧：闪一下青色再复原
      color: [
        { value: "#38e1ff", duration: 150 },
        { value: "#e8ecff", duration: 600 },
      ],
    });
  };

  // 悬停日期/问候语：左右轻轻晃动
  const wiggle = (e: React.MouseEvent<HTMLElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      rotate: [
        { value: 2.5, duration: 90 },
        { value: -2.5, duration: 110 },
        { value: 0, duration: 160, easing: "easeOutQuad" },
      ],
    });
  };

  // —— 派生信息：日期 / 问候 / 年度进度 ——
  const dateStr = now
    ? `${now.getFullYear()} 年 ${pad(now.getMonth() + 1)} 月 ${pad(now.getDate())} 日`
    : "— — —";
  const weekStr = now ? `星期${WEEK[now.getDay()]}` : "";
  const hour = now?.getHours() ?? 0;
  const greeting =
    hour < 5  ? "深夜好，夜猫子 🦉" :
    hour < 11 ? "早上好，新的一天 ☀️" :
    hour < 13 ? "中午好，记得吃饭 🍚" :
    hour < 18 ? "下午好，来杯茶 🍵" :
                "晚上好，放松一下 🌙";
  // 年度进度百分比（区分闰年）
  const yearPct = now
    ? Math.round(
        ((Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) /
          (((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365)) * 100
      )
    : 0;

  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-black tracking-widest text-dim">当前时间 · LIVE</h3>
        {/* 实时呼吸小红点 */}
        <span className="flex items-center gap-1.5 text-[10px] text-pink">
          <span className="h-2 w-2 animate-pulse rounded-full bg-pink" />
          REALTIME
        </span>
      </header>

      {/* 大号时间：逐字符渲染 → 支持逐字翻牌/悬停动画
          外层加 perspective，让 rotateX 有 3D 透视感 */}
      <div className="mt-6 text-center" style={{ perspective: 400 }}>
        <div className="font-mono text-4xl font-black tracking-tight md:text-5xl">
          {timeStr.split("").map((c, i) => (
            <span
              key={i}
              ref={(el) => { charRefs.current[i] = el; }} // 收集每个字符的 DOM
              onMouseEnter={() => popChar(i)}              // 悬停弹跳
              className={`inline-block cursor-default select-none ${c === ":" ? "text-neon" : "text-mist"}`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 日期与问候（悬停晃动的小彩蛋） */}
      <p onMouseEnter={wiggle} className="mt-3 cursor-default text-center text-sm text-dim">
        {dateStr} · {weekStr}
      </p>
      <p onMouseEnter={wiggle} className="mt-1 cursor-default text-center text-sm text-cyan">
        {greeting}
      </p>

      {/* 年度进度条（mt-auto 推到卡片底部） */}
      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between text-[11px] text-dim">
          <span>{now?.getFullYear() ?? ""} 年已加载</span>
          <span className="font-mono text-cyan">{yearPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          {/* 宽度随百分比变化 + CSS 过渡 → 平滑生长 */}
          <div
            className="h-full rounded-full bg-linear-to-r from-neon via-cyan to-pink transition-[width] duration-700"
            style={{ width: `${yearPct}%` }}
          />
        </div>
      </div>
    </TiltCard>
  );
}