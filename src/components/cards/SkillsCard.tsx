/**
 * 个人技能卡片
 * - 进入视口时技能条从 0 弹性生长
 * - 悬停图标弹跳 + 技能条高亮
 * - 点击技能进入官网
 */
"use client";

import { useEffect, useRef, useState } from "react";
import anime from "@/lib/anime";
import { skills } from "@/data/content";
import TiltCard from "../TiltCard";

export default function SkillsCard() {
  const [shown, setShown] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(cardRef.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shown) return;
    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      anime({
        targets: bar,
        width: `${skills[i].level}%`,
        duration: 1100,
        delay: i * 90,
        easing: "easeOutElastic(1, .55)",
      });
    });
  }, [shown]);

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

        <ul className="mt-5 flex flex-col gap-4">
          {skills.map((s, i) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={bounceIcon}
                className="group block cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="skill-icon inline-block text-lg">{s.icon}</span>
                  <span className="text-sm font-bold text-mist transition-colors group-hover:text-cyan">
                    {s.name}
                  </span>
                  <span className="ml-auto font-mono text-xs text-dim transition-colors group-hover:text-lime">
                    {s.level}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    className="h-full w-0 rounded-full bg-linear-to-r from-neon via-cyan to-pink shadow-[0_0_8px_rgba(56,225,255,.4)] transition-shadow group-hover:shadow-[0_0_14px_rgba(56,225,255,.8)]"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-auto pt-5 text-center text-[11px] text-dim/60">
          持续学习中 · Learning in public 📚
        </p>
      </TiltCard>
    </div>
  );
}