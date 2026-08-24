"use client";

import { useEffect, useRef, useState } from "react";
import HeroSection from "@/components/HeroSection"; // ★ 唯一常规导入 → 主 bundle 只含 Hero + React，最小最快
import dynamic from "next/dynamic";

// ★ Main（卡片群 + anime.js）分包：与 Journey 并行下载，不拖慢首屏
const MainSection = dynamic(() => import("@/components/MainSection"));
// ★ Journey 分包：并行下载
const JourneySection = dynamic(() => import("@/components/JourneySection"));

// Journey 已挂载标记（滚动恢复用）
declare global {
  interface Window { __journeyReady?: boolean; }
}

export default function Home() {
  const [journeyMounted, setJourneyMounted] = useState(false);

  /* —— 刷新保持滚动位置（等 Journey 挂载后再恢复）—— */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const save = () => {
      try { sessionStorage.setItem("scrollY", String(window.scrollY)); } catch {}
    };
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);

    const saved = sessionStorage.getItem("scrollY");
    if (saved) {
      const y = parseInt(saved, 10);
      const html = document.documentElement;

      const doRestore = () => {
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        window.scrollTo(0, y);
        requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
      };

      const tryRestore = () => {
        // 等 Journey 挂载（pin 高度稳定）再恢复；最多等 2.5s 兜底
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

      if (document.readyState === "complete") setTimeout(tryRestore, 300);
      else window.addEventListener("load", () => setTimeout(tryRestore, 300));
    }

    return () => {
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pagehide", save);
    };
  }, [journeyMounted]);

  return (
    <main>
      {/* 首屏：主 bundle 只含 Hero + React → 最小、最快可交互 */}
      <HeroSection />

      {/* Journey：分包，挂载后标记 journeyMounted */}
      <JourneySection
        onMounted={() => {
          setJourneyMounted(true);
          window.__journeyReady = true;
        }}
      />

      {/* Main（卡片群）：分包，与 Journey 并行下载 */}
      <MainSection />
    </main>
  );
}