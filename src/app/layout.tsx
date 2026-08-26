import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QeeYu · 个人主页",
  description: "QeeYu 的个人主页 —— 关于我、技能、相册与日记",
};

export const viewport: Viewport = {
  themeColor: "#05060e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}