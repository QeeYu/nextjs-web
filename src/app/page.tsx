/**
 * 首页（客户端组件）
 * - HeroSection: 首屏（直接导入，最小化首屏 JS）
 * - JourneySection: 旅程横向滚动（动态导入，与 MainSection 并行下载）
 * - MainSection: 卡片群（动态导入）
 * - 滚动位置恢复（等 Journey 挂载后再恢复）
 */
"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import dynamic from "next/dynamic";

// ★ 动态导入：MainSection（卡片群 + anime.js）与 Journey 并行下载，不拖慢首屏
const MainSection = dynamic(() => import("@/components/MainSection"));
// ★ 动态导入：Journey（GSAP ScrollTrigger）并行下载
const JourneySection = dynamic(() => import("@/components/JourneySection"));

declare global {
  interface Window {
    /** Journey 挂载标记（滚动恢复用） */
    __journeyReady?: boolean;
  }
}

export default function Home() {
  const [journeyMounted, setJourneyMounted] = useState(false);

  /** 刷新保持滚动位置（等 Journey 挂载后再恢复） */
  useEffect(() => {
    // 禁用浏览器默认滚动恢复（由 JS 接管）
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    /** 保存当前滚动位置到 sessionStorage */
    const saveScroll = () => {
      try {
        sessionStorage.setItem("scrollY", String(window.scrollY));
      } catch {
        // 静默失败（某些浏览器可能禁用 sessionStorage）
      }
    };
    window.addEventListener("beforeunload", saveScroll);
    window.addEventListener("pagehide", saveScroll);

    /** 尝试恢复滚动位置 */
    const saved = sessionStorage.getItem("scrollY");
    if (saved) {
      const targetY = parseInt(saved, 10);
      const html = document.documentElement;

      const doRestore = () => {
        const prevBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, targetY);
        requestAnimationFrame(() => {
          html.style.scrollBehavior = prevBehavior;
        });
      };

      /** 等待 Journey 挂载（pin 高度稳定）后再恢复，最多等 2.5 秒兜底 */
      const tryRestore = () => {
        const fallback = setTimeout(doRestore, 2500);
        const check = () => {
          if (window.__journeyReady || journeyMounted) {
            clearTimeout(fallback);
            setTimeout(doRestore, 100);
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      };

      if (document.readyState === "complete") {
        setTimeout(tryRestore, 300);
      } else {
        window.addEventListener("load", () => setTimeout(tryRestore, 300));
      }
    }

    return () => {
      // 恢复浏览器默认滚动行为
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
      window.removeEventListener("beforeunload", saveScroll);
      window.removeEventListener("pagehide", saveScroll);
    };
  }, [journeyMounted]);

  return (
    <main>
      {/* 首屏：直接导入，最小、最快可交互 */}
      <HeroSection />

      {/* Journey：动态导入，挂载后标记状态 */}
      <JourneySection
        onMounted={() => {
          setJourneyMounted(true);
          window.__journeyReady = true;
        }}
      />

      {/* Main（卡片群）：动态导入，与 Journey 并行下载 */}
      <MainSection />
    </main>
  );
}