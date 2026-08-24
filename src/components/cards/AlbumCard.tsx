"use client";

import { useRef, useState } from "react";
import Image from "next/image";          // ← Next.js 图片优化组件
import anime from "@/lib/anime";
import { album } from "@/data/content";
import TiltCard from "../TiltCard";

export default function AlbumCard() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const openBox = (i: number) => {
    setLightbox(i);
    requestAnimationFrame(() => {
      anime.remove(boxRef.current);
      anime({ targets: boxRef.current, scale: [0.8, 1], opacity: [0, 1], duration: 420, easing: "easeOutBack" });
    });
  };

  const closeBox = () => {
    anime({ targets: boxRef.current, scale: 0.85, opacity: 0, duration: 260, easing: "easeInQuad",
      complete: () => setLightbox(null) });
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Escape") closeBox(); };

  return (
    <>
      <TiltCard className="card-glass card-line p-6 md:p-7">
        <header>
          <h3 className="text-sm font-black tracking-widest text-dim">相册 · ALBUM</h3>
          <p className="mt-1.5 text-[11px] text-dim/70">点击照片放大查看</p>
        </header>

        {/* 缩略图网格 */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {album.map((a, i) => (
            <button key={a.title} onClick={() => openBox(i)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_10px_30px_-8px_rgba(124,92,255,.6)]"
              style={{ background: a.grad }}>
              {/* ★ 用 next/image 替代 <img>：自动转 WebP + 按需缩放 */}
              {a.src && (
                <Image src={a.src} alt={a.title} fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  quality={70}
                  className="object-cover transition-transform duration-300 group-hover:scale-110" />
              )}
              {!a.src && (
                <span className="absolute inset-0 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-125">{a.emoji}</span>
              )}
              <span className="absolute inset-x-0 bottom-0 translate-y-full truncate bg-black/55 px-1.5 py-1 text-[10px] text-mist backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">{a.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-dim/60">📸 记录下的六帧瞬间</p>
      </TiltCard>

      {/* 灯箱 */}
      {lightbox !== null && (
        <div onClick={closeBox} onKeyDown={onKey} tabIndex={0}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div ref={boxRef} onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-ink shadow-2xl">
            <div className="relative aspect-[4/3] w-full" style={{ background: album[lightbox].grad }}>
              {/* ★ 灯箱大图也用 next/image，quality 高一档 */}
              {album[lightbox].src ? (
                <Image src={album[lightbox].src} alt={album[lightbox].title} fill
                  sizes="(max-width: 768px) 90vw, 500px"
                  quality={85}
                  className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-8xl drop-shadow-lg">{album[lightbox].emoji}</span>
              )}
              <p className="absolute bottom-3 left-4 text-lg font-black text-white drop-shadow-md">{album[lightbox].title}</p>
            </div>
            <button onClick={closeBox} aria-label="关闭"
              className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-lg text-white transition-colors hover:bg-pink/80">✕</button>
            <p className="bg-black/40 py-2 text-center font-mono text-xs text-white/80">{lightbox + 1} / {album.length}</p>
          </div>
        </div>
      )}
    </>
  );
}