/**
 * 自定义 404 页面
 * - 风格与主页一致
 * - 提供返回首页的链接
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-center">
      <div className="relative">
        {/* 装饰光晕 */}
        <div className="absolute -inset-2.5 animate-pulse rounded-full bg-linear-to-tr from-neon/70 via-cyan/60 to-pink/70 opacity-70 blur-lg" />
        <div className="relative text-8xl font-black text-gradient">404</div>
      </div>

      <p className="mt-6 text-xl text-mist">页面走丢了 🚀</p>
      <p className="mt-2 text-sm text-dim">
        可能被移到了别处，或者根本不存在。
      </p>

      <Link
        href="/"
        className="mt-8 rounded-full border border-neon/40 bg-neon/10 px-6 py-3 text-sm font-bold text-neon transition-colors hover:bg-neon/20 active:scale-95"
      >
        ← 返回首页
      </Link>

      {/* 底部小字 */}
      <p className="absolute bottom-6 text-[11px] text-dim/40">
        QEEYU · 2026
      </p>
    </div>
  );
}