"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 滚动显现包装器：
 * 元素进入视口时，从「下方 40px + 半透明 + 轻微缩小」过渡到正常状态。
 * - 只播放一次（播完即断开监听，零后续开销）
 * - delay：错峰延迟，营造卡片依次浮现的节奏感
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;    // 延迟
  className?: string; // 追加到根元素的自定义类
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false); // 是否已进入视口

  useEffect(() => {
    // 露出 12% 即触发显现
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // 只播一次
        }
      },
      { threshold: 0.12 }
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    // shown 切换 translate/scale/opacity；transitionDelay 实现错峰
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