import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人主页",
  description: "的个人主页 —— 关于我、技能、作品",
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