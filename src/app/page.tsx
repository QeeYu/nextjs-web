"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import MainSection from "@/components/MainSection";  // ★ 常规导入 → JS 进主包，和 Hero 一起最先加载

// 只有 Journey 用 dynamic 分包（GSAP 较大，延迟加载不影响首屏）
const JourneySection = dynamic(() => import("@/components/JourneySection"));

export default function Home() {
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