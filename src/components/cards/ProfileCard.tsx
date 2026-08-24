"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "@/data/content";
import TiltCard from "../TiltCard";

/**
 * 个人介绍卡片（优化版）：
 * - 头像放大 1.15 倍 + 上移 12px（不出卡片边界，不被 overflow:hidden 裁切）
 * - 事件只绑在头像上（onMouseEnter / onClick）→ 不会误触发
 * - 介绍淡入在下半区（bottom-4），不遮挡头像
 */
export default function ProfileCard() {
  const [open, setOpen] = useState(false);
  const canHover = useRef(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover)").matches;
    // 初始状态：介绍隐藏
    gsap.set(introRef.current, { opacity: 0, y: 20 });
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (open) {
      // 展开：头像 1.15 倍 + 上移 12px（安全不溢出），姓名淡出让位，介绍淡入
      tl.to(avatarRef.current, { scale: 1.15, y: -12, duration: 0.5, ease: "back.out(1.4)" })
        .to(nameRef.current, { opacity: 0, y: -10, duration: 0.3 }, 0)
        .to(introRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.15);
    } else {
      // 收起
      tl.to(avatarRef.current, { scale: 1, y: 0, duration: 0.4 })
        .to(nameRef.current, { opacity: 1, y: 0, duration: 0.35 }, 0.1)
        .to(introRef.current, { opacity: 0, y: 20, duration: 0.3 }, 0);
    }
  }, [open]);

  return (
    <TiltCard className="card-glass card-line p-6 md:p-7">
      {/* 容器：仅 onMouseLeave 关闭（桌面） */}
      <div className="relative flex h-[320px] flex-col items-center md:h-[340px]"
        onMouseLeave={() => { if (canHover.current) setOpen(false); }}
      >
        {/* ★ 头像：onMouseEnter + onClick 只绑在这里 */}
        <div
          ref={avatarRef}
          className="mt-6 cursor-pointer will-change-transform"
          onMouseEnter={() => { if (canHover.current) setOpen(true); }}
          onClick={() => { if (!canHover.current) setOpen(o => !o); }}
          role="button"
          aria-label="查看自我介绍"
        >
          <div className="relative">
            <div className="absolute -inset-2.5 animate-pulse rounded-full bg-linear-to-tr from-neon/70 via-cyan/60 to-pink/70 opacity-70 blur-lg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatar} alt="QeeYu 的头像" width={96} height={96}
              className="relative h-[96px] w-[96px] rounded-full border-2 border-white/25 object-cover" />
          </div>
        </div>

        {/* 姓名 + 标语（展开时淡出让位） */}
        <div ref={nameRef} className="mt-5 text-center will-change-transform">
          <h3 className="text-2xl font-black text-gradient">{profile.name}</h3>
          <p className="mt-1.5 text-xs text-dim">{profile.tagline}</p>
          <p className="mt-4 text-[10px] tracking-[0.3em] text-dim/50">触碰头像 · 展开介绍</p>
        </div>

        {/* ★ 介绍（绝对定位在下半区 bottom-4，不遮挡头像） */}
        <div ref={introRef} className="pointer-events-none absolute inset-x-4 bottom-4 opacity-0 whitespace-pre-line text-center text-[12.5px] leading-relaxed text-mist/90">
          {profile.intro}
        </div>
      </div>
    </TiltCard>
  );
}