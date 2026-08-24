"use client";

import { useEffect, useRef, useState } from "react";
import type { ScoreNote } from "@/lib/piano/constants";

const BLOCK = 88; // 块宽 72 + gap 16

export default function ScoreTrack({
  notes, current, wrongFlash, keyOfPos, posOfNote, onRestart, freeMode,
}: {
  notes: ScoreNote[];
  current: number;
  wrongFlash: number;
  keyOfPos: Record<number, string>;
  posOfNote: Record<string, number>;
  onRestart: () => void;
  freeMode?: boolean;
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

  // ★ 通关后自动从头开始（1.2 秒展示"通关"瞬间后重置，循环演奏）
  useEffect(() => {
    if (!finished || freeMode) return;
    const t = setTimeout(() => onRestart(), 1200);
    return () => clearTimeout(t);
  }, [finished, freeMode, onRestart]);

  const offset = wrapW / 2 - (current * BLOCK + 36);

  return (
    <>
      <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-white/[0.02]">
        {/* 中间指示框（自由模式淡化为装饰） */}
        <div className={`pointer-events-none absolute left-1/2 top-1/2 z-10 h-[88%] w-[80px] -translate-x-1/2 -translate-y-1/2 rounded-lg border-[3px] transition-all duration-300 ${
          freeMode ? "border-white/10 bg-transparent" : "border-cyan/80 bg-cyan/5"
        }`} />

        {/* 音符带（琴谱模式） */}
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
                  <span className={`text-xl font-black ${
                    isDone ? "text-lime" : isTarget && n.isRest ? "text-dim" : isTarget ? "text-cyan" : "text-mist/80"
                  }`}>
                    {n.isRest ? "♪" : n.label}
                  </span>
                  {!n.isRest && <span className="text-xs text-dim">{n.octave}</span>}
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

        {/* ★ 通关瞬间提示（轻量浮层，1.2 秒后自动重开消失） */}
        {finished && !freeMode && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-ink/60 backdrop-blur-[2px]">
            <p className="text-3xl font-black text-gradient">通关！</p>
          </div>
        )}

        {/* 自由模式：装饰性空格子 */}
        {freeMode && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 overflow-hidden px-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}
                className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center rounded-xl border-2 border-white/10 bg-white/[0.03] opacity-50">
                <span className="text-xl text-dim/30">♪</span>
              </div>
            ))}
            <p className="absolute inset-0 flex items-center justify-center bg-ink/40 text-base font-bold text-dim/70 backdrop-blur-[2px]">
              自由演奏模式 —— 尽情弹奏
            </p>
          </div>
        )}

        {/* 普通模式空琴谱 */}
        {!freeMode && notes.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-base text-dim/60">
            暂无琴谱 —— 打开设置导入
          </p>
        )}

        {/* 进度 */}
        {notes.length > 0 && !finished && !freeMode && (
          <p className="pointer-events-none absolute left-4 top-3 z-20 font-mono text-sm text-dim/60">
            {current} / {notes.length}
          </p>
        )}
      </div>
    </>
  );
}