import type { Metadata } from "next";
import PianoPage from "@/components/piano/PianoPage";

export const metadata: Metadata = {
  title: "音琴 · QeeYu",
  description: "在线音琴 —— 真实钢琴采样、键盘映射、FFT可视化、琴谱闯关",
};

export default function Piano() {
  return <PianoPage />;
}