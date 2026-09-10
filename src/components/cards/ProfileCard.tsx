/**
 * 个人介绍卡片（无头像版）
 * - 直接展示姓名、标语、介绍文本
 * - 底部装饰签名
 */
"use client";

import { profile } from "@/data/content";
import TiltCard from "../TiltCard";

export default function ProfileCard() {
  return (
    <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-8">
      {/* 姓名 + 标语 */}
      <header>
        <p className="mb-3 font-mono text-[10px] tracking-[0.45em] text-cyan/70">
          HI · I AM
        </p>
        <h3 className="text-gradient text-[clamp(2.2rem,5vw,3.2rem)] font-black leading-none tracking-[-0.02em]">
          {profile.name}
        </h3>
        <p className="mt-3 text-[13.5px] leading-snug text-mist/85">
          {profile.tagline}
        </p>
        <div className="mt-5 h-[2px] w-14 rounded-full bg-linear-to-r from-cyan via-neon to-pink" />
      </header>

      {/* 介绍文本：直接展示 */}
      <div className="mt-6 flex-1">
        <p className="whitespace-pre-line text-[14px] leading-[1.9] tracking-[0.005em] text-mist/80">
          {profile.intro}
        </p>
      </div>

      {/* 底部装饰签名 */}
      <footer className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="font-mono text-[10px] tracking-[0.3em] text-dim/50">
          PERSONAL · INTRO
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-cyan/60">
          KUANG.DEV
        </span>
      </footer>
    </TiltCard>
  );
}