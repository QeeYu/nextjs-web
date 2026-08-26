/**
 * 滚动显现包装器
 * - 元素进入视口时，从「下方 40px + 半透明 + 轻微缩小」过渡到正常状态
 * - 只播放一次（播完即断开监听）
 * - delay 实现错峰浮现
 */
"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`h-full transition-all duration-700 ease-out ${
        shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}