// 根布局：站点元信息 + 引入全局样式
import type { Metadata, Viewport } from "next";
import "./globals.css";

// 浏览器标签页标题 / 描述（SEO）
export const metadata: Metadata = {
  title: "QeeYu · 个人主页",
  description: "QeeYu 的个人主页 —— 关于我、技能、相册与日记",
};

// 移动端主题色（地址栏配色）
export const viewport: Viewport = {
  themeColor: "#05060e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 中文站点，使用主题中定义的显示字体
    <html lang="zh-CN">
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}