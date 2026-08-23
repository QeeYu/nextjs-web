"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import { hitokoto } from "@/data/content";
import TiltCard from "../TiltCard";

/* ==================================================================
 * 插件 1：一言卡片 —— 点击按钮换一句，文字逐字弹入
 * ================================================================== */
export function HitokotoCard() {
  const [text, setText] = useState(hitokoto[0]); // 当前语句
  const [count, setCount] = useState(1);         // 已看句数
  const textRef = useRef<HTMLParagraphElement>(null);

  // 点击换句：随机取一句（避免与当前重复）→ 逐字弹入动画
  const next = () => {
    let i;
    do { i = Math.floor(Math.random() * hitokoto.length); } while (i === hitokoto.indexOf(text));
    setText(hitokoto[i]);
    setCount((c) => c + 1);
    // 等待 React 渲染新文字后再播动画
    requestAnimationFrame(() => {
      anime.remove(textRef.current);
      anime({
        targets: textRef.current,
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 500,
        easing: "easeOutBack",
      });
    });
  };

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[180px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">一言 · HITOKOTO</h3>
        <span className="text-base">💭</span>
      </header>
      {/* 语句本体：淡紫引号装饰 */}
      <p ref={textRef} className="mt-4 flex-1 text-[13.5px] leading-relaxed text-mist/90">
        <span className="mr-1 text-neon">「</span>
        {text}
        <span className="ml-1 text-neon">」</span>
      </p>
      <button
        onClick={next}
        className="mt-4 cursor-pointer self-end rounded-full border border-cyan/40 px-4 py-1.5 text-xs text-cyan transition-all hover:bg-cyan/15 active:scale-95"
      >
        换一句 ↻
      </button>
      <p className="mt-2 text-right font-mono text-[10px] text-dim/50">已读 {count} 句</p>
    </TiltCard>
  );
}

/* ==================================================================
 * 插件 2：迷你音琴 —— 8 个琴键，Web Audio 合成音符（纯前端，无音频文件）
 * ================================================================== */
// 大调音阶频率表（C5 起的 8 个音）
const FREQS = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
const KEY_LABELS = ["哆", "瑞", "咪", "发", "嗦", "拉", "西", "哆"];

export function PianoCard() {
  const ctxRef = useRef<AudioContext | null>(null); // AudioContext 惰性创建（需用户手势后才允许）

  // 播放音符：振荡器 + 增益包络（快起缓落 → 类钢琴质感）
  const play = (freq: number, el?: HTMLElement) => {
    // 首次点击时创建 AudioContext（浏览器自动播放策略要求）
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    // 振荡器：正弦波
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    // 增益节点：控制音量包络
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);          // 起始静音
    gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.02); // 快速起音
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0); // 缓慢衰减
    osc.connect(gain).connect(ctx.destination); // 接线：振荡器 → 增益 → 扬声器
    osc.start();
    osc.stop(ctx.currentTime + 1.05); // 1 秒后停止（配合衰减）

    // 琴键按压动画：快速下压再弹回
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
    <TiltCard className="card-glass card-line flex h-full min-h-[180px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">迷你音琴 · PIANO</h3>
        <span className="text-base">🎹</span>
      </header>
      {/* 琴键：横向 8 键，等分排布 */}
      <div className="mt-4 flex flex-1 items-stretch gap-1.5">
        {FREQS.map((f, i) => (
          <button
            key={i}
            onClick={(e) => play(f, e.currentTarget)} // 播放音符 + 按压动画
            // 琴键外观：白底渐变 → 悬停 / 按压变色
            className="flex flex-1 cursor-pointer flex-col items-center justify-end rounded-b-lg border border-white/20 bg-linear-to-b from-white/85 to-white/55 pb-2 transition-colors hover:from-cyan/60 hover:to-cyan/30 active:from-neon/70 active:to-neon/40"
          >
            {/* 音名 + 唱名 */}
            <span className="text-[9px] font-bold text-ink/60">{KEY_LABELS[i]}</span>
            <span className="text-[8px] text-ink/40">{i + 1}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-dim/50">🎵 点击琴键，弹出你的旋律</p>
    </TiltCard>
  );
}

/* ==================================================================
 * 插件 3：减压泡泡 —— 点击戳破泡泡，泡泡随机重生，统计战绩
 * ================================================================== */
interface Bubble { id: number; x: number; y: number; size: number; hue: number; }

export function BubbleCard() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]); // 当前泡泡列表
  const [score, setScore] = useState(0);                // 已戳破数量
  const idRef = useRef(0);                              // 自增 id

  // 初始生成 5 个随机泡泡
  const spawn = (n = 1) => {
    setBubbles((bs) => {
      const next = [...bs];
      for (let i = 0; i < n; i++) {
        next.push({
          id: idRef.current++,
          // 随机位置（留出边距，百分比定位）
          x: 8 + Math.random() * 84,
          y: 12 + Math.random() * 70,
          size: 22 + Math.random() * 26,
          hue: Math.random() * 360,
        });
      }
      // 最多同时 6 个，超出移除最旧的
      return next.slice(-6);
    });
  };
  useEffect(() => { spawn(5); }, []); // 挂载时生成 5 个

  // 戳破：anime 播放爆裂（放大 + 消失），动画结束后从状态移除并补一个新泡泡
  const pop = (b: Bubble, el: HTMLElement) => {
    anime.remove(el);
    anime({
      targets: el,
      scale: 1.8,
      opacity: 0,
      duration: 280,
      easing: "easeOutQuad",
      complete: () => {
        setBubbles((bs) => bs.filter((x) => x.id !== b.id)); // 移除
        setTimeout(() => spawn(1), 350);                      // 稍后补一个
      },
    });
    setScore((s) => s + 1);
  };

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[180px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">减压泡泡 · POP!</h3>
        {/* 战绩计数 */}
        <span className="font-mono text-xs text-pink">×{score}</span>
      </header>

      {/* 泡泡游乐场：固定高度相对定位区域 */}
      <div className="relative mt-3 h-[130px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-ink/60">
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={(e) => pop(b, e.currentTarget)}
            // 泡泡外观：半透明彩色圆 + 高光点（径向渐变模拟玻璃珠）
            className="absolute cursor-pointer rounded-full transition-transform hover:scale-110"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 32% 30%, hsla(${b.hue},90%,80%,.55), hsla(${b.hue},80%,55%,.18) 60%, transparent)`,
              border: `1px solid hsla(${b.hue},80%,70%,.4)`,
              // anim-float：CSS 漂浮动画，让泡泡轻微上下浮动
            }}
            aria-label="戳破泡泡"
          >
            {/* 高光反射点 */}
            <span className="absolute left-[22%] top-[18%] h-[22%] w-[22%] rounded-full bg-white/70 blur-[1px]" />
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-dim/50">🫧 戳破它们，很解压</p>
    </TiltCard>
  );
}

/* ==================================================================
 * 插件 4：今日运势 —— 随机抽取运势签，掷骰子式翻转动画
 * ================================================================== */
const FORTUNES = [
  { icon: "SSR", text: "代码一次通过，测试全绿！", color: "#b4ff39" },
  { icon: "SR",  text: "灵感爆棚，重构顺手。",     color: "#38e1ff" },
  { icon: "SR",  text: "今日宜摸鱼，bug 明日再修。", color: "#38e1ff" },
  { icon: "R",   text: "咖啡续命，平平安安。",     color: "#7c5cff" },
  { icon: "R",   text: "遇到玄学 bug，重启解决。", color: "#7c5cff" },
  { icon: "N",   text: "键盘有点脏，记得清理。",   color: "#9aa3c7" },
];

export function FortuneCard() {
  const [fortune, setFortune] = useState(FORTUNES[0]); // 当前运势
  const [rolls, setRolls] = useState(0);               // 已抽取次数
  const [rolling, setRolling] = useState(false);       // 是否正在抽取（防连点）
  const iconRef = useRef<HTMLDivElement>(null);        // 徽章（翻转动画目标）

  // 抽签：徽章 3D 翻转两圈 → 中途更新文案 → 落定时轻微弹跳
  const roll = () => {
    if (rolling) return; // 动画播放中不允许重复点击
    setRolling(true);
    let i;
    do { i = Math.floor(Math.random() * FORTUNES.length); } while (FORTUNES[i] === fortune);
    const result = FORTUNES[i];

    anime.remove(iconRef.current);
    anime({
      targets: iconRef.current,
      rotateY: [0, 720],         // 翻转两整圈
      duration: 900,
      easing: "easeInOutQuart",
      complete: () => {
        setFortune(result);
        setRolls((r) => r + 1);
        setRolling(false);
        // 落定后的确认弹跳
        anime({
          targets: iconRef.current,
          scale: [1, 1.18, 1],
          duration: 380,
          easing: "easeOutQuad",
        });
      },
    });
  };

  return (
    <TiltCard className="card-glass card-line flex h-full min-h-[180px] flex-col p-5" maxTilt={5}>
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-black tracking-widest text-dim">今日运势 · FORTUNE</h3>
        <span className="text-base">🔮</span>
      </header>

      {/* 运势主体：居中徽章 + 文案 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        {/* 稀有度徽章：圆形，rotateY 翻转动画；perspective 开启 3D */}
        <div style={{ perspective: 500 }}>
          <div
            ref={iconRef}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-black"
            // 边框 / 文字颜色随稀有度变化
            style={{ borderColor: fortune.color, color: fortune.color }}
          >
            {fortune.icon}
          </div>
        </div>
        <p className="px-2 text-center text-[12.5px] leading-snug text-mist/90">{fortune.text}</p>
      </div>

      <button
        onClick={roll}
        disabled={rolling}
        className="mt-3 cursor-pointer self-center rounded-full border border-pink/40 px-5 py-1.5 text-xs text-pink transition-all hover:bg-pink/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {rolling ? "抽取中…" : "抽取今日运势 🎲"}
      </button>
      <p className="mt-2 text-center font-mono text-[10px] text-dim/50">已抽 {rolls} 次</p>
    </TiltCard>
  );
}