// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export const dynamic = "force-static"; // ★ 添加这一行

const baseUrl = "https://qeeyu.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/piano`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}