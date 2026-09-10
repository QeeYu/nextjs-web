// src/app/manifest.ts
import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // ★ 添加这一行

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "个人主页",
    short_name: "Kuang",
    description: "个人主页 —— 关于我、技能、作品",
    start_url: "/",
    display: "standalone",
    background_color: "#05060e",
    theme_color: "#05060e",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}