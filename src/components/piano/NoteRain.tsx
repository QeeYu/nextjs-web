"use client";

import { useEffect, useRef } from "react";
import { NOTE_NAMES, type KeyDef } from "@/lib/piano/constants";

/**
 * 音符雨可视化（Canvas）：
 * - 彩色音符块从上往下落
 * - 到达底部琴键位置时触发碰撞闪光
 * - 按下的琴键上方有光柱上升
 * - 与 AutoPiano 音符雨类似的视觉效果
 */
interface FallingNote {
  x: number;       // 水平位置（百分比）
  y: number;       // 垂直位置
  speed: number;   // 下落速度
  color: string;   // 颜色
  size: number;    // 尺寸
  noteName: string;// 音名
  hit: boolean;    // 是否已碰撞
}

const COLORS = ["#7c5cff", "#38e1ff", "#ff5c8a", "#b4ff39", "#ff9f5c", "#00ffcc"];

export default function NoteRain({
  keys,
  pressedKeys,
  activeNote,
}: {
  keys: KeyDef[];
  pressedKeys: Set<number>;
  activeNote: { name: string; pos: number; timestamp: number } | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notesRef = useRef<FallingNote[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let W = 0, H = 0;

    // 尺寸自适应
    const resize = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // 计算每个琴键的水平中心位置
    const keyPositions = new Map<number, number>(); // pos → x 百分比
    const whiteKeys = keys.filter((k) => !k.isBlack);
    const totalWhite = whiteKeys.length;
    let whiteCount = 0;
    for (const k of keys) {
      if (!k.isBlack) {
        whiteCount++;
        keyPositions.set(k.pos, (whiteCount - 0.5) / totalWhite);
      } else {
        // 黑键位置 = 前一个白键的右边界
        keyPositions.set(k.pos, whiteCount / totalWhite);
      }
    }

    // 生成新音符
    const spawnNote = (pos: number, name: string) => {
      const x = keyPositions.get(pos) ?? Math.random();
      notesRef.current.push({
        x: x * 100,
        y: -20,
        speed: 2 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 16 + Math.random() * 8,
        noteName: name,
        hit: false,
      });
    };

    // 粒子爆炸效果
    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 4 - 1,
          life: 1,
          color,
        });
      }
    };

    const draw = () => {
      // 清屏
      ctx.fillStyle = "rgba(5,6,14,0.15)"; // 半透明清屏 → 拖尾效果
      ctx.fillRect(0, 0, W, H);

      // ===== 音符下落 =====
      for (let i = notesRef.current.length - 1; i >= 0; i--) {
        const n = notesRef.current[i];
        n.y += n.speed;

        const px = (n.x / 100) * W;
        const py = n.y;

        // 碰撞检测：到达底部
        if (py > H - 10 && !n.hit) {
          n.hit = true;
          spawnParticles(px, H - 5, n.color);
        }

        // 出界移除
        if (py > H + 30) {
          notesRef.current.splice(i, 1);
          continue;
        }

        // 绘制音符块
        if (!n.hit) {
          ctx.save();
          ctx.globalAlpha = 0.9;

          // 发光效果
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 12;

          // 圆角矩形
          ctx.fillStyle = n.color;
          ctx.beginPath();
          const r = 6;
          const w = n.size;
          const h = n.size * 0.7;
          ctx.roundRect(px - w / 2, py - h / 2, w, h, r);
          ctx.fill();

          // 音名文字
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(n.noteName, px, py);

          ctx.restore();
        }
      }

      // ===== 粒子 =====
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // 重力
        p.life -= 0.03;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ===== 按下琴键的光柱上升 =====
      for (const pos of pressedKeys) {
        const x = keyPositions.get(pos);
        if (x === undefined) continue;
        const px = x * W;

        // 光柱（从底部往上渐隐）
        const grad = ctx.createLinearGradient(0, H, 0, 0);
        grad.addColorStop(0, "rgba(56,225,255,0.4)");
        grad.addColorStop(1, "rgba(56,225,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(px - 15, 0, 30, H);

        // 底部光点
        ctx.fillStyle = "rgba(56,225,255,0.8)";
        ctx.beginPath();
        ctx.arc(px, H - 5, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // 监听外部触发的新音符
    let lastTimestamp = 0;
    const checkActiveNote = () => {
      if (activeNote && activeNote.timestamp !== lastTimestamp) {
        lastTimestamp = activeNote.timestamp;
        spawnNote(activeNote.pos, activeNote.name);
      }
    };
    const interval = setInterval(checkActiveNote, 50);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(interval);
    };
  }, [keys, pressedKeys, activeNote]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}