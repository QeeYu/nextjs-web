"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as Tone from "tone";
import {
  buildKeys, DEFAULT_KEYMAP, parseScore, TIMBRE_LIST, DEMO_SCORES,
  NOTE_NAMES, STORAGE_KEYS, freqOf, DEFAULT_SPECIAL_KEYS, KEY_COUNT_OPTIONS, keyDisplayName,
} from "@/lib/piano/constants";
import { engine } from "@/lib/piano/engine";
import PianoKeyboard from "./PianoKeyboard";
import FFTVisualizer from "./FFTVisualizer";
import ScoreTrack from "./ScoreTrack";
import SettingsPanel from "./SettingsPanel";

type Mode = "score" | "free";

export default function PianoPage() {
  // ===== 核心状态 =====
  const [timbre, setTimbre] = useState<string>("piano");
  const [volume, setVolume] = useState<number>(0.4); // ★ 默认音量 40%
  const [baseOctave, setBaseOctave] = useState<number>(3);
  const [keyCount, setKeyCount] = useState<number>(37);
  const [keymap, setKeymap] = useState<Record<string, number>>({ ...DEFAULT_KEYMAP });
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("score");
  const [specialKeys, setSpecialKeys] = useState({ ...DEFAULT_SPECIAL_KEYS });
  const [isPortrait, setIsPortrait] = useState(false);

  // ===== 延音踏板 =====
  const [sustainOn, setSustainOn] = useState(false);

  // ===== 设置面板 =====
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ===== 键位自定义 =====
  const [remapMode, setRemapMode] = useState(false);
  const [remapTarget, setRemapTarget] = useState<number | null>(null);
  const [remapHint, setRemapHint] = useState("");

  // ===== 琴谱 =====
  const [notes, setNotes] = useState(() => parseScore(DEMO_SCORES[0].text));
  const [current, setCurrent] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(0);

  // ===== 提示 =====
  const [audioReady, setAudioReady] = useState(false);
  const [loadingTimbre, setLoadingTimbre] = useState<string | null>(null);
  // ★ 加载完成提示（留存 3 秒）
  const [timbreReady, setTimbreReady] = useState<string | null>(null);
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keys = useMemo(() => buildKeys(baseOctave, keyCount), [baseOctave, keyCount]);

  // ===== 顶栏实测高度（用于精确补偿旋转偏移） =====
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(56);

  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        if (h > 0) setHeaderH(h);
      }
    };
    measureHeader();
    requestAnimationFrame(measureHeader);
    setTimeout(measureHeader, 200);
    setTimeout(measureHeader, 500);
  }, [audioReady, loadingTimbre, timbreReady]); // 提示条出现/消失时重测

  // ===== localStorage 恢复 =====
  useEffect(() => {
    try {
      const savedTimbre = localStorage.getItem(STORAGE_KEYS.timbre);
      if (savedTimbre && TIMBRE_LIST.some((t) => t.id === savedTimbre)) {
        setTimbre(savedTimbre);
        void engine.setTimbre(savedTimbre);
      }
      const savedVolume = localStorage.getItem(STORAGE_KEYS.volume);
      if (savedVolume !== null) {
        const v = parseFloat(savedVolume);
        setVolume(v);
        engine.setVolume(v);
      }
      const savedOctave = localStorage.getItem(STORAGE_KEYS.octave);
      if (savedOctave !== null) {
        const o = parseInt(savedOctave, 10);
        if (o >= 1 && o <= 5) setBaseOctave(o);
      }
      const savedKeyCount = localStorage.getItem(STORAGE_KEYS.keyCount);
      if (savedKeyCount !== null) {
        const c = parseInt(savedKeyCount, 10);
        if (KEY_COUNT_OPTIONS.some((o) => o.count === c)) setKeyCount(c);
      }
      const savedKeymap = localStorage.getItem(STORAGE_KEYS.keymap);
      if (savedKeymap) {
        try { setKeymap(JSON.parse(savedKeymap)); } catch {}
      }
      const savedMode = localStorage.getItem(STORAGE_KEYS.mode);
      if (savedMode === "free" || savedMode === "score") setMode(savedMode);
      const savedSpecialKeys = localStorage.getItem(STORAGE_KEYS.specialKeys);
      if (savedSpecialKeys) {
        try { setSpecialKeys(JSON.parse(savedSpecialKeys)); } catch {}
      }
    } catch {}
  }, []);

  // ===== 竖屏检测 =====
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ===== 延音踏板：自定义按键切换 =====
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === specialKeys.sustain && !e.repeat) {
        e.preventDefault();
        setSustainOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [specialKeys.sustain]);

  // ===== 延音状态同步到引擎 =====
  useEffect(() => {
    engine.setSustain(sustainOn);
  }, [sustainOn]);

  // ===== ★ 首次激活音频后，采样就绪提示（留存 3 秒） =====
  useEffect(() => {
    if (!audioReady || !engine.isTimbreLoaded(timbre)) return;
    const name = TIMBRE_LIST.find((t) => t.id === timbre)?.name ?? "";
    if (name) {
      setTimbreReady(name);
      if (readyTimer.current) clearTimeout(readyTimer.current);
      readyTimer.current = setTimeout(() => setTimbreReady(null), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioReady, timbre, loadingTimbre]);

  // ===== 清理就绪提示计时器 =====
  useEffect(() => {
    return () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
    };
  }, []);

  // ===== 音名换算 =====
  const nameOfPos = useCallback(
    (pos: number) => {
      const key = keys[pos];
      if (!key) return "";
      return `${NOTE_NAMES[key.noteIdx]}${key.octave}`;
    },
    [keys]
  );

  const posOfNote = useMemo(() => {
    const m: Record<string, number> = {};
    keys.forEach((k) => { m[`${NOTE_NAMES[k.noteIdx]}${k.octave}`] = k.pos; });
    return m;
  }, [keys]);

  const keyOfPos = useMemo(() => {
    const m: Record<number, string> = {};
    for (const [ch, pos] of Object.entries(keymap)) {
      if (m[pos] === undefined) m[pos] = ch;
    }
    return m;
  }, [keymap]);

  // ===== 按下琴键 =====
  const pressPos = useCallback(
    (pos: number) => {
      const key = keys[pos];
      if (!key) return;
      const name = `${NOTE_NAMES[key.noteIdx]}${key.octave}`;
      const freq = freqOf(key.noteIdx, key.octave);

      let isRestSkip = false;
      if (mode === "score" && current < notes.length) {
        const target = notes[current];
        if (target.isRest) {
          isRestSkip = true;
          setCurrent((c) => c + 1);
        }
      }

      if (!isRestSkip) {
        void engine.play(freq);
      }
      if (!audioReady) setAudioReady(true);

      setPressedKeys((prev) => new Set(prev).add(pos));
      setTimeout(() => {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(pos);
          return next;
        });
      }, 180);

      if (mode === "score" && !isRestSkip && current < notes.length) {
        const target = notes[current];
        if (name === target.name) {
          setCurrent((c) => c + 1);
        } else {
          setWrongFlash((w) => w + 1);
        }
      }
    },
    [keys, current, notes, mode, audioReady]
  );

  // ===== 休止符自动跳过 =====
  useEffect(() => {
    if (mode === "score" && current < notes.length && notes[current].isRest) {
      const t = setTimeout(() => setCurrent((c) => c + 1), 600);
      return () => clearTimeout(t);
    }
  }, [current, notes, mode]);

  // ===== 键盘监听 =====
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "Escape") {
        if (settingsOpen) { setSettingsOpen(false); return; }
        if (remapMode) {
          setRemapMode(false); setRemapTarget(null); setRemapHint("");
          return;
        }
        return;
      }

      if (e.key === specialKeys.up) {
        setBaseOctave((o) => Math.min(5, o + 1));
        return;
      }
      if (e.key === specialKeys.down) {
        setBaseOctave((o) => Math.max(1, o - 1));
        return;
      }

      if (remapMode && remapTarget !== null) {
        e.preventDefault();
        const ch = e.key;
        if (ch.length === 1) {
          setKeymap((km) => {
            const next = { ...km };
            for (const [k, p] of Object.entries(next)) {
              if (p === remapTarget) delete next[k];
            }
            delete next[ch];
            next[ch] = remapTarget;
            try { localStorage.setItem(STORAGE_KEYS.keymap, JSON.stringify(next)); } catch {}
            return next;
          });
          setRemapHint(`已绑定「${ch.toUpperCase()}」→ ${nameOfPos(remapTarget)}`);
          setTimeout(() => {
            setRemapTarget(null);
            setRemapHint("点击下一个琴键，或按 Esc 退出");
          }, 800);
        }
        return;
      }

      if (e.repeat) return;
      const pos = keymap[e.key] ?? keymap[e.key.toLowerCase()];
      if (pos === undefined || pos >= keys.length) return;
      e.preventDefault();
      pressPos(pos);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keymap, pressPos, remapMode, remapTarget, keys.length, nameOfPos, settingsOpen, specialKeys]);

  // ===== 设置变更 =====
  const changeTimbre = async (id: string) => {
    setTimbre(id);
    setTimbreReady(null); // 清掉上一次的就绪提示
    if (readyTimer.current) clearTimeout(readyTimer.current);

    // ★ 已加载过的音色 → 直接提示就绪（不显示"加载中"）
    if (engine.isTimbreLoaded(id)) {
      setLoadingTimbre(null);
      const name = TIMBRE_LIST.find((t) => t.id === id)?.name ?? "";
      setTimbreReady(name);
      readyTimer.current = setTimeout(() => setTimbreReady(null), 3000);
      try { localStorage.setItem(STORAGE_KEYS.timbre, id); } catch {}
      return;
    }

    // ★ 未加载 → 显示加载中 → 完成后显示就绪 3 秒
    setLoadingTimbre(id);
    await engine.setTimbre(id);
    setLoadingTimbre(null);
    const name = TIMBRE_LIST.find((t) => t.id === id)?.name ?? "";
    setTimbreReady(name);
    readyTimer.current = setTimeout(() => setTimbreReady(null), 3000);
    try { localStorage.setItem(STORAGE_KEYS.timbre, id); } catch {}
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    engine.setVolume(v);
    try { localStorage.setItem(STORAGE_KEYS.volume, String(v)); } catch {}
  };

  const changeOctave = (o: number) => {
    setBaseOctave(o);
    try { localStorage.setItem(STORAGE_KEYS.octave, String(o)); } catch {}
  };

  const changeKeyCount = (c: number) => {
    setKeyCount(c);
    try { localStorage.setItem(STORAGE_KEYS.keyCount, String(c)); } catch {}
  };

  const changeSpecialKeys = (k: Partial<typeof specialKeys>) => {
    const next = { ...specialKeys, ...k };
    setSpecialKeys(next);
    try { localStorage.setItem(STORAGE_KEYS.specialKeys, JSON.stringify(next)); } catch {}
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    try { localStorage.setItem(STORAGE_KEYS.mode, m); } catch {}
  };

  const resetKeymap = () => {
    setKeymap({ ...DEFAULT_KEYMAP });
    try { localStorage.removeItem(STORAGE_KEYS.keymap); } catch {}
  };

  const loadScore = (text: string) => {
    setNotes(parseScore(text));
    setCurrent(0);
    setWrongFlash(0);
    setSettingsOpen(false);
    changeMode("score");
  };

  const enterRemapMode = () => {
    setRemapMode(true);
    setRemapTarget(null);
    setRemapHint("点击要修改的琴键");
    setSettingsOpen(false);
  };

  const handleKeyboardDown = (pos: number) => {
    if (remapMode) {
      setRemapTarget(pos);
      setRemapHint("按下新的键盘按键绑定 · Esc 取消");
      return;
    }
    pressPos(pos);
  };

  const toggleSustain = () => setSustainOn((v) => !v);

  // ===== 延音踏板（公共渲染） =====
  const sustainPedal = (
    <button
      onPointerDown={(e) => { e.preventDefault(); toggleSustain(); }}
      aria-pressed={sustainOn}
      className={`relative flex w-[96px] flex-shrink-0 cursor-pointer touch-none select-none flex-col items-center justify-center gap-1.5 border-l-4 transition-all duration-150 md:w-[120px] ${
        sustainOn
          ? "border-l-cyan bg-linear-to-r from-neon/20 via-cyan/30 to-cyan/40 shadow-[inset_0_0_30px_rgba(56,225,255,0.45)]"
          : "border-l-white/25 bg-linear-to-r from-[#0a0b12] to-[#22242f] shadow-[inset_6px_0_20px_rgba(0,0,0,0.6)]"
      }`}
    >
      <div className={`pointer-events-none absolute inset-y-6 left-2.5 w-2 rounded-full transition-all duration-150 ${
        sustainOn ? "bg-cyan/70 blur-[2px]" : "bg-white/15 blur-[2px]"
      }`} />
      <div className={`pointer-events-none absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full transition-all duration-150 ${
        sustainOn ? "bg-cyan shadow-[0_0_14px_rgba(56,225,255,1)]" : "bg-white/20"
      }`} />
      <span className={`text-base font-black tracking-[0.35em] transition-colors md:text-lg ${
        sustainOn ? "text-cyan drop-shadow-[0_0_8px_rgba(56,225,255,0.8)]" : "text-dim"
      }`}
        style={{ writingMode: "vertical-rl" }}>
        延音踏板
      </span>
      <span className={`text-lg font-black transition-colors ${
        sustainOn ? "text-cyan drop-shadow-[0_0_6px_rgba(56,225,255,0.6)]" : "text-dim/60"
      }`}>
        {sustainOn ? "开" : "关"}
      </span>
      <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-mist/70">
        {keyDisplayName(specialKeys.sustain)}
      </span>
    </button>
  );

  return (
    <div className="relative flex h-[100svh] flex-col overflow-hidden bg-ink text-mist">
      {/* ===== 顶栏 ===== */}
      <header ref={headerRef} className="z-20 flex flex-shrink-0 items-center gap-2 border-b border-white/10 bg-ink px-3 py-2">
        <Link href="/" className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-dim transition-colors hover:border-cyan/50 hover:text-cyan">
          ← 返回
        </Link>
        <h1 className="text-base font-black text-gradient">QeeYu 音琴</h1>
        <div className="flex-1" />

        <div className="flex overflow-hidden rounded-full border border-white/15">
          <button onClick={() => changeMode("score")}
            className={`px-4 py-1.5 text-sm transition-colors ${mode === "score" ? "bg-cyan/20 text-cyan" : "text-dim hover:text-mist"}`}>
            琴谱
          </button>
          <button onClick={() => changeMode("free")}
            className={`px-4 py-1.5 text-sm transition-colors ${mode === "free" ? "bg-cyan/20 text-cyan" : "text-dim hover:text-mist"}`}>
            自由
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/15 px-1">
          <button onClick={() => changeOctave(Math.max(1, baseOctave - 1))}
            className="h-7 w-7 cursor-pointer rounded-full text-base text-mist hover:bg-white/10 disabled:opacity-30"
            disabled={baseOctave <= 1}>−</button>
          <span className="font-mono text-sm font-black text-cyan">C{baseOctave}</span>
          <button onClick={() => changeOctave(Math.min(5, baseOctave + 1))}
            className="h-7 w-7 cursor-pointer rounded-full text-base text-mist hover:bg-white/10 disabled:opacity-30"
            disabled={baseOctave >= 5}>＋</button>
        </div>

        <span className="hidden font-mono text-xs text-dim sm:block">{keyCount}键</span>
        <span className="hidden font-mono text-xs text-dim sm:block">
          {TIMBRE_LIST.find((t) => t.id === timbre)?.name}
        </span>

        <button onClick={() => setSettingsOpen(true)}
          className="cursor-pointer rounded-full border border-neon/40 px-5 py-1.5 text-sm text-neon transition-colors hover:bg-neon/15">
          设置
        </button>
      </header>

      {/* 音频激活提示 */}
      {!audioReady && (
        <div onClick={async () => { try { await Tone.start(); setAudioReady(true); } catch {} }}
          className="z-20 flex cursor-pointer items-center justify-center gap-2 bg-cyan/10 py-2 text-sm text-cyan">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan" />
          点击此处或任意琴键激活音频
        </div>
      )}

      {/* 采样加载中提示 */}
      {loadingTimbre && (
        <div className="z-20 flex items-center justify-center gap-2 bg-neon/10 py-2 text-sm text-neon">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-neon" />
          正在加载 {TIMBRE_LIST.find((t) => t.id === loadingTimbre)?.name} 采样...
        </div>
      )}

      {/* ★ 加载完成提示（留存 3 秒，绿色） */}
      {timbreReady && !loadingTimbre && (
        <div className="z-20 flex items-center justify-center gap-2 bg-lime/10 py-2 text-sm text-lime">
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          {timbreReady} 采样已就绪，可以开始演奏
        </div>
      )}

      {/* ===== 主区域（已验证的中心旋转方案 + 最终比例） ===== */}
      <div className="relative min-h-0 flex-1">
        <div
          className="flex flex-col"
          style={
            isPortrait
              ? {
                  width: "100vh",
                  height: "100vw",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, calc(-50% + ${headerH / 2}px)) rotate(-90deg)`,
                }
              : {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }
          }
        >
          {/* ★ 琴谱带 20%（自由模式显示空格子，保持布局不悬空） */}
          <div className="h-[20%] flex-shrink-0">
            <ScoreTrack
              notes={mode === "score" ? notes : []}
              current={current} wrongFlash={wrongFlash}
              keyOfPos={keyOfPos} posOfNote={posOfNote}
              onRestart={() => { setCurrent(0); setWrongFlash(0); }}
              freeMode={mode === "free"}
            />
          </div>

          {/* FFT 可视化 + 延音踏板 38% */}
          <div className="flex h-[38%] flex-shrink-0 border-t border-white/5">
            <div className="min-h-0 min-w-0 flex-1">
              <FFTVisualizer />
            </div>
            {sustainPedal}
          </div>

          {/* 琴键 42% */}
          <div className="h-[42%] flex-shrink-0 px-2 md:px-3">
            <PianoKeyboard
              keys={keys} pressedKeys={pressedKeys}
              remapTarget={remapTarget} keyOfPos={keyOfPos}
              onPointerDown={handleKeyboardDown}
            />
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        timbre={timbre} onTimbre={changeTimbre}
        volume={volume} onVolume={changeVolume}
        keyCount={keyCount} onKeyCount={changeKeyCount}
        specialKeys={specialKeys} onSpecialKeys={changeSpecialKeys}
        onEnterRemapMode={enterRemapMode} onResetKeymap={resetKeymap}
        onLoadScore={loadScore}
      />

      {/* 键位自定义提示 */}
      {remapMode && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[200] flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-pink/40 bg-ink-2/95 px-6 py-3 text-base text-pink shadow-2xl backdrop-blur-md">
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-pink" />
          <span className="font-bold">{remapHint || "点击要修改的琴键"}</span>
          <span className="text-sm text-dim">Esc 退出</span>
          <button onClick={() => { setRemapMode(false); setRemapTarget(null); setRemapHint(""); }}
            className="pointer-events-auto cursor-pointer rounded-full bg-pink/20 px-4 py-1.5 text-sm hover:bg-pink/40">
            退出自定义
          </button>
        </div>
      )}
    </div>
  );
}