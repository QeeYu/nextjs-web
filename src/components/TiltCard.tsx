/**
 * 3D 倾斜卡片容器
 * - 鼠标在卡片上移动 → 卡片朝鼠标方向轻微倾斜（GSAP quickTo）
 * - 眩光高光跟随鼠标，增强立体感
 * - 触屏设备自动退化为普通卡片
 */
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const inner = innerRef.current!;
    const glare = glareRef.current!;

    gsap.set(inner, { transformPerspective: 900 });

    const rotX = gsap.quickTo(inner, "rotationX", {
      duration: 0.6,
      ease: "power3.out",
    });
    const rotY = gsap.quickTo(inner, "rotationY", {
      duration: 0.6,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      rotX(-ny * maxTilt);
      rotY(nx * maxTilt);
      glare.style.setProperty("--gx", `${(nx + 0.5) * 100}%`);
      glare.style.setProperty("--gy", `${(ny + 0.5) * 100}%`);
      gsap.to(glare, { opacity: 1, duration: 0.25 });
    };

    const onLeave = () => {
      rotX(0);
      rotY(0);
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
    <div ref={wrapRef} className="h-full">
      <div ref={innerRef} className={`tilt-transform h-full ${className}`}>
        {children}
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