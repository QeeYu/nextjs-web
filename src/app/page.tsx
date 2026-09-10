/**
 * 首页
 * - HeroSection: 首屏，同步加载（最小、最快可交互）
 * - JourneySection: 动态加载，带骨架屏
 * - MainSection: 动态加载，带骨架屏
 */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";

// ★ 通用骨架屏
function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
        </div>
        <span className="font-mono text-[11px] tracking-[0.3em] text-dim">
          {label}
        </span>
      </div>
    </div>
  );
}

const JourneySection = dynamic(() => import("@/components/JourneySection"), {
  ssr: false,
  loading: () => <SectionSkeleton label="LOADING JOURNEY..." />,
});

const MainSection = dynamic(() => import("@/components/MainSection"), {
  ssr: false,
  loading: () => <SectionSkeleton label="LOADING CONTENT..." />,
});

declare global {
  interface Window {
    __journeyReady?: boolean;
  }
}

export default function Home() {
  const [journeyMounted, setJourneyMounted] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const saveScroll = () => {
      try {
        sessionStorage.setItem("scrollY", String(window.scrollY));
      } catch {}
    };
    window.addEventListener("beforeunload", saveScroll);
    window.addEventListener("pagehide", saveScroll);

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
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
      window.removeEventListener("beforeunload", saveScroll);
      window.removeEventListener("pagehide", saveScroll);
    };
  }, [journeyMounted]);

  return (
    <main>
      <HeroSection />

      <JourneySection
        onMounted={() => {
          setJourneyMounted(true);
          window.__journeyReady = true;
        }}
      />

      <MainSection />
    </main>
  );
}