/**
 * FFT 频谱可视化组件
 * - 实时绘制音频频谱柱状图
 * - 低频 → 高频：紫 → 青 → 粉渐变
 * - 峰值保持（peak-hold）线条
 * - 平滑缓动消除微颤
 */
"use client";

import { useEffect, useRef } from "react";
import { engine } from "@/lib/piano/engine";

export default function FFTVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heightsRef = useRef<number[]>([]);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let W = 0,
      H = 0;

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

    const BAR_COUNT = 56;
    if (heightsRef.current.length !== BAR_COUNT) {
      heightsRef.current = new Array(BAR_COUNT).fill(0);
      peaksRef.current = new Array(BAR_COUNT).fill(0);
    }

    const draw = () => {
      // 拖尾清屏
      ctx.fillStyle = "rgba(5,6,14,0.12)";
      ctx.fillRect(0, 0, W, H);

      const fftData = engine.getFFTData();
      const barW = W / BAR_COUNT;
      const baseline = H - 6;
      const maxH = H - 24;

      for (let i = 0; i < BAR_COUNT; i++) {
        let target: number;

        if (fftData) {
          const dataIndex = Math.floor(Math.pow(i / BAR_COUNT, 1.5) * (fftData.length - 1));
          const v = fftData[dataIndex] || 0;
          const norm = Math.max(0, Math.min(1, (v + 100) / 100));
          target = Math.pow(norm, 1.4);
        } else {
          target = 0;
        }

        // 死区抑制微颤
        if (Math.abs(target - heightsRef.current[i]) < 0.008) {
          target = heightsRef.current[i];
        }

        const prev = heightsRef.current[i];
        const next = target > prev ? prev + (target - prev) * 0.28 : prev * 0.965;
        heightsRef.current[i] = next;

        const prevPeak = peaksRef.current[i];
        peaksRef.current[i] = next > prevPeak ? next : prevPeak * 0.985;

        const h = next * maxH;
        if (h < 1) continue;

        const x = i * barW;
        const bw = barW * 0.7;

        // 颜色映射
        const ratio = i / BAR_COUNT;
        let r: number, g: number, b: number;
        if (ratio < 0.33) {
          r = 124;
          g = 92 + ratio * 100;
          b = 255;
        } else if (ratio < 0.66) {
          r = 56 + (ratio - 0.33) * 180;
          g = 225;
          b = 255 - (ratio - 0.33) * 100;
        } else {
          r = 255;
          g = 92 + (1 - ratio) * 60;
          b = 138;
        }

        const grad = ctx.createLinearGradient(0, baseline, 0, baseline - h);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},0.55)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, baseline - h, bw, h);

        // 峰值线
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}