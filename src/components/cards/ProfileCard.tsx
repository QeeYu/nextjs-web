"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "@/data/content";
import TiltCard from "../TiltCard";

/**
 * 个人介绍卡片：
 * - 默认：头像 + 姓名 + 标语
 * - 鼠标触碰头像（桌面）/ 点击卡片（手机）：
 *   头像弹性放大上移 → 姓名淡出让位 → 自我介绍从下方淡入
 * - 鼠标离开卡片（桌面）自动收起
 */
export default function ProfileCard() {
  const [open, setOpen] = useState(false);        // 是否展开自我介绍
  const canHover = useRef(false);                 // 设备是否支持 hover
  const avatarRef = useRef<HTMLDivElement>(null); // 头像（GSAP 缩放）
  const nameRef = useRef<HTMLDivElement>(null);   // 姓名区（展开时淡出）
  const introRef = useRef<HTMLDivElement>(null);  // 介绍区（展开时淡入）

  // 探测设备是否支持鼠标悬停（决定“悬停展开”还是“点击切换”）
  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  // open 状态变化 → 播放 GSAP 过渡时间线
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (open) {
      // 展开：头像放大上移，姓名让位，介绍淡入
      tl.to(avatarRef.current, { scale: 1.5, y: -24, duration: 0.55, ease: "back.out(1.6)" })
        .to(nameRef.current, { opacity: 0, y: -14, duration: 0.3 }, 0)
        .fromTo(introRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5 }, 0.18);
    } else {
      // 收起：全部回到默认状态
      tl.to(avatarRef.current, { scale: 1, y: 0, duration: 0.5 })
        .to(nameRef.current, { opacity: 1, y: 0, duration: 0.35 }, 0.1)
        .to(introRef.current, { opacity: 0, y: 18, duration: 0.3 }, 0);
    }
  }, [open]);

  return (
    <TiltCard className="card-glass card-line p-6 md:p-7">
      {/* 固定高度容器：展开/收起都只在卡片范围内变化，不引起布局跳动 */}
      <div
        className="relative flex h-[330px] flex-col items-center md:h-[350px]"
        // 桌面：鼠标离开卡片 → 收起；手机：点击卡片任意处 → 切换
        onMouseLeave={() => { if (canHover.current) setOpen(false); }}
        onClick={() => { if (!canHover.current) setOpen((o) => !o); }}
      >
        {/* —— 头像（transform 动画，不影响布局） —— */}
        <div
          ref={avatarRef}
          className="mt-4 cursor-pointer will-change-transform"
          // 桌面：悬停头像 → 展开
          onMouseEnter={() => { if (canHover.current) setOpen(true); }}
          role="button"
          aria-label="触碰头像展开自我介绍"
        >
          <div className="relative">
            {/* 头像外的呼吸光圈（animate-pulse 为 Tailwind 内置呼吸动画） */}
            <div className="absolute -inset-2.5 animate-pulse rounded-full bg-linear-to-tr from-neon/70 via-cyan/60 to-pink/70 opacity-70 blur-lg" />
            {/* 本地 SVG 头像，无需走 Next 图片优化器 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar}
              alt="QeeYu 的头像"
              width={100}
              height={100}
              className="relative h-[100px] w-[100px] rounded-full border-2 border-white/25 object-cover"
            />
          </div>
        </div>

        {/* —— 姓名 + 标语（展开时淡出让位） —— */}
        <div ref={nameRef} className="mt-5 text-center will-change-transform">
          <h3 className="text-2xl font-black text-gradient">{profile.name}</h3>
          <p className="mt-1.5 text-xs text-dim">{profile.tagline}</p>
          <p className="mt-5 text-[10px] tracking-[0.35em] text-dim/60">🖱 触碰头像 · 展开介绍</p>
        </div>

        {/* —— 自我介绍：绝对定位在卡片下半区，展开时淡入 —— */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-4 bottom-2 whitespace-pre-line rounded-xl bg-white/[.05] p-4 text-center text-[12.5px] leading-relaxed text-mist/90 opacity-0"
        >
          {profile.intro}
        </div>
      </div>
    </TiltCard>
  );
}