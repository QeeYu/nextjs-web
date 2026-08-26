/**
 * 音琴页面布局（Server Component）
 * - 为 CDN 添加 preconnect / dns-prefetch，加速采样加载
 * - 保留 metadata 导出
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音琴 · QeeYu",
  description: "在线音琴 —— 真实钢琴采样、键盘映射、FFT可视化、琴谱闯关",
};

export default function PianoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ★ 预连接 CDN 域名，加速采样加载 */}
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      {children}
    </>
  );
}