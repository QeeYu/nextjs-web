"use client";

import { useEffect, useRef } from "react";

/**
 * 首屏粒子背景：
 * 1. 背景：色相随时间流转的双层径向渐变（“不停变换”的极光感）
 * 2. 粒子：漂浮 + 近距离连线 + 鼠标斥力 + 点击冲击波/涟漪
 * 3. 性能：DPR 限制、粒子数按面积自适应、离屏自动暂停 rAF
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;             // rAF 句柄
    let running = true;      // 是否可见（离屏时暂停）
    let W = 0, H = 0;        // CSS 像素尺寸
    const pointer = { x: -9999, y: -9999 };                    // 鼠标位置（canvas 坐标）
    const ripples: { x: number; y: number; r: number; a: number }[] = []; // 点击涟漪

    // —— 粒子结构 ——
    interface P { x: number; y: number; vx: number; vy: number; r: number; hue: number; }
    let parts: P[] = [];

    // 尺寸自适应：按 DPR 放大画布，绘制时仍使用 CSS 像素坐标
    const resize = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, 2); // 上限 2，避免 4K 卡顿
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // 粒子数随面积变化（手机少、大屏多），上限 160 保证连线计算的流畅
      const n = Math.min(160, Math.floor((W * H) / 9000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 1 + Math.random() * 2.4,
        hue: Math.random() * 60, // 每个粒子相对基础色相的偏移
      }));
    };

    // —— 主绘制循环 ——
    let t = 0; // 时间计数，驱动颜色流转
    const draw = () => {
      t += 0.15;
      const baseHue = (t * 6) % 360; // 基础色相：缓慢循环 → “不停变换”

      // ① 背景：两层径向渐变叠加，营造极光氛围
      const g1 = ctx.createRadialGradient(W * 0.2, H * 0.25, 0, W * 0.2, H * 0.25, Math.max(W, H) * 0.7);
      g1.addColorStop(0, `hsla(${baseHue},70%,18%,1)`);
      g1.addColorStop(1, "rgba(5,6,14,1)");
      const g2 = ctx.createRadialGradient(W * 0.85, H * 0.8, 0, W * 0.85, H * 0.8, Math.max(W, H) * 0.6);
      g2.addColorStop(0, `hsla(${(baseHue + 140) % 360},70%,16%,1)`);
      g2.addColorStop(1, "rgba(5,6,14,0)");
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      // ② 粒子更新：鼠标斥力 + 摩擦限速 + 边界环绕
      for (const p of parts) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130) {                 // 鼠标 130px 范围内被推开
          const d = Math.sqrt(d2) || 1;
          const f = ((130 - d) / 130) * 0.6;  // 越近推力越大
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= 0.985; p.vy *= 0.985;         // 摩擦：运动收敛、灵动不失控
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 3) { p.vx = (p.vx / sp) * 3; p.vy = (p.vy / sp) * 3; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }

      // ③ 近距离粒子连线（n ≤ 160，O(n²) 足够快）
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            const alpha = (1 - Math.sqrt(d2) / 110) * 0.35;
            ctx.strokeStyle = `hsla(${(baseHue + a.hue) % 360},80%,70%,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // ④ 粒子本体（发光色点）
      for (const p of parts) {
        ctx.fillStyle = `hsla(${(baseHue + p.hue) % 360},85%,72%,.9)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      // ⑤ 点击涟漪：不断扩散、渐隐的圆环
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 6; rp.a -= 0.02;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `hsla(${baseHue},90%,75%,${rp.a})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    // —— 事件：把页面坐标换算为 canvas 本地坐标 ——
    const toLocal = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: cx - rect.left, y: cy - rect.top };
    };
    // 点击/触摸：生成涟漪 + 冲击波推开粒子
    const boom = (x: number, y: number) => {
      if (!running) return; // 不可见时不响应
      ripples.push({ x, y, r: 6, a: 0.8 });
      for (const p of parts) {
        const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
        if (d < 260) {
          const f = ((260 - d) / 260) * 7;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
      }
    };
    const onMove = (e: MouseEvent) => { const p = toLocal(e.clientX, e.clientY); pointer.x = p.x; pointer.y = p.y; };
    const onTouch = (e: TouchEvent) => { const t0 = e.touches[0]; if (!t0) return; const p = toLocal(t0.clientX, t0.clientY); pointer.x = p.x; pointer.y = p.y; };
    const onClick = (e: MouseEvent) => { const p = toLocal(e.clientX, e.clientY); boom(p.x, p.y); };
    const onTouchStart = (e: TouchEvent) => { const t0 = e.touches[0]; if (t0) { const p = toLocal(t0.clientX, t0.clientY); boom(p.x, p.y); } };
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };

    // —— 启动 ——
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    // 离屏暂停 / 回屏恢复（性能优化）
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !running) { running = true; raf = requestAnimationFrame(draw); }
      else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(canvas);

    // —— 卸载清理 ——
    return () => {
      running = false; cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // 画布铺满父容器（首屏 section）
  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}