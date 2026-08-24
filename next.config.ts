import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export", // 静态导出
  images: {
    unoptimized: true, // ← 逗号 + 只留这一行（其余两项在静态导出下无效，删掉）
  },
};

export default nextConfig;