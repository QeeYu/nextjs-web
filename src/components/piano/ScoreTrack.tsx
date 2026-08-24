"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ScoreNote } from "@/lib/piano/constants";

const BLOCK = 88; // 块宽 72 + gap 16

export default function ScoreTrack({
  notes, current, wrongFlash, keyOfPos, posOfNote, onRestart,
}: {
  notes: ScoreNote[];
  current: number;
  wrongFlash: number;
  keyOfPos: Record<number, string>;
  posOfNote: Record<string, number>;
  onRestart: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWrapW(el.clientWidth));
    ro.observe(el);
    setWrapW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const finished = notes.length > 0 && current >= notes.length;
  const offset = wrapW / 2 - (current * BLOCK + 36);

  return (
    <>
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-white/[0.02]">
        {/* 中间指示框 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[88%] w-[80px] -translate-x-1/2 -translate-y-1/2 rounded-lg border-[3px] border-cyan/80 bg-cyan/5" />

        {/* 音符带 */}
        <div className="absolute top-1/2 -translate-y-1/2 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${offset}px)` }}>
          <div className="flex items-center gap-4">
            {notes.map((n, i) => {
              const pos = posOfNote[n.name];
              const keyChar = pos !== undefined ? keyOfPos[pos] : undefined;
              const isDone = i < current;
              const isTarget = i === current;

              return (
                <div key={i}
                  className={`flex h-[76px] w-[72px] flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                    isDone ? "border-lime/40 bg-lime/10 opacity-40"
                    : isTarget && n.isRest ? "border-dim/40 bg-white/5"
                    : isTarget ? `anim-target-pulse border-cyan bg-cyan/15 ${wrongFlash > 0 ? "anim-note-shake" : ""}`
                    : "border-white/10 bg-white/5 opacity-50"
                  }`}>
                  {/* 音名 */}
                  <span className={`text-xl font-black ${
                    isDone ? "text-lime" : isTarget && n.isRest ? "text-dim" : isTarget ? "text-cyan" : "text-mist/80"
                  }`}>
                    {n.isRest ? "♪" : n.label}
                  </span>
                  {/* 八度 */}
                  {!n.isRest && <span className="text-xs text-dim">{n.octave}</span>}
                  {/* 按键提示 */}
                  {keyChar && !n.isRest && (
                    <span className="mt-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono font-bold text-mist/70">
                      {keyChar.length === 1 ? keyChar.toUpperCase() : keyChar}
                    </span>
                  )}
                  {n.isRest && isTarget && <span className="text-xs text-dim/60">休止</span>}
                </div>
              );
            })}
          </div>
        </div>

        {notes.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-base text-dim/60">
            暂无琴谱 —— 打开设置导入
          </p>
        )}

        {/* 进度 */}
        {notes.length > 0 && !finished && (
          <p className="pointer-events-none absolute left-4 top-3 z-20 font-mono text-sm text-dim/60">
            {current} / {notes.length}
          </p>
        )}
      </div>

      {/* 通关层：点击任意处重来 */}
      {finished && typeof document !== "undefined" && createPortal(
        <div
          onClick={onRestart}
          className="fixed inset-0 z-[999] flex cursor-pointer flex-col items-center justify-center gap-4 bg-ink/95 backdrop-blur-lg"
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-5xl font-black text-gradient">通关！</p>
            <p className="text-base text-dim">共 {notes.length} 个音符全部正确</p>
            <p className="mt-4 animate-pulse text-xl text-cyan">点击任意处再来一遍</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}