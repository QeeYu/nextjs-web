/**
 * 音琴页面（Server Component）
 * - 导出 metadata（SEO）
 * - 渲染 Client Component 包装器
 */
import type { Metadata } from "next";
import PianoClient from "./PianoClient";

export const metadata: Metadata = {
  title: "音琴 · QeeYu",
  description: "在线音琴 —— 真实钢琴采样、键盘映射、FFT可视化、琴谱闯关",
};

export default function Piano() {
  return <PianoClient />;
}