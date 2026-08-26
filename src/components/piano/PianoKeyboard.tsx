/**
 * 钢琴键盘组件
 * - 白键 + 黑键（黑键悬于顶部 62% 高）
 * - ★ 优化黑键 z-index 和点击区域，确保精准匹配
 * - 支持滑动弹奏（鼠标/触摸）
 */
"use client";

import { useMemo, useRef, useState } from "react";
import { NOTE_NAMES, SOLFEGE, type KeyDef } from "@/lib/piano/constants";

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

  const [isSliding, setIsSliding] = useState(false);
  const lastPosRef = useRef<number | null>(null);

  const posFromPoint = (clientX: number, clientY: number): number | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const posStr = (el as HTMLElement).dataset?.pos;
    return posStr !== undefined ? Number(posStr) : null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pos = posFromPoint(e.clientX, e.clientY);
    if (pos === null) return;
    setIsSliding(true);
    lastPosRef.current = pos;
    onPointerDown(pos);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSliding) return;
    e.preventDefault();
    const pos = posFromPoint(e.clientX, e.clientY);
    if (pos === null || pos === lastPosRef.current) return;
    lastPosRef.current = pos;
    onPointerDown(pos);
  };

  const handlePointerEnd = () => {
    setIsSliding(false);
    lastPosRef.current = null;
  };

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
        {keyChar && (
          <span className="pointer-events-none absolute bottom-[34px] left-1/2 -translate-x-1/2 rounded bg-ink/25 px-1.5 py-0.5 text-[11px] font-mono font-bold text-ink/70 md:bottom-[38px] md:text-[12px]">
            {keyChar.length === 1 ? keyChar.toUpperCase() : keyChar}
          </span>
        )}
        <span className="pointer-events-none absolute bottom-[19px] left-1/2 -translate-x-1/2 text-[10px] font-medium text-ink/55 md:text-[11px]">
          {solfege}
        </span>
        <span className="pointer-events-none absolute bottom-[3px] left-1/2 -translate-x-1/2 font-mono text-[12px] font-bold text-ink/75 md:text-[13px]">
          {name}
        </span>
      </button>
    );
  };

  const renderBlack = (k: KeyDef) => {
    const name = `${NOTE_NAMES[k.noteIdx]}${k.octave}`;
    const keyChar = keyOfPos[k.pos];
    const isPressed = pressedKeys.has(k.pos);
    const isRemap = remapTarget === k.pos;
    const info = layout.map.get(k.pos)!;
    // ★ 黑键定位：在白键的右侧 60% 宽度位置，悬于顶部
    const centerPct = info.whiteIndex * step;

    return (
      <button
        key={k.pos}
        data-pos={k.pos}
        style={{
          left: `calc(${centerPct}% - ${step * 0.3}%)`,
          top: 0,
          width: `${step * 0.6}%`,
          height: "62%",
        }}
        className={`absolute z-20 cursor-pointer touch-none select-none rounded-b-md border-2 border-black/70 shadow-lg transition-colors duration-75 ${
          isPressed
            ? "bg-linear-to-b from-cyan to-neon"
            : isRemap
            ? "animate-pulse bg-pink"
            : "bg-linear-to-b from-[#2a2d3a] to-[#0d0e14]"
        }`}
        aria-label={name}
      >
        {keyChar && (
          <span className="pointer-events-none absolute bottom-[16px] left-1/2 -translate-x-1/2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white/65 md:text-[11px]">
            {keyChar.length === 1 ? keyChar.toUpperCase() : keyChar}
          </span>
        )}
        <span className="pointer-events-none absolute bottom-[3px] left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-white/70 md:text-[11px]">
          {name}
        </span>
      </button>
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-row gap-[2px] bg-black/60"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerDownCapture={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
    >
      {keys.filter((k) => !k.isBlack).map(renderWhite)}
      {keys.filter((k) => k.isBlack).map(renderBlack)}
    </div>
  );
}