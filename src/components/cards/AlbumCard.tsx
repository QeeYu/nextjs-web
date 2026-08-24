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

  // 打开：挂载 → 下一帧淡入（CSS 过渡，不卡）
  const openBox = (i: number) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setLightbox(i);
    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)));
  };

  // ★ 关闭：淡出 → 200ms 后卸载。点哪都调这个
  const closeBox = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShow(false);
    closeTimer.current = setTimeout(() => setLightbox(null), 200);
  };

  // Esc 关闭
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeBox(); };
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

      {/* ★ createPortal 到 body + CSS opacity 过渡（无 anime.js = 不卡）+ 点哪都关 */}
      {lightbox !== null && typeof document !== "undefined" && createPortal(
        <div
          onClick={closeBox}
          className={`fixed inset-0 z-[200] bg-black/95 p-8 transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
        >
          <div className="relative h-full w-full">
            {album[lightbox].src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={album[lightbox].src} alt={album[lightbox].title}
                className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-8xl">{album[lightbox].emoji}</span>
            )}
          </div>
          <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-lg font-black text-white drop-shadow-md">
            {album[lightbox].title}
          </p>
          <button onClick={closeBox} aria-label="关闭"
            className="absolute right-6 top-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-pink/80">✕</button>
          <p className="pointer-events-none absolute bottom-6 right-6 rounded bg-black/40 px-2 py-0.5 font-mono text-xs text-white/80">
            {lightbox + 1} / {album.length}
          </p>
        </div>,
        document.body
      )}
    </>
  );
}