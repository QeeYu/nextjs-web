"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * 3D 倾斜卡片容器（所有卡片的“外壳”）：
 * - 鼠标在卡片上移动 → 卡片朝鼠标方向轻微倾斜（GSAP quickTo，丝滑跟手）
 * - 一层“眩光”高光跟随鼠标，增强立体感
 * - 触屏设备没有 mousemove → 自动退化为普通卡片（不影响任何功能）
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 7, // 最大倾斜角度（度）
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);  // 外层：监听鼠标
  const innerRef = useRef<HTMLDivElement>(null); // 内层：做 3D 旋转
  const glareRef = useRef<HTMLDivElement>(null); // 眩光层

  useEffect(() => {
    const wrap = wrapRef.current!;
    const inner = innerRef.current!;
    const glare = glareRef.current!;

    // 开启透视：旋转时近大远小，才有真实 3D 感
    gsap.set(inner, { transformPerspective: 900 });
    // quickTo：GSAP 高性能插值器（复用补间，比每次新建动画更顺滑）
    const rotX = gsap.quickTo(inner, "rotationX", { duration: 0.6, ease: "power3.out" });
    const rotY = gsap.quickTo(inner, "rotationY", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;  // 归一化到 -0.5 ~ 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rotX(-ny * maxTilt); // 鼠标在上方 → 卡片上沿向内倾
      rotY(nx * maxTilt);
      // 眩光位置写入 CSS 变量（眩光层的径向渐变背景会读取）
      glare.style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
      glare.style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
      gsap.to(glare, { opacity: 1, duration: 0.25 });
    };

    const onLeave = () => {
      rotX(0); rotY(0); // 归位
      gsap.to(glare, { opacity: 0, duration: 0.5 });
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [maxTilt]);

  return (
    // 外层占满栅格单元高度；内层承载调用方传入的样式（card-glass 等）
    <div ref={wrapRef} className="h-full">
      <div ref={innerRef} className={`tilt-transform h-full ${className}`}>
        {children}
        {/* 悬停眩光：径向高光跟随鼠标（触屏设备由 .only-hover 隐藏） */}
        <div
          ref={glareRef}
          className="only-hover pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0"
          style={{
            background:
              "radial-gradient(300px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.13), transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}