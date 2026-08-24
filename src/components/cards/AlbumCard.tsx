"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { album } from "@/data/content";
import TiltCard from "../TiltCard";

/** 缩略图：按真实比例自动排布 */
function Thumbnail({ photo, onOpen }: {
  photo: { title: string; emoji: string; grad: string; src?: string };
  onOpen: () => void;
}) {
  const [aspect, setAspect] = useState("1 / 1");
  return (
    <button onClick={onOpen}
      className="group relative mb-2.5 block w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 break-inside-avoid"
      style={{ aspectRatio: aspect, background: photo.grad }}>
      {photo.src ? (
        <Image src={photo.src} alt={photo.title} fill unoptimized
          sizes="(max-width: 640px) 50vw, 25vw"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight)
              setAspect(`${img.naturalWidth} / ${img.naturalHeight}`);
          }}
          className="object-cover transition-transform duration-500 group-hover:scale-110" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-3xl">{photo.emoji}</span>
      )}
      <span className="absolute inset-x-0 bottom-0 translate-y-full truncate bg-black/55 px-1.5 py-1 text-[10px] text-mist backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">{photo.title}</span>
    </button>
  );
}

export default function AlbumCard() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openBox = (i: number) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setLightbox(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
  };

  const closeBox = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShow(false);
    closeTimer.current = setTimeout(() => setLightbox(null), 200);
  };

  // ★ 切换：-1 上一张 / +1 下一张（循环）
  const switchPhoto = (dir: number) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + album.length) % album.length);
  };

  // 键盘：Esc 关闭 / ← 上一张 / → 下一张
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") switchPhoto(-1);
      if (e.key === "ArrowRight") switchPhoto(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
      <TiltCard className="card-glass card-line p-6 md:p-7">
        <header>
          <h3 className="text-sm font-black tracking-widest text-dim">相册 · ALBUM</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">点击照片放大查看</p>
        </header>
        <div className="mt-5 columns-2 gap-2.5">
          {album.map((a, i) => (
            <Thumbnail key={a.title} photo={a} onOpen={() => openBox(i)} />
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-dim/60">📸 记录下的瞬间</p>
      </TiltCard>

      {/* ★ 灯箱：全屏 + 左右切换按钮 + 键盘 ← → */}
      {lightbox !== null && typeof document !== "undefined" && createPortal(
        <div
          onClick={closeBox}
          className={`fixed inset-0 z-[200] bg-black/95 p-8 transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
        >
          {/* 图片区（点击关闭） */}
          <div className="relative h-full w-full">
            {album[lightbox].src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={album[lightbox].src} alt={album[lightbox].title}
                className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-8xl">{album[lightbox].emoji}</span>
            )}
          </div>

          {/* ★ 左切换按钮（点按钮不关闭 → stopPropagation） */}
          {album.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); switchPhoto(-1); }}
              aria-label="上一张"
              className="absolute left-6 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-all hover:scale-110 hover:bg-neon/60 active:scale-95"
            >
              ‹
            </button>
          )}

          {/* ★ 右切换按钮 */}
          {album.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); switchPhoto(1); }}
              aria-label="下一张"
              className="absolute right-6 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-all hover:scale-110 hover:bg-neon/60 active:scale-95"
            >
              ›
            </button>
          )}

          {/* 标题（底部居中） */}
          <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-lg font-black text-white drop-shadow-md">
            {album[lightbox].title}
          </p>

          {/* 关闭按钮（右上角） */}
          <button onClick={closeBox} aria-label="关闭"
            className="absolute right-6 top-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-pink/80">✕</button>

          {/* 索引（右下角）+ 键盘提示 */}
          <p className="pointer-events-none absolute bottom-6 right-6 rounded bg-black/40 px-2 py-0.5 font-mono text-xs text-white/80">
            {lightbox + 1} / {album.length}
          </p>
          <p className="pointer-events-none absolute bottom-6 left-6 hidden font-mono text-[10px] text-white/40 md:block">
            ← → 切换 · Esc 关闭
          </p>
        </div>,
        document.body
      )}
    </>
  );
}