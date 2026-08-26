/**
 * 站点地图
 * - 自动生成 sitemap.xml
 * - 包含首页和音琴页
 */
import type { MetadataRoute } from "next";

const baseUrl = "https://qeeyu.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/piano`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];
}