/**
 * 作品卡片
 * - 网格布局展示作品集
 * - 支持图片、视频、可下载工作流
 * - 图片/视频从远程 CDN 加载（腾讯云 COS）
 * - 有 downloadUrl 的作品，可直接下载原文件
 * - ★ 性能优化：移除 TiltCard，精简 hover 效果，启用 GPU 合成
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { works, type WorkItem } from "@/data/content";

/** 单个作品缩略图 */
function WorkThumb({ work, onOpen }: { work: WorkItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="work-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left"
      style={{ transform: "translateZ(0)" }}
    >
      {/* 封面 */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ background: work.grad }}
      >
        {work.src ? (
          <Image
            src={work.thumb || work.src}
            alt={work.title}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="work-cover object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl">
            {work.emoji}
          </span>
        )}

        {/* 分类角标 */}
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10.5px]">
          {work.category}
        </span>

        {/* 右上角标识：视频 / 下载 */}
        <div className="pointer-events-none absolute right-2 top-2 flex gap-1.5 sm:right-3 sm:top-3">
          {work.video && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm sm:h-7 sm:w-7">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
          {work.downloadUrl && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/80 text-ink backdrop-blur-sm sm:h-7 sm:w-7">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        {/* 悬停渐变遮罩（用 opacity 变换，走 GPU） */}
        <span className="work-overlay pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0" />

        {/* 打开图标 */}
        <span className="work-open pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 translate-y-2 items-center justify-center rounded-full bg-cyan/90 text-ink opacity-0 sm:bottom-3 sm:right-3 sm:h-8 sm:w-8">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M7 17L17 7M17 7H9M17 7v8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* 信息 */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h4 className="text-[13px] font-bold leading-snug text-mist sm:text-[15px]">
          {work.title}
        </h4>
        <div className="mt-auto flex flex-wrap gap-1 sm:gap-1.5">
          {work.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9.5px] text-dim sm:px-2 sm:text-[10.5px]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

/** 下载工具：优先用 fetch + blob */
async function downloadFile(url: string, filename?: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (err) {
    console.warn("[download] fetch 失败，回退到直接打开:", err);
    window.open(url, "_blank", "noopener,noreferrer");
    return false;
  }
}

export default function WorksCard() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const handleDownload = async (work: WorkItem) => {
    if (!work.downloadUrl) return;
    showToast(`⬇ 正在下载 ${work.downloadName || work.title}...`);
    const ok = await downloadFile(work.downloadUrl, work.downloadName);
    if (ok) showToast(`✅ 已下载 ${work.downloadName || work.title}`);
    else showToast(`↗ 已在新窗口打开下载链接`);
  };

  const openBox = (i: number) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setLightbox(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
  };

  const closeBox = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShow(false);
    closeTimer.current = setTimeout(() => setLightbox(null), 200);
  };

  const switchWork = (dir: number) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + works.length) % works.length);
  };

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") switchWork(-1);
      if (e.key === "ArrowRight") switchWork(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  const active = lightbox !== null ? works[lightbox] : null;

  return (
    <>
      <div className="card-glass card-line p-5 md:p-8">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black tracking-widest text-dim">
              作品集 · WORKS
            </h3>
            <p className="mt-1.5 text-[11px] text-dim/70">
              点击作品查看详情 · 部分作品可下载原文件
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10.5px] text-dim">
            {works.length} 个作品
          </span>
        </header>

        {/* 网格：手机 2 列 / 大屏 3 列 */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {works.map((w, i) => (
            <WorkThumb key={w.title} work={w} onOpen={() => openBox(i)} />
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-dim/60">
          🎨 从想法到成品 · 每一张都亲手调过色
        </p>
      </div>

      {/* 灯箱 Portal */}
      {lightbox !== null &&
        active &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeBox}
            className={`fixed inset-0 z-[200] flex flex-col bg-black/95 transition-opacity duration-200 ${
              show ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* 大图 / 视频区 */}
            <div
              className="relative min-h-0 flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              {active.video ? (
                <video
                  src={active.video}
                  controls
                  autoPlay
                  playsInline
                  poster={active.src}
                  className="absolute inset-0 h-full w-full object-contain p-6"
                >
                  你的浏览器不支持视频播放
                </video>
              ) : active.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.src}
                  alt={active.title}
                  className="absolute inset-0 h-full w-full object-contain p-6"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-8xl">
                  {active.emoji}
                </span>
              )}
            </div>

            {/* 底部信息栏 */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 border-t border-white/10 bg-ink/80 px-6 py-5 backdrop-blur-md md:px-10"
            >
              <div className="mx-auto flex max-w-4xl flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-cyan/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan">
                    {active.category}
                  </span>
                  <h3 className="text-xl font-black text-mist">
                    {active.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-mist/80">
                  {active.desc}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-dim"
                    >
                      #{t}
                    </span>
                  ))}

                  {/* 下载按钮 */}
                  {active.downloadUrl && (
                    <button
                      onClick={() => handleDownload(active)}
                      className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-cyan/50 bg-cyan/10 px-3.5 py-1.5 text-xs font-bold text-cyan transition-colors hover:bg-cyan/20 active:scale-95"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      下载工作流
                    </button>
                  )}

                  {/* 外部链接按钮 */}
                  {active.href && (
                    <a
                      href={active.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        active.downloadUrl ? "" : "ml-auto"
                      } rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-bold text-neon transition-colors hover:bg-neon/20`}
                    >
                      查看详情 ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 上一个作品 */}
            {works.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  switchWork(-1);
                }}
                aria-label="上一个作品"
                className="absolute left-4 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-neon/60 active:scale-95 md:left-8"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 5l-7 7 7 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* 下一个作品 */}
            {works.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  switchWork(1);
                }}
                aria-label="下一个作品"
                className="absolute right-4 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-transform hover:scale-110 hover:bg-neon/60 active:scale-95 md:right-8"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* 关闭 */}
            <button
              onClick={closeBox}
              aria-label="关闭"
              className="absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-pink/80"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* 计数 + 快捷键提示 */}
            <p className="pointer-events-none absolute left-5 top-5 rounded bg-black/40 px-2 py-0.5 font-mono text-xs text-white/80">
              {lightbox + 1} / {works.length}
            </p>
            <p className="pointer-events-none absolute bottom-24 right-6 hidden font-mono text-[10px] text-white/40 md:block">
              ← → 切换 · Esc 关闭
            </p>
          </div>,
          document.body
        )}

      {/* 下载 Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan/40 bg-ink-2/95 px-5 py-2.5 text-sm text-cyan shadow-2xl backdrop-blur-md">
          {toast}
        </div>
      )}
    </>
  );
}