"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import { skills } from "@/data/content";
import TiltCard from "../TiltCard";

/**
 * 个人技能卡片：
 * - 技能条：进入视口时从 0 弹性生长到熟练度
 * - 每行悬停：图标弹跳 + 技能条发亮
 * - 点击任一技能 → 进入该技术官网（新窗口）
 */
export default function SkillsCard() {
  const [shown, setShown] = useState(false);                 // 是否已进入视口（触发技能条生长）
  const cardRef = useRef<HTMLDivElement>(null);              // 卡片根（IO 观察目标）
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);     // 各技能条 ref

  // 进入视口（30% 露出）→ shown = true → 触发技能条动画
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(cardRef.current!);
    return () => io.disconnect();
  }, []);

  // shown 变 true → 每根技能条错峰弹性生长（anime 驱动 width）
  useEffect(() => {
    if (!shown) return;
    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      anime({
        targets: bar,
        width: `${skills[i].level}%`,      // 目标宽度 = 熟练度
        duration: 1100,
        delay: i * 90,                     // 逐条错峰 → 节奏感
        easing: "easeOutElastic(1, .55)",  // 弹性过冲 → 灵动
      });
    });
  }, [shown]);

  // 悬停单行：图标缩放弹跳（在原地放大再弹回）
  const bounceIcon = (e: React.MouseEvent<HTMLElement>) => {
    const icon = e.currentTarget.querySelector(".skill-icon");
    if (!icon) return;
    anime.remove(icon);
    anime({
      targets: icon,
      scale: [
        { value: 1.35, duration: 160, easing: "easeOutQuad" },
        { value: 1, duration: 550, easing: "easeOutElastic(1.3, .5)" },
      ],
    });
  };

  return (
    <div ref={cardRef} className="h-full">
      <TiltCard className="card-glass card-line flex h-full flex-col p-6 md:p-7">
        <header>
          <h3 className="text-sm font-black tracking-widest text-dim">个人技能 · SKILLS</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">点击技能 → 进入官方文档</p>
        </header>

        {/* 技能列表：每行可点击进入官网 */}
        <ul className="mt-5 flex flex-col gap-4">
          {skills.map((s, i) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"     // 安全打开新窗口
                onMouseEnter={bounceIcon}     // 悬停 → 图标弹跳
                className="group block cursor-pointer"
              >
                {/* 行头：图标 + 名称 + 熟练度数字 */}
                <div className="flex items-center gap-2.5">
                  <span className="skill-icon inline-block text-lg">{s.icon}</span>
                  <span className="text-sm font-bold text-mist transition-colors group-hover:text-cyan">
                    {s.name}
                  </span>
                  {/* 熟练度：悬停时从 dim 变亮 */}
                  <span className="ml-auto font-mono text-xs text-dim transition-colors group-hover:text-lime">
                    {s.level}%
                  </span>
                </div>

                {/* 技能条：底轨 + 渐变填充（宽度由 anime 驱动，初始 0） */}
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    ref={(el) => { barRefs.current[i] = el; }}
                    // 渐变色 + 悬停发亮（group-hover 提升阴影）
                    className="h-full w-0 rounded-full bg-linear-to-r from-neon via-cyan to-pink shadow-[0_0_8px_rgba(56,225,255,.4)] transition-shadow group-hover:shadow-[0_0_14px_rgba(56,225,255,.8)]"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>

        {/* 底部小结 */}
        <p className="mt-auto pt-5 text-center text-[11px] text-dim/60">
          持续学习中 · Learning in public 📚
        </p>
      </TiltCard>
    </div>
  );
}