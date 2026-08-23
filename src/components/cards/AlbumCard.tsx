"use client";

import { useRef, useState } from "react";
import anime from "@/lib/anime";
import { album } from "@/data/content";
import TiltCard from "../TiltCard";

const PAGE_SIZE = 6; // 默认显示张数（之后点「展开全部」）

/**
 * 相册卡片（多图版）：
 * - 默认显示 6 张，底部按钮「展开全部 / 收起」
 * - 悬停缩略图：上浮 + 放大 + 阴影增强
 * - 点击打开灯箱：支持 左/右 按钮 和 键盘 ← → 切换，Esc / 点遮罩关闭
 * - 无 src 的条目自动退回「渐变 + emoji」显示
 */
export default function AlbumCard() {
  const [lightbox, setLightbox] = useState<number | null>(null); // 当前查看的索引（null = 关闭）
  const [expanded, setExpanded] = useState(false);               // 是否展开全部照片
  const boxRef = useRef<HTMLDivElement>(null);                   // 灯箱内容（动画目标）
  const imgRef = useRef<HTMLDivElement>(null);                   // 灯箱大图区域（切换动画目标）

  // 当前可见的照片列表：未展开时只取前 6 张
  const visible = expanded ? album : album.slice(0, PAGE_SIZE);

  // 打开灯箱：设置索引后播放入场动画（scale 0.8 → 1 + 淡入）
  const openBox = (i: number) => {
    setLightbox(i);
    requestAnimationFrame(() => {
      anime.remove(boxRef.current);
      anime({
        targets: boxRef.current,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 420,
        easing: "easeOutBack",
      });
    });
  };

  // 关闭灯箱：先播缩小动画，结束后清空索引
  const closeBox = () => {
    anime({
      targets: boxRef.current,
      scale: 0.85,
      opacity: 0,
      duration: 260,
      easing: "easeInQuad",
      complete: () => setLightbox(null),
    });
  };

  // 切换照片（dir = -1 上一张 / +1 下一张；循环滚动）
  const switchPhoto = (dir: number) => {
    if (lightbox === null) return;
    const next = (lightbox + dir + album.length) % album.length; // 取模实现首尾循环
    setLightbox(next);
    // 大图切换动画：轻微位移 + 淡入
    requestAnimationFrame(() => {
      anime.remove(imgRef.current);
      anime({
        targets: imgRef.current,
        opacity: [0, 1],
        translateX: [dir * 30, 0],
        duration: 300,
        easing: "easeOutQuad",
      });
    });
  };

  // 灯箱键盘操作：← 上一张 / → 下一张 / Esc 关闭
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeBox();
    if (e.key === "ArrowLeft") switchPhoto(-1);
    if (e.key === "ArrowRight") switchPhoto(1);
  };

  // 展开 / 收起按钮：卡片高度变化的小动画
  const toggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    setExpanded((v) => !v);
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      scale: [{ value: 0.92, duration: 90 }, { value: 1, duration: 300, easing: "easeOutBack" }],
    });
  };

  return (
    <>
      {/* ———— 卡片本体 ———— */}
      <TiltCard className="card-glass card-line p-6 md:p-7">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black tracking-widest text-dim">相册 · ALBUM</h3>
            <p className="mt-1.5 text-[11px] text-dim/70">点击照片放大查看</p>
          </div>
          {/* 照片总数徽标 */}
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-dim">
            {album.length} 张
          </span>
        </header>

        {/* 缩略图网格：手机 2 列 / 平板及以上 3 列（数量随数据自动增长） */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {visible.map((a, i) => (
            <button
              key={a.title}
              onClick={() => openBox(i)} // 点击 → 打开灯箱（注意：灯箱索引用全量 album）
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-[0_10px_30px_-8px_rgba(124,92,255,.6)]"
              style={{ background: a.grad }} // 渐变垫底：图片加载前也有颜色
            >
              {/* 真实照片：铺满缩略图 */}
              {a.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.src}
                  alt={a.title}
                  loading="lazy" // 懒加载：滚到可视区才请求
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              {/* 后备 emoji：无 src 时显示 */}
              {!a.src && (
                <span className="absolute inset-0 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-125">
                  {a.emoji}
                </span>
              )}
              {/* 标题条：悬停时才从底部滑入，平时不挡照片 */}
              <span className="absolute inset-x-0 bottom-0 translate-y-full truncate bg-black/55 px-1.5 py-1 text-[10px] text-mist backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                {a.title}
              </span>
            </button>
          ))}
        </div>

        {/* 展开 / 收起按钮：照片超过 6 张时才显示 */}
        {album.length > PAGE_SIZE && (
          <button
            onClick={toggleExpand}
            className="mx-auto mt-4 block cursor-pointer rounded-full border border-cyan/40 px-5 py-1.5 text-xs text-cyan transition-all hover:bg-cyan/15 active:scale-95"
          >
            {expanded ? `收起 ▲` : `展开全部 ${album.length} 张 ▼`}
          </button>
        )}
      </TiltCard>

      {/* ———— 全屏灯箱 ———— */}
      {lightbox !== null && (
        <div
          onClick={closeBox}
          onKeyDown={onKey}
          tabIndex={0}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
        >
          {/* 灯箱内容：阻止点击冒泡 */}
          <div
            ref={boxRef}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-ink shadow-2xl"
          >
            {/* 大图区域（切换动画目标） */}
            <div ref={imgRef} className="relative aspect-[4/3] w-full" style={{ background: album[lightbox].grad }}>
              {album[lightbox].src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album[lightbox].src}
                  alt={album[lightbox].title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-8xl drop-shadow-lg">
                  {album[lightbox].emoji}
                </span>
              )}
              {/* 标题：左下角 */}
              <p className="absolute bottom-3 left-4 text-lg font-black text-white drop-shadow-md">
                {album[lightbox].title}
              </p>

              {/* 上一张 / 下一张按钮（照片多于 1 张时显示） */}
              {album.length > 1 && (
                <>
                  <button
                    onClick={() => switchPhoto(-1)}
                    aria-label="上一张"
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-xl text-white transition-colors hover:bg-neon/80"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => switchPhoto(1)}
                    aria-label="下一张"
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-xl text-white transition-colors hover:bg-neon/80"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={closeBox}
              aria-label="关闭"
              className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-lg text-white transition-colors hover:bg-pink/80"
            >
              ✕
            </button>

            {/* 底部：索引 + 键盘提示 */}
            <p className="flex items-center justify-center gap-3 bg-black/40 py-2 font-mono text-xs text-white/80">
              <span>{lightbox + 1} / {album.length}</span>
              <span className="hidden text-[10px] text-white/40 sm:inline">← → 切换 · Esc 关闭</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}