/**
 * Next.js 配置文件
 * - 使用静态导出模式 (output: "export")
 * - 禁用图片优化（静态导出必须）
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 开启 React 严格模式（开发阶段捕获潜在问题） */
  reactStrictMode: true,

  /** 静态导出：生成纯静态 HTML 文件，无需 Node.js 服务器运行 */
  output: "export",

  /** 图片配置：静态导出下必须禁用优化 */
  images: {
    unoptimized: true,
  },

  /** 生产环境构建时移除 console.log（保留 error/warn） */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
};

export default nextConfig;