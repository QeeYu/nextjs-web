/**
 * 趣味小插件合集（4 个独立卡片）
 * - PianoCard: 迷你音琴（含完整版入口）
 * - DiceRoller: 掷骰子（单颗可点）
 * - ColorPalette: 配色卡
 * - ReactionTimer: 反应测试
 */
"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import { hitokoto } from "@/data/content";
import TiltCard from "../TiltCard";
import Link from "next/link";

// ---- 工具：HSL → Hex ----
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};


// ---- 2. 迷你音琴 ----
const FREQS = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];
const KEY_LABELS = ["哆", "瑞", "咪", "发", "嗦", "拉", "西", "哆"];

export function PianoCard() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = (freq: number, el?: HTMLElement) => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.05);
    if (el) {
      anime.remove(el);
      anime({
        targets: el,
        translateY: [
          { value: 4, duration: 70 },
          { value: 0, duration: 350, easing: "easeOutElastic(1.4, .4)" },
        ],
      });
    }
  };

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[220px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">迷你音琴 · PIANO</h3>
        <span className="text-base">🎹</span>
      </header>
      <div className="mt-4 flex flex-1 items-stretch gap-1.5">
        {FREQS.map((f, i) => (
          <button
            key={i}
            onClick={(e) => play(f, e.currentTarget)}
            className="flex flex-1 cursor-pointer flex-col items-center justify-end rounded-b-lg border border-white/20 bg-linear-to-b from-white/85 to-white/55 pb-2 transition-colors hover:from-cyan/60 hover:to-cyan/30 active:from-neon/70 active:to-neon/40"
          >
            <span className="text-[9px] font-bold text-ink/60">{KEY_LABELS[i]}</span>
            <span className="text-[8px] text-ink/40">{i + 1}</span>
          </button>
        ))}
      </div>
      <Link
        href="/piano"
        className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-neon/50 bg-neon/10 px-4 py-2 text-xs font-bold text-neon transition-all hover:bg-neon/20 active:scale-95"
      >
        🎹 进入完整音琴 —— 9 种乐器 · 琴谱闯关 · 滑动弹奏
        <span aria-hidden>→</span>
      </Link>
      <p className="mt-2 text-center text-[10px] text-dim/50">🎵 上方试音 · 完整版更多功能</p>
    </TiltCard>
  );
}

// ---- 4. 掷骰子 ----
const DOT_POS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 1],
    [0, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
};

export function DiceRoller() {
  const [values, setValues] = useState<[number, number]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const valuesRef = useRef<[number, number]>([1, 1]);
  const diceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const total = values[0] + values[1];

  const update = (next: [number, number]) => {
    valuesRef.current = next;
    setValues(next);
  };

  const animateDie = (el: HTMLElement | null, onDone?: () => void) => {
    if (!el) {
      onDone?.();
      return;
    }
    anime.remove(el);
    anime({
      targets: el,
      rotate: 720,
      scale: [
        { value: 1.3, duration: 200 },
        { value: 0.9, duration: 200 },
        { value: 1, duration: 600, easing: "easeOutElastic(1.2, .4)" },
      ],
      duration: 1000,
      easing: "easeOutQuad",
      complete: onDone,
    });
  };

  const landingEffect = (el: HTMLElement | null) => {
    if (el) {
      anime({
        targets: el,
        scale: [
          { value: 1.35, duration: 80 },
          { value: 1, duration: 450, easing: "easeOutElastic(1.2, .4)" },
        ],
        duration: 530,
      });
    }
    anime({
      targets: ".dice-total",
      scale: [
        { value: 1.5, duration: 150 },
        { value: 1, duration: 400, easing: "easeOutBack" },
      ],
      color: ["#ff5c8a", "#b4ff39", "#ff5c8a"],
      duration: 550,
    });
  };

  const rollAll = () => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const shuffle = setInterval(() => {
      update([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      if (++count > 8) clearInterval(shuffle);
    }, 80);
    animateDie(diceRefs.current[0]!);
    animateDie(diceRefs.current[1]!, () => {
      const v1 = Math.ceil(Math.random() * 6),
        v2 = Math.ceil(Math.random() * 6);
      update([v1, v2]);
      setHistory((h) => [v1 + v2, ...h].slice(0, 4));
      setRolling(false);
      landingEffect(diceRefs.current[0]!);
      landingEffect(diceRefs.current[1]!);
    });
  };

  const rollOne = (index: number) => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const shuffle = setInterval(() => {
      const next = [...valuesRef.current] as [number, number];
      next[index] = Math.ceil(Math.random() * 6);
      update(next);
      if (++count > 8) clearInterval(shuffle);
    }, 80);
    animateDie(diceRefs.current[index]!, () => {
      const newVal = Math.ceil(Math.random() * 6);
      const next = [...valuesRef.current] as [number, number];
      next[index] = newVal;
      update(next);
      setHistory((h) => [next[0] + next[1], ...h].slice(0, 4));
      setRolling(false);
      landingEffect(diceRefs.current[index]!);
    });
  };

  const Dice = ({ value, index }: { value: number; index: number }) => (
    <div className={rolling ? "" : "anim-float"} style={{ animationDelay: `${index * 0.35}s` }}>
      <div
        ref={(el) => {
          diceRefs.current[index] = el;
        }}
        onClick={() => rollOne(index)}
        className="dice-face group relative h-12 w-12 cursor-pointer rounded-lg border-2 border-white/20 bg-white/10 transition-colors hover:border-cyan/50 active:scale-90"
      >
        {DOT_POS[value].map(([r, c], i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white"
            style={{
              top: `${r * 33.33 + 16.67}%`,
              left: `${c * 33.33 + 16.67}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[220px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">掷骰子 · DICE</h3>
        <span className="dice-total font-mono text-sm font-black text-pink">总和 {total}</span>
      </header>
      <p className="mt-1 text-[10px] text-dim/50">点击单个骰子重投 · 或点下方按钮全部投掷</p>
      <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex gap-3">
          <Dice value={values[0]} index={0} />
          <Dice value={values[1]} index={1} />
        </div>
        {history.length > 0 && (
          <div className="flex gap-1.5">
            {history.map((h, i) => (
              <span key={i} className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-dim">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={rollAll}
        disabled={rolling}
        className="mt-3 cursor-pointer self-center rounded-full border border-neon/40 px-5 py-1.5 text-xs text-neon transition-all hover:bg-neon/15 active:scale-95 disabled:opacity-40"
      >
        {rolling ? "投掷中…" : "投掷 🎲"}
      </button>
    </TiltCard>
  );
}

// ---- 5. 配色卡 ----
export function ColorPalette() {
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const baseHue = Math.random() * 360;
    const newColors = Array.from({ length: 5 }, (_, i) => {
      const h = (baseHue + i * 137.5) % 360;
      const s = 65 + Math.random() * 25;
      const l = 45 + Math.random() * 20;
      return hslToHex(h, s, l);
    });
    setColors(newColors);
    requestAnimationFrame(() => {
      anime({
        targets: ".palette-bar",
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(80),
        duration: 500,
        easing: "easeOutBack",
      });
    });
  }, [gen]);

  const copy = async (hex: string, i: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(i);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  const regen = () => {
    anime({
      targets: ".palette-bar",
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 200,
      easing: "easeInQuad",
      complete: () => setGen((g) => g + 1),
    });
  };

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[220px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">配色卡 · PALETTE</h3>
        <span className="font-mono text-[10px] text-dim">点击复制</span>
      </header>
      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onClick={() => colors[i] && copy(colors[i], i)}
            className="palette-bar group flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg opacity-0"
            style={{ background: colors[i] || "rgba(255,255,255,0.05)", height: "32px" }}
          >
            <span
              className="ml-2 font-mono text-[10px] font-bold text-white/90"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {copied === i ? "已复制!" : (colors[i] || "").toUpperCase()}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={regen}
        className="mt-3 cursor-pointer self-center rounded-full border border-cyan/40 px-4 py-1.5 text-xs text-cyan transition-all hover:bg-cyan/15 active:scale-95"
      >
        重新生成
      </button>
    </TiltCard>
  );
}

// ---- 6. 反应测试 ----
export function ReactionTimer() {
  const [state, setState] = useState<"idle" | "waiting" | "ready" | "result">("idle");
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handle = () => {
    if (state === "idle" || state === "result") {
      setState("waiting");
      timerRef.current = setTimeout(() => {
        setState("ready");
        startRef.current = performance.now();
      }, 1000 + Math.random() * 3000);
    } else if (state === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState("idle");
    } else if (state === "ready") {
      const elapsed = Math.round(performance.now() - startRef.current);
      setTime(elapsed);
      setState("result");
      if (best === null || elapsed < best) setBest(elapsed);
    }
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [best]
  );

  const bg =
    state === "ready" ? "bg-lime/20" : state === "waiting" ? "bg-pink/15" : "bg-white/5";
  const main =
    state === "idle"
      ? "点击开始"
      : state === "waiting"
      ? "等待绿灯…"
      : state === "ready"
      ? "点击!"
      : `${time}ms`;
  const sub =
    state === "idle"
      ? "测测你的反应速度"
      : state === "waiting"
      ? "别急，等变绿再点"
      : state === "ready"
      ? "快快快!"
      : best !== null
      ? `最佳: ${best}ms`
      : "首次记录";

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[220px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">反应测试 · REACTION</h3>
        <span className="text-base">⚡</span>
      </header>
      <button
        onClick={handle}
        className={`mt-4 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-white/10 ${bg} transition-colors`}
      >
        <span className="text-2xl font-black text-mist">{main}</span>
        <span className="mt-1 text-[10px] text-dim">{sub}</span>
      </button>
    </TiltCard>
  );
}