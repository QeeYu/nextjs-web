"use client";

import { useState } from "react";
import { TIMBRE_LIST, DEMO_SCORES, KEY_COUNT_OPTIONS, keyDisplayName } from "@/lib/piano/constants";

export default function SettingsPanel({
  open, onClose, timbre, onTimbre, volume, onVolume,
  keyCount, onKeyCount,
  specialKeys, onSpecialKeys,
  onEnterRemapMode, onResetKeymap, onLoadScore,
}: {
  open: boolean;
  onClose: () => void;
  timbre: string;
  onTimbre: (id: string) => void;
  volume: number;
  onVolume: (v: number) => void;
  keyCount: number;
  onKeyCount: (c: number) => void;
  specialKeys: { up: string; down: string; sustain: string };
  onSpecialKeys: (k: Partial<{ up: string; down: string; sustain: string }>) => void;
  onEnterRemapMode: () => void;
  onResetKeymap: () => void;
  onLoadScore: (text: string) => void;
}) {
  const [importText, setImportText] = useState("");
  const [listeningKey, setListeningKey] = useState<"up" | "down" | "sustain" | null>(null);

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    if (!listeningKey) return;
    e.preventDefault();
    onSpecialKeys({ [listeningKey]: e.key });
    setListeningKey(null);
  };

  return (
    <div className={`fixed inset-0 z-[150] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <aside
        className={`absolute right-0 top-0 h-full w-[min(92vw,380px)] overflow-y-auto border-l border-white/10 bg-ink-2 p-5 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onKeyDown={handleKeyCapture}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-black text-gradient">音琴设置</h2>
          <button onClick={onClose} className="cursor-pointer rounded-full bg-white/10 px-3 py-1 text-sm text-dim hover:bg-white/20">
            ✕
          </button>
        </div>
        <p className="mb-5 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-dim">按 Esc 关闭设置</p>

        {/* ===== 音色 ===== */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">音色 · TIMBRE（9 种）</h3>
          <div className="grid grid-cols-2 gap-2">
            {TIMBRE_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => onTimbre(t.id)}
                className={`cursor-pointer rounded-xl border px-3 py-2 text-left transition-colors ${
                  timbre === t.id ? "border-cyan/60 bg-cyan/15" : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <p className={`text-sm font-bold ${timbre === t.id ? "text-cyan" : "text-mist"}`}>{t.name}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-dim">{t.desc}</p>
                <p className="mt-0.5 font-mono text-[9px] text-dim/50">{t.range}</p>
              </button>
            ))}
          </div>
          <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-dim/70">
            首次选择新音色时，采样会从 CDN 加载（几秒）。已加载的音色切换即时。
          </p>
        </section>

        {/* ===== 音量 ===== */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">音量 · VOLUME</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dim">静</span>
            <input type="range" min={0} max={100} value={Math.round(volume * 100)}
              onChange={(e) => onVolume(parseInt(e.target.value, 10) / 100)}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan" />
            <span className="text-xs text-dim">响</span>
          </div>
          <p className="mt-1 text-right font-mono text-[10px] text-cyan">{Math.round(volume * 100)}%</p>
        </section>

        {/* ===== 键盘范围 ===== */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">键盘范围 · KEY RANGE</h3>
          <div className="flex flex-col gap-2">
            {KEY_COUNT_OPTIONS.map((o) => (
              <button
                key={o.count}
                onClick={() => onKeyCount(o.count)}
                className={`cursor-pointer rounded-xl border px-4 py-2.5 text-left transition-colors ${
                  keyCount === o.count ? "border-cyan/60 bg-cyan/15" : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${keyCount === o.count ? "text-cyan" : "text-mist"}`}>{o.label}</span>
                  <span className="font-mono text-[10px] text-dim">{o.range}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-dim">{o.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ===== 快捷键（八度 + 延音踏板） ===== */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">快捷键 · SHORTCUTS</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-20 text-xs text-dim">升八度</span>
              <button onClick={() => setListeningKey("up")}
                className={`cursor-pointer rounded-lg border px-4 py-1.5 font-mono text-xs ${
                  listeningKey === "up" ? "animate-pulse border-cyan bg-cyan/15 text-cyan" : "border-white/15 bg-white/5 text-mist hover:bg-white/10"
                }`}>
                {listeningKey === "up" ? "按键..." : keyDisplayName(specialKeys.up)}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-xs text-dim">降八度</span>
              <button onClick={() => setListeningKey("down")}
                className={`cursor-pointer rounded-lg border px-4 py-1.5 font-mono text-xs ${
                  listeningKey === "down" ? "animate-pulse border-cyan bg-cyan/15 text-cyan" : "border-white/15 bg-white/5 text-mist hover:bg-white/10"
                }`}>
                {listeningKey === "down" ? "按键..." : keyDisplayName(specialKeys.down)}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-xs text-dim">延音踏板</span>
              <button onClick={() => setListeningKey("sustain")}
                className={`cursor-pointer rounded-lg border px-4 py-1.5 font-mono text-xs ${
                  listeningKey === "sustain" ? "animate-pulse border-pink bg-pink/15 text-pink" : "border-white/15 bg-white/5 text-mist hover:bg-white/10"
                }`}>
                {listeningKey === "sustain" ? "按键..." : keyDisplayName(specialKeys.sustain)}
              </button>
            </div>
            <p className="text-[11px] text-dim/60">点击按钮 → 按下想要的键 → 完成。默认 ↑ / ↓ / 空格</p>
          </div>
        </section>

        {/* ===== 琴键键位自定义 ===== */}
        <section className="mb-6">
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">琴键键位 · KEYMAP</h3>
          <div className="flex flex-col gap-2">
            <button onClick={onEnterRemapMode}
              className="cursor-pointer rounded-xl border border-pink/40 bg-pink/10 px-4 py-2.5 text-sm text-pink transition-colors hover:bg-pink/20">
              开启琴键键位自定义（点击后回到琴键操作）
            </button>
            <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-dim">
              流程：① 点此按钮（面板关闭）→ ② 点击琴键（粉色闪烁）→ ③ 按新键 → 完成
            </p>
            <button onClick={onResetKeymap}
              className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm text-dim hover:bg-white/10">
              恢复默认键位
            </button>
          </div>
        </section>

        {/* ===== 琴谱 ===== */}
        <section>
          <h3 className="mb-2 text-xs font-black tracking-widest text-dim">琴谱 · SCORE</h3>
          <p className="mb-1.5 text-[11px] text-dim/70">内置示例</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {DEMO_SCORES.map((s) => (
              <button key={s.name}
                onClick={() => { onLoadScore(s.text); setImportText(s.text); }}
                className="cursor-pointer rounded-full border border-cyan/30 px-3 py-1 text-xs text-cyan hover:bg-cyan/15">
                {s.name}
              </button>
            ))}
          </div>
          <p className="mb-1.5 text-[11px] text-dim/70">粘贴导入（C4 D4 E4；“-” 休止；“|” 小节线）</p>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
            rows={4} placeholder="C4 C4 G4 G4 A4 A4 G4 - ..."
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 p-3 font-mono text-xs text-mist outline-none placeholder:text-dim/40 focus:border-cyan/50" />
          <button onClick={() => onLoadScore(importText)} disabled={!importText.trim()}
            className="mt-2 w-full cursor-pointer rounded-xl border border-lime/40 bg-lime/10 px-4 py-2 text-sm text-lime hover:bg-lime/20 disabled:opacity-40">
            导入并开始
          </button>
        </section>
      </aside>
    </div>
  );
}