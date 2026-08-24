"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import TiltCard from "../TiltCard";

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const pad = (n: number) => String(n).padStart(2, "0");

/** 单个时间字符：变化时翻牌，悬停弹跳 */
function TimeChar({ ch }: { ch: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    anime({ targets: ref.current, rotateX: [90, 0], duration: 450, easing: "easeOutBack" });
  }, []);
  const hover = () => {
    anime.remove(ref.current);
    anime({
      targets: ref.current,
      translateY: [{ value: -10, duration: 150, easing: "easeOutQuad" }, { value: 0, duration: 600, easing: "easeOutElastic(1.3, .45)" }],
      color: [{ value: "#38e1ff", duration: 150 }, { value: "#e8ecff", duration: 600 }],
    });
  };
  return (
    <span ref={ref} onMouseEnter={hover}
      className="anim-glow inline-block cursor-default font-mono text-[clamp(2rem,7vw,3.2rem)] font-black tabular-nums leading-none">
      {ch}
    </span>
  );
}

export default function TimeCard() {
  const [now, setNow] = useState<Date | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevStrRef = useRef("");

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";

  useEffect(() => {
    if (!now || !prevStrRef.current) { prevStrRef.current = timeStr; return; }
    timeStr.split("").forEach((c, i) => {
      if (c !== prevStrRef.current[i] && charRefs.current[i]) {
        anime.remove(charRefs.current[i]!);
        anime({ targets: charRefs.current[i], rotateX: [90, 0], duration: 450, easing: "easeOutBack" });
      }
    });
    prevStrRef.current = timeStr;
  }, [timeStr, now]);

  const wob = (e: React.MouseEvent<HTMLElement>) => {
    anime.remove(e.currentTarget);
    anime({ targets: e.currentTarget, rotate: [{ value: 2.5, duration: 90 }, { value: -2.5, duration: 110 }, { value: 0, duration: 160, easing: "easeOutQuad" }] });
  };

  // 派生信息
  const dateStr = now ? `${now.getFullYear()} 年 ${pad(now.getMonth() + 1)} 月 ${pad(now.getDate())} 日` : "— — —";
  const weekStr = now ? `星期${WEEK[now.getDay()]}` : "";
  const hour = now?.getHours() ?? 0;
  const greeting =
    hour < 5 ? "深夜好，夜猫子 🦉" :
    hour < 11 ? "早上好，新的一天 ☀️" :
    hour < 13 ? "中午好，记得吃饭 🍚" :
    hour < 18 ? "下午好，来杯茶 🍵" : "晚上好，放松一下 🌙";

  // ★ 今日已加载百分比（0~100）
  const dayPct = now ? ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100 : 0;
  // 年度百分比
  const yearPct = now
    ? Math.round(((Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0 ? 366 : 365)) * 100)
    : 0;

  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-black tracking-widest text-dim">当前时间 · LIVE</h3>
        <span className="flex items-center gap-1.5 text-[10px] text-pink">
          <span className="h-2 w-2 animate-pulse rounded-full bg-pink" />REALTIME
        </span>
      </header>

      {/* 大号时间（逐字翻牌 + 悬停弹跳） */}
      <div className="mt-5 text-center" style={{ perspective: 400 }}>
        <div className="font-mono text-4xl font-black tracking-tight md:text-5xl">
          {timeStr.split("").map((c, i) => (
            <span key={i} ref={(el) => { charRefs.current[i] = el; }} onMouseEnter={() => {
              const el = charRefs.current[i]; if (!el) return;
              anime.remove(el);
              anime({ targets: el, translateY: [{ value: -10, duration: 150, easing: "easeOutQuad" }, { value: 0, duration: 600, easing: "easeOutElastic(1.3, .45)" }], color: [{ value: "#38e1ff", duration: 150 }, { value: c === ":" ? "#7c5cff" : "#e8ecff", duration: 600 }] });
            }} className={`inline-block cursor-default select-none ${c === ":" ? "text-neon" : "text-mist"}`}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 日期 + 问候（悬停晃动） */}
      <p onMouseEnter={wob} className="mt-3 cursor-default text-center text-sm text-dim">{dateStr} · {weekStr}</p>
      <p onMouseEnter={wob} className="mt-1 cursor-default text-center text-sm text-cyan">{greeting}</p>

      {/* ★ 24 小时时间轴（当前时间位置标记） */}
      <div className="mt-4">
        <div className="relative h-2 rounded-full bg-white/8">
          {/* 已过部分填充 */}
          <div className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-cyan/60 to-cyan/30 transition-[width] duration-1000" style={{ width: `${dayPct}%` }} />
          {/* 当前时间标记点 */}
          <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_8px_rgba(56,225,255,0.8)] transition-all duration-1000" style={{ left: `${dayPct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[8px] text-dim/40">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>

      {/* ★ 今日 + 年度加载进度（推到卡片底部） */}
      <div className="mt-auto pt-4">
        {/* 今日 */}
        <div className="flex items-center justify-between text-[11px] text-dim">
          <span>今日已加载</span>
          <span className="font-mono text-cyan">{dayPct.toFixed(1)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-linear-to-r from-cyan to-pink transition-[width] duration-1000" style={{ width: `${dayPct}%` }} />
        </div>
        {/* 年度 */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-dim">
          <span>{now?.getFullYear() ?? ""} 年已加载</span>
          <span className="font-mono text-cyan">{yearPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-linear-to-r from-neon via-cyan to-pink transition-[width] duration-700" style={{ width: `${yearPct}%` }} />
        </div>
      </div>
    </TiltCard>
  );
}