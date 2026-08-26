/**
 * 获取系统「减少动态效果」偏好
 * - 返回 boolean，表示用户是否开启了 prefers-reduced-motion
 * - 可用于条件性地禁用动画
 */
"use client";

import { useEffect, useState } from "react";

export function usePrefersReduce(): boolean {
  const [prefersReduce, setPrefersReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return prefersReduce;
}