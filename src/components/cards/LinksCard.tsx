"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { links, type LinkItem } from "@/data/content";
import TiltCard from "../TiltCard";

/**
 * 个人主页链接卡片（GitHub / QQ / Bilibili / Email）：
 * - 悬停某一行 → 整行弹跳 + 右侧展开显示链接地址 / QQ 号
 * - 点击 → open 类型：新窗口打开；copy 类型：复制到剪贴板并弹出 toast 提示
 */
export default function LinksCard() {
  const [toast, setToast] = useState(""); // toast 文案
  const toastRef = useRef<HTMLDivElement>(null);                     // toast 元素（动画目标）
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // 自动关闭定时器

  // 轻提示：anime 弹入显示，1.8 秒后淡出消失
  const showToast = (msg: string) => {
    setToast(msg);
    // 等待 React 渲染出最新文案后再播动画
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

  // 悬停整行：向上弹一下再弹回（灵动）
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

  // 点击行为：打开链接 或 复制 QQ 号
  const handle = async (l: LinkItem) => {
    if (l.action === "open" && l.href) {
      // noopener/noreferrer：安全地在新标签页打开
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

      {/* 链接列表：每行 = 图标 + 名称 + 悬停展开的地址 */}
      <ul className="mt-5 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <button
              onClick={() => handle(l)} // 点击：打开 / 复制
              onMouseEnter={bounceRow}   // 悬停：整行弹跳
              className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-left transition-colors hover:border-cyan/50 hover:bg-white/[.08]"
            >
              {/* 图标：悬停时旋转一圈 */}
              <span className="text-xl transition-transform duration-500 group-hover:rotate-[360deg]">
                {l.icon}
              </span>

              {/* 名称 */}
              <span className="text-sm font-bold text-mist">{l.label}</span>

              {/* 右侧：悬停展开的链接地址 + 箭头 */}
              <span className="ml-auto flex items-center gap-2">
                {/* 默认 max-w-0 收起，group-hover 展开（transition-all 实现宽度动画） */}
                <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-[11px] text-cyan opacity-0 transition-all duration-500 group-hover:max-w-[140px] group-hover:opacity-100">
                  {l.action === "open" ? l.href?.replace(/^https?:\/\//, "") : l.value}
                </span>
                {/* 箭头：open 用 ↗（外链），copy 用 ⧉（复制） */}
                <span className="text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan">
                  {l.action === "open" ? "↗" : "⧉"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Toast 轻提示（复制成功时弹出，绝对定位在卡片底部） */}
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