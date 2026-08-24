"use client";

import { useEffect, useRef } from "react";
import { engine } from "@/lib/piano/engine";

export default function FFTVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heightsRef = useRef<number[]>([]);
  const peaksRef = useRef<number[]>([]); // 峰值标记

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let W = 0, H = 0;

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

    const BAR_COUNT = 56; // 柱子数（稍多更细腻）
    if (heightsRef.current.length !== BAR_COUNT) {
      heightsRef.current = new Array(BAR_COUNT).fill(0);
      peaksRef.current = new Array(BAR_COUNT).fill(0);
    }

    const draw = () => {
      // 更轻的拖尾清屏（数值越小拖尾越长越顺滑）
      ctx.fillStyle = "rgba(5,6,14,0.12)";
      ctx.fillRect(0, 0, W, H);

      const fftData = engine.getFFTData();
      const barW = W / BAR_COUNT;
      const baseline = H - 6;
      const maxH = H - 24;

      for (let i = 0; i < BAR_COUNT; i++) {
        let target: number;

        if (fftData) {
          // 对数采样：低频细节更多
          const dataIndex = Math.floor(Math.pow(i / BAR_COUNT, 1.5) * (fftData.length - 1));
          const v = fftData[dataIndex] || 0;
          // dB(-100~0) → 0~1，加感知曲线让中低音更明显
          const norm = Math.max(0, Math.min(1, (v + 100) / 100));
          target = Math.pow(norm, 1.4);
        } else {
          target = 0;
        }
        
        // ★ 死区：目标与当前差 < 0.008 时视为静止，锁住高度（消除静止微颤）
        if (Math.abs(target - heightsRef.current[i]) < 0.008) {
          target = heightsRef.current[i];
        }

        const prev = heightsRef.current[i];
        // ★ 更顺滑的缓动：攻击快（0.5）、释放慢（0.88 指数衰减）
        const next = target > prev
          ? prev + (target - prev) * 0.28
          : prev * 0.965;
        heightsRef.current[i] = next;

        // 峰值缓落（独立于柱体，形成经典的 peak-hold 效果）
        const prevPeak = peaksRef.current[i];
        peaksRef.current[i] = next > prevPeak
          ? next
          : prevPeak * 0.985;

        const h = next * maxH;
        if (h < 1) continue;

        const x = i * barW;
        const bw = barW * 0.7;

        // 颜色（频率渐变：低紫 → 中青 → 高粉）
        const ratio = i / BAR_COUNT;
        let r: number, g: number, b: number;
        if (ratio < 0.33) { r = 124; g = 92 + ratio * 100; b = 255; }
        else if (ratio < 0.66) { r = 56 + (ratio - 0.33) * 180; g = 225; b = 255 - (ratio - 0.33) * 100; }
        else { r = 255; g = 92 + (1 - ratio) * 60; b = 138; }

        // 柱体（底透明 → 顶不透明渐变）
        const grad = ctx.createLinearGradient(0, baseline, 0, baseline - h);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},0.55)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.95)`);

        ctx.fillStyle = grad;
        ctx.fillRect(x, baseline - h, bw, h);

        // ★ 峰值横线（缓慢下落的白色亮线）
        const peakH = peaksRef.current[i] * maxH;
        if (peakH > 2) {
          ctx.fillStyle = `rgba(255,255,255,${0.35 + peaksRef.current[i] * 0.3})`;
          ctx.fillRect(x, baseline - peakH - 2, bw, 2);
        }

        // 顶部亮帽
        if (next > 0.08) {
          ctx.fillStyle = `rgba(255,255,255,${next * 0.9})`;
          ctx.fillRect(x, baseline - h, bw, 2);
        }
      }

      // 基线
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      ctx.lineTo(W, baseline);
      ctx.stroke();

      // 频段标签
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("LOW", W * 0.15, baseline + 16);
      ctx.fillText("MID", W * 0.5, baseline + 16);
      ctx.fillText("HIGH", W * 0.85, baseline + 16);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}