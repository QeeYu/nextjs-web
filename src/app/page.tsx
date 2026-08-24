"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";

// ★ 动态导入：JS 拆成独立 chunk，首屏只加载 Hero
// 构建时仍预渲染 HTML（用户立即看到内容），JS 在后台异步加载
const JourneySection = dynamic(() => import("@/components/JourneySection"));
const MainSection = dynamic(() => import("@/components/MainSection"));

export default function Home() {
  // 刷新保持滚动位置
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const save = () => { try { sessionStorage.setItem("scrollY", String(window.scrollY)); } catch {} };
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);
    const saved = sessionStorage.getItem("scrollY");
    if (saved) {
      const y = parseInt(saved, 10);
      const html = document.documentElement;
      const restore = () => {
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
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