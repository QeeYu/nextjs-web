/**
 * robots.txt 配置
 * - 允许所有爬虫访问
 * - 排除音琴页面（不索引，避免与主站内容重复）
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/piano/"], // 音琴页面不索引
    },
    sitemap: "https://qeeyu.dev/sitemap.xml",
  };
}