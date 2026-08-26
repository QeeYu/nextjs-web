/**
 * PWA manifest 配置
 * - 支持添加到主屏幕
 * - 静态导出模式下必须声明 dynamic = "force-static"
 */
import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // ★ 修复 static export 错误

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QeeYu 的个人主页",
    short_name: "QeeYu",
    description: "QeeYu 的个人主页 —— 关于我、技能、相册与日记",
    start_url: "/",
    display: "standalone",
    background_color: "#05060e",
    theme_color: "#05060e",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}