"use client";

import { useMemo, useRef, useState } from "react";
import { NOTE_NAMES, SOLFEGE, type KeyDef } from "@/lib/piano/constants";

/**
 * 琴键组件：
 * - 黑键悬于顶部 62% 高（俯视真钢琴：上方黑+白、下方纯白键）
 * - 滑动弹奏（pointermove + elementFromPoint，鼠标/触摸通用）
 * - 放大标注：按键提示 / 唱名 / 音名
 */
export default function PianoKeyboard({
  keys,
  pressedKeys,
  remapTarget,
  keyOfPos,
  onPointerDown,
}: {
  keys: KeyDef[];
  pressedKeys: Set<number>;
  remapTarget: number | null;
  keyOfPos: Record<number, string>;
  onPointerDown: (pos: number) => void;
}) {
  // 布局计算：白键索引/总数
  const layout = useMemo(() => {
    let whiteCount = 0;
    const map = new Map<number, { whiteIndex: number }>();
    for (const k of keys) {
      if (!k.isBlack) whiteCount++;
      map.set(k.pos, { whiteIndex: whiteCount });
    }
    return { map, totalWhite: whiteCount };
  }, [keys]);

  const totalWhite = layout.totalWhite;
  const step = 100 / totalWhite;

  // 滑动弹奏状态
  const [isSliding, setIsSliding] = useState(false);
  const lastPosRef = useRef<number | null>(null);

  /** 从指针坐标找到琴键（elementFromPoint 拿 data-pos） */
  const posFromPoint = (clientX: number, clientY: number): number | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const posStr = (el as HTMLElement).dataset?.pos;
    return posStr !== undefined ? Number(posStr) : null;
  };

  /** 按下（滑动起点） */
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pos = posFromPoint(e.clientX, e.clientY);
    if (pos === null) return;
    setIsSliding(true);
    lastPosRef.current = pos;
    onPointerDown(pos);
  };

  /** 滑动中：进入新琴键即触发 */
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSliding) return;
    e.preventDefault();
    const pos = posFromPoint(e.clientX, e.clientY);
    if (pos === null || pos === lastPosRef.current) return;
    lastPosRef.current = pos;
    onPointerDown(pos);
  };

  /** 结束滑动 */
  const handlePointerEnd = () => {
    setIsSliding(false);
    lastPosRef.current = null;
  };

  /** 白键（放大标注） */
  const renderWhite = (k: KeyDef) => {
    const name = `${NOTE_NAMES[k.noteIdx]}${k.octave}`;
    const solfege = SOLFEGE[k.noteIdx] || NOTE_NAMES[k.noteIdx];
    const keyChar = keyOfPos[k.pos];
    const isPressed = pressedKeys.has(k.pos);
    const isRemap = remapTarget === k.pos;

    return (
      <button
        key={k.pos}
        data-pos={k.pos}
        className={`relative flex-1 cursor-pointer touch-none select-none border-r-2 border-b-4 transition-colors duration-75 ${
          isPressed
            ? "border-b-black/60 bg-linear-to-b from-cyan/70 to-neon/50"
            : isRemap
            ? "animate-pulse border-b-black/30 bg-pink/40"
            : "border-b-black/40 border-r-black/50 bg-linear-to-b from-white/95 to-white/70"
        }`}
        aria-label={`${name} ${solfege}`}
      >
        {/* 按键提示（放大） */}
        {keyChar && (
          <span className="pointer-events-none absolute bottom-[34px] left-1/2 -translate-x-1/2 rounded bg-ink/25 px-1.5 py-0.5 text-[11px] font-mono font-bold text-ink/70 md:bottom-[38px] md:text-[12px]">
            {keyChar.length === 1 ? keyChar.toUpperCase() : keyChar}
          </span>
        )}
        {/* 唱名（放大） */}
        <span className="pointer-events-none absolute bottom-[19px] left-1/2 -translate-x-1/2 text-[10px] font-medium text-ink/55 md:text-[11px]">
          {solfege}
        </span>
        {/* 音名（放大） */}
        <span className="pointer-events-none absolute bottom-[3px] left-1/2 -translate-x-1/2 font-mono text-[12px] font-bold text-ink/75 md:text-[13px]">
          {name}
        </span>
      </button>
    );
  };

  /** 黑键（★ top:0 悬于顶部——上方黑+白、下方纯白键） */
  const renderBlack = (k: KeyDef) => {
    const name = `${NOTE_NAMES[k.noteIdx]}${k.octave}`;
    const keyChar = keyOfPos[k.pos];
    const isPressed = pressedKeys.has(k.pos);
    const isRemap = remapTarget === k.pos;
    const info = layout.map.get(k.pos)!;
    const centerPct = info.whiteIndex * step;

    return (
      <button
        key={k.pos}
        data-pos={k.pos}
        style={{
          left: `calc(${centerPct}% - ${step * 0.3}%)`,
          top: 0,              // ★ 悬于顶部
          width: `${step * 0.6}%`,
          height: "62%",
        }}
        className={`absolute z-10 cursor-pointer touch-none select-none rounded-b-md border-2 border-black/70 shadow-lg transition-colors duration-75 ${
          isPressed
            ? "bg-linear-to-b from-cyan to-neon"
            : isRemap
            ? "animate-pulse bg-pink"
            : "bg-linear-to-b from-[#2a2d3a] to-[#0d0e14]"
        }`}
        aria-label={name}
      >
        {/* 按键提示（放大） */}
        {keyChar && (
          <span className="pointer-events-none absolute bottom-[16px] left-1/2 -translate-x-1/2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white/65 md:text-[11px]">
            {keyChar.length === 1 ? keyChar.toUpperCase() : keyChar}
          </span>
        )}
        {/* 音名（放大） */}
        <span className="pointer-events-none absolute bottom-[3px] left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-white/70 md:text-[11px]">
          {name}
        </span>
      </button>
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-row gap-[2px] bg-black/60"
      // 滑动弹奏：事件挂容器上 + pointer capture
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerDownCapture={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
    >
      {/* 白键 */}
      {keys.filter((k) => !k.isBlack).map(renderWhite)}
      {/* 黑键 */}
      {keys.filter((k) => k.isBlack).map(renderBlack)}
    </div>
  );
}