"use client";

import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import JourneySection from "@/components/JourneySection";
import MainSection from "@/components/MainSection";

export default function Home() {
  // ★ 刷新时保持滚动位置（内联，不用单独文件）
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    const save = () => { try { sessionStorage.setItem("scrollY", String(window.scrollY)); } catch {} };
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);

    const saved = sessionStorage.getItem("scrollY");
    if (saved) {
      const y = parseInt(saved, 10);
      const html = document.documentElement;
      const restore = () => {
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";     // 临时关掉 smooth，瞬切不滑动
        window.scrollTo(0, y);
        requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
      };
      if (document.readyState === "complete") setTimeout(restore, 300);
      else window.addEventListener("load", () => setTimeout(restore, 300));
    }

    return () => {
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  return (
    <main>
      <HeroSection />
      <JourneySection />
      <MainSection />
    </main>
  );
}