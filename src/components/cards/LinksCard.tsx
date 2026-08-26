/**
 * 个人链接卡片
 * - 每行悬停弹跳 + 右侧展开链接地址
 * - 点击打开/复制，复制时显示 Toast
 */
"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { links, type LinkItem } from "@/data/content";
import TiltCard from "../TiltCard";

export default function LinksCard() {
  const [toast, setToast] = useState("");
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    requestAnimationFrame(() => {
      anime.remove(toastRef.current);
      anime({
        targets: toastRef.current,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 320,
        easing: "easeOutBack",
      });
    });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      anime({
        targets: toastRef.current,
        opacity: 0,
        translateY: 10,
        duration: 300,
        easing: "easeInQuad",
      });
    }, 1800);
  };

  const bounceRow = (e: React.MouseEvent<HTMLElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateY: [
        { value: -6, duration: 150, easing: "easeOutQuad" },
        { value: 0, duration: 450, easing: "easeOutElastic(1.2, .5)" },
      ],
    });
  };

  const handle = async (l: LinkItem) => {
    if (l.action === "open" && l.href) {
      window.open(l.href, "_blank", "noopener,noreferrer");
    } else if (l.value) {
      try {
        await navigator.clipboard.writeText(l.value);
        showToast(`已复制：${l.label} ${l.value}`);
      } catch {
        showToast(`复制失败，请手动记录：${l.value}`);
      }
    }
  };

  return (
    <TiltCard className="card-glass card-line p-6 md:p-7">
      <header>
        <h3 className="text-sm font-black tracking-widest text-dim">我的主页 · LINKS</h3>
        <p className="mt-1.5 text-[11px] text-dim/70">悬停显示链接 · 点击进入 / 复制</p>
      </header>

      <ul className="mt-5 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <button
              onClick={() => handle(l)}
              onMouseEnter={bounceRow}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-left transition-colors hover:border-cyan/50 hover:bg-white/[.08]"
            >
              <span className="text-xl transition-transform duration-500 group-hover:rotate-[360deg]">
                {l.icon}
              </span>
              <span className="text-sm font-bold text-mist">{l.label}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-[11px] text-cyan opacity-0 transition-all duration-500 group-hover:max-w-[140px] group-hover:opacity-100">
                  {l.action === "open" ? l.href?.replace(/^https?:\/\//, "") : l.value}
                </span>
                <span className="text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan">
                  {l.action === "open" ? "↗" : "⧉"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {toast && (
        <div
          ref={toastRef}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-lime/40 bg-ink/90 px-4 py-1.5 text-xs text-lime shadow-lg opacity-0"
        >
          ✓ {toast}
        </div>
      )}
    </TiltCard>
  );
}