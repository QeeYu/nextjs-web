/**
 * 首屏区块 HeroSection
 * - 粒子背景：ParticleBackground（极光粒子 + 鼠标/点击交互）
 * - 标题：QeeYu 逐字母弹性入场 + 呼吸动画 + 鼠标视差
 * - 底部：向下灵动箭头（点击平滑滚到"旅程"区）
 */
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import anime from "@/lib/anime";
import ParticleBackground from "./ParticleBackground";

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const letters = titleRef.current!.querySelectorAll<HTMLElement>(".hero-letter");

    // ---- 1. 瞬间设置初始状态（随机角度 + 上移 + 透明） ----
    anime({
      targets: letters,
      rotate: () => anime.random(-45, 45),
      translateY: -120,
      opacity: 0,
      duration: 0,
    });

    // ---- 2. 逐字母弹性弹入 ----
    anime({
      targets: letters,
      translateY: 0,
      rotate: 0,
      opacity: 1,
      delay: anime.stagger(100),
      duration: 1200,
      easing: "easeOutElastic(1, .6)",
    });

    // ---- 3. 标题持续呼吸缩放 ----
    const breath = anime({
      targets: titleRef.current,
      scale: [1, 1.035],
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      duration: 2400,
    });

    // ---- 4. 鼠标视差（GSAP quickTo 高性能插值） ----
    const qx = gsap.quickTo(parallaxRef.current, "x", {
      duration: 0.9,
      ease: "power3.out",
    });
    const qy = gsap.quickTo(parallaxRef.current, "y", {
      duration: 0.9,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      qx(nx * -28);
      qy(ny * -20);
    };
    window.addEventListener("mousemove", onMove);

    // ---- 5. 滚动离场淡出 ----
    const ctx = gsap.context(() => {
      gsap.to(".hero-fade", {
        y: -110,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, rootRef);

    // ---- 清理 ----
    return () => {
      breath.pause();
      anime.remove(letters);
      anime.remove(titleRef.current);
      window.removeEventListener("mousemove", onMove);
      ctx.revert();
    };
  }, []);

  /** 点击箭头：平滑滚动到旅程区块 */
  const goNext = () =>
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={rootRef}
      id="hero"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      <ParticleBackground />

      <div className="hero-fade relative z-10 flex h-full flex-col items-center justify-center px-6">
        <p className="mb-5 text-[11px] tracking-[0.6em] text-dim md:text-sm">
          HELLO · THIS IS
        </p>

        <div ref={parallaxRef} className="will-change-transform">
          <h1
            ref={titleRef}
            className="flex select-none text-[clamp(4rem,17vw,10rem)] font-black leading-none"
          >
            {"QeeYu".split("").map((c, i) => (
              <span key={i} className="hero-letter text-gradient will-change-transform">
                {c}
              </span>
            ))}
          </h1>
        </div>

        <p className="mt-7 text-center text-sm text-dim md:text-base">
          把代码写成诗 · 把页面玩成画 <span className="text-neon">✦</span>
        </p>

        <button
          onClick={goNext}
          aria-label="下滑进入"
          className="group absolute bottom-7 flex cursor-pointer flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.4em] text-dim transition-colors group-hover:text-mist">
            下滑探索
          </span>
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            className="anim-float text-cyan drop-shadow-[0_0_10px_rgba(56,225,255,.8)]"
          >
            <path
              d="M4 7l8 7 8-7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-4 right-5 z-10 font-mono text-[10px] text-dim/50">
        QEEYU.DEV-2026
      </div>
    </section>
  );
}