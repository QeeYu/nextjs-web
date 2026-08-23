// Next.js 配置：目前保持极简， StrictMode 帮助在开发期发现副作用问题
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export", // 静态导出（SSG），不依赖 Node.js 服务器
};

export default nextConfig;