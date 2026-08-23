"use client";

import { useEffect, useRef } from "react";

/**
 * 主页交互背景（覆盖“主页两页”整个区域）：
 * 1. 深空底色 + 两团缓慢漂移的氛围光 → 背景一直在“活”
 * 2. 闪烁星星 + 大号霓虹光球（近距离连线 → 星座感，叠加混合出辉光）
 * 3. 鼠标靠近：光球被轻柔推开（可互动）
 * 4. 点击空白处：涟漪扩散 + 冲击波把光球弹开
 *
 * 实现方式：组件自带 sticky 容器钉在视口上，
 * MainSection 用负 margin 让卡片内容覆盖其上（canvas 不拦截任何点击）。
 */
export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;         // rAF 句柄
    let running = true;  // 可见性标记（滚出视口时暂停，省电省帧）
    let W = 0, H = 0;    // CSS 像素尺寸
    let t = 0;           // 帧计数（驱动色相流转与漂移）
    const pointer = { x: -9999, y: -9999 }; // 鼠标位置（canvas 本地坐标）
    const ripples: { x: number; y: number; r: number; a: number }[] = []; // 点击涟漪

    // —— 光球：大而柔的发光体 ——
    interface Orb { x: number; y: number; vx: number; vy: number; r: number; hue: number; phase: number; }
    let orbs: Orb[] = [];
    // —— 星星：细小闪烁点 ——
    interface Star { x: number; y: number; r: number; phase: number; speed: number; }
    let stars: Star[] = [];

    // 尺寸自适应（DPR 上限 2：兼顾 Retina 清晰度与性能）
    const resize = () => {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // 光球数量按面积自适应（手机少、大屏多），6 ~ 14 个
      const orbN = Math.max(6, Math.min(14, Math.round((W * H) / 90000)));
      orbs = Array.from({ length: orbN }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 60 + Math.random() * 130,                 // 半径 60~190 → 柔光大球
        hue: Math.random() * 360,                    // 相对基础色相的偏移
        phase: Math.random() * Math.PI * 2,          // 游走相位（各不相同）
      }));
      // 星星固定 90 颗
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.5 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.05,
      }));
    };

    // —— 主绘制循环 ——
    const draw = () => {
      t++;
      const baseHue = (t * 0.5) % 360; // 基础色相缓慢循环 → 背景不停变换

      // ① 深空底色（纵向渐变）
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#070818");
      bg.addColorStop(1, "#05060e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ② 两团氛围光：位置用 sin/cos 随时间缓慢漂移
      const cx1 = W * (0.28 + 0.12 * Math.sin(t * 0.003));
      const cy1 = H * (0.30 + 0.12 * Math.cos(t * 0.0024));
      const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, Math.max(W, H) * 0.55);
      g1.addColorStop(0, `hsla(${baseHue}, 75%, 22%, 0.40)`);
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const cx2 = W * (0.75 + 0.10 * Math.cos(t * 0.0027));
      const cy2 = H * (0.72 + 0.10 * Math.sin(t * 0.0031));
      const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.max(W, H) * 0.5);
      g2.addColorStop(0, `hsla(${(baseHue + 160) % 360}, 75%, 20%, 0.35)`);
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // ③ 星星闪烁（透明度按正弦呼吸）
      for (const s of stars) {
        const a = 0.15 + 0.65 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.fillStyle = `rgba(232,236,255,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ④ 光球更新：随机游走 + 鼠标斥力 + 摩擦 + 出界环绕
      for (const o of orbs) {
        // 轻微游走 → 漫无目的的漂浮感
        o.vx += Math.sin(t * 0.01 + o.phase) * 0.004;
        o.vy += Math.cos(t * 0.008 + o.phase) * 0.004;
        // 鼠标 240px 范围内：轻柔推开（比首屏粒子更温和）
        const dx = o.x - pointer.x, dy = o.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240) {
          const d = Math.sqrt(d2) || 1;
          const f = ((240 - d) / 240) * 0.22;
          o.vx += (dx / d) * f;
          o.vy += (dy / d) * f;
        }
        o.vx *= 0.99; o.vy *= 0.99; // 摩擦收敛
        o.x += o.vx; o.y += o.vy;
        // 出界从另一侧回来（留出半径余量）
        if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
      }

      // 之后的光效使用“叠加”混合模式 → 霓虹辉光感
      ctx.globalCompositeOperation = "lighter";

      // ⑤ 光球连线：距离近时连线 → 星座感
      ctx.lineWidth = 1;
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const a = orbs[i], b = orbs[j];
          const dx = a.x - b.x, dy = a.y - b.y, dd = dx * dx + dy * dy;
          if (dd < 360 * 360) {
            const alpha = (1 - Math.sqrt(dd) / 360) * 0.14;
            ctx.strokeStyle = `hsla(${(baseHue + a.hue) % 360}, 85%, 70%, ${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // ⑥ 光球本体：柔和径向渐变 + 小亮核
      for (const o of orbs) {
        const hue = (baseHue + o.hue) % 360;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0,   `hsla(${hue}, 85%, 65%, 0.20)`);
        g.addColorStop(0.6, `hsla(${hue}, 85%, 60%, 0.08)`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
        // 中心亮核（像一颗星星的种子）
        ctx.fillStyle = `hsla(${hue}, 95%, 80%, 0.5)`;
        ctx.beginPath(); ctx.arc(o.x, o.y, Math.max(2, o.r * 0.05), 0, Math.PI * 2); ctx.fill();
      }

      // ⑦ 点击涟漪：不断扩散、渐隐
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 7; rp.a -= 0.014;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `hsla(${baseHue}, 90%, 75%, ${rp.a})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over"; // 恢复默认，保证下一帧底色正确
      if (running) raf = requestAnimationFrame(draw);
    };

    // —— 坐标换算：窗口坐标 → canvas 本地坐标 ——
    const toLocal = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: cx - rect.left, y: cy - rect.top };
    };

    // 点击/触摸的冲击波：涟漪 + 推开光球
    const boom = (x: number, y: number) => {
      if (!running) return;
      ripples.push({ x, y, r: 10, a: 0.7 });
      for (const o of orbs) {
        const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1;
        if (d < 320) {
          const f = ((320 - d) / 320) * 4.5;
          o.vx += (dx / d) * f;
          o.vy += (dy / d) * f;
        }
      }
    };
    // 若点击落在可交互元素（按钮/链接/卡片）上，则跳过背景反馈（避免双重反馈）
    const onInteractive = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return !!(el && el.closest && el.closest("button, a, input, textarea, svg, .card-glass"));
    };

    const onMove = (e: MouseEvent) => { const p = toLocal(e.clientX, e.clientY); pointer.x = p.x; pointer.y = p.y; };
    const onTouch = (e: TouchEvent) => { const t0 = e.touches[0]; if (!t0) return; const p = toLocal(t0.clientX, t0.clientY); pointer.x = p.x; pointer.y = p.y; };
    const onClick = (e: MouseEvent) => { if (onInteractive(e.target)) return; const p = toLocal(e.clientX, e.clientY); boom(p.x, p.y); };
    const onTouchStart = (e: TouchEvent) => { const t0 = e.touches[0]; if (!t0 || onInteractive(e.target)) return; const p = toLocal(t0.clientX, t0.clientY); boom(p.x, p.y); };
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

    // 滚出视口时暂停绘制（性能优化）
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

  return (
    // sticky 容器：滚动整个主页期间始终钉在视口顶部；
    // pointer-events-none：让所有鼠标/触摸事件穿透到上层卡片
    <div className="pointer-events-none sticky top-0 h-[100svh] w-full">
      <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
    </div>
  );
}