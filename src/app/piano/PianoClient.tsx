/**
 * 音琴客户端包装器（Client Component）
 * - 使用 next/dynamic 动态导入音琴组件
 * - ssr: false → 完全客户端渲染（依赖 AudioContext）
 */
"use client";

import dynamic from "next/dynamic";

const PianoPage = dynamic(
  () => import("@/components/piano/PianoPage"),
  { ssr: false }
);

export default function PianoClient() {
  return <PianoPage />;
}