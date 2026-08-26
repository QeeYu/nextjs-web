// src/app/robots.ts
import type { MetadataRoute } from 'next';

// 明确声明为静态，强制在构建时生成
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/piano/',
    },
    sitemap: 'https://qeeyu.dev/sitemap.xml',
  };
}