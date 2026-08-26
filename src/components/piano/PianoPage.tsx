/**
 * 音琴主页面
 * - 优化键盘映射：保留原逻辑，补全缺失按键，覆盖 25/37/49 键
 * - 加载进度条 + CDN 预连接
 * - ★ 自动激活音频 + 自动加载音色（无需用户点击）
 * - ★ 已移除"点击激活音频"提示
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as Tone from "tone";
import anime from "@/lib/anime";
import {
  buildKeys,
  DEFAULT_KEYMAP,
  parseScore,
  TIMBRE_LIST,
  DEMO_SCORES,
  NOTE_NAMES,
  STORAGE_KEYS,
  freqOf,
  DEFAULT_SPECIAL_KEYS,
  KEY_COUNT_OPTIONS,
  keyDisplayName,
} from "@/lib/piano/constants";
import { engine } from "@/lib/piano/engine";
import PianoKeyboard from "./PianoKeyboard";
import FFTVisualizer from "./FFTVisualizer";
import ScoreTrack from "./ScoreTrack";
import SettingsPanel from "./SettingsPanel";

type Mode = "score" | "free";

/**
 * 生成完整键盘映射（保留原 DEFAULT_KEYMAP 风格，补全缺失按键）
 */
function generateFullKeymap(keyCount: number, userMap: Record<string, number> = {}): Record<string, number> {
  const baseMap = { ...DEFAULT_KEYMAP };

  const extendedKeys = [
    "a", "4", "8", "-", "\\",
    "1", "3", "5", "6", "7", "8", "9", "0", "=",
    ";", "'", ",", ".", "/",
  ];

  const result: Record<string, number> = { ...baseMap, ...userMap };
  const assignedPositions = new Set(Object.values(result));
  let nextKeyIndex = 0;

  for (let pos = 0; pos < keyCount; pos++) {
    if (!assignedPositions.has(pos)) {
      while (nextKeyIndex < extendedKeys.length && result[extendedKeys[nextKeyIndex]] !== undefined) {
        nextKeyIndex++;
      }
      if (nextKeyIndex < extendedKeys.length) {
        const key = extendedKeys[nextKeyIndex];
        result[key] = pos;
        nextKeyIndex++;
      } else {
        result[`key_${pos}`] = pos;
      }
    }
  }

  return result;
}

export default function PianoPage() {
  // ---- 核心状态 ----
  const [timbre, setTimbre] = useState<string>("piano");
  const [volume, setVolume] = useState<number>(0.4);
  const [baseOctave, setBaseOctave] = useState<number>(3);
  const [keyCount, setKeyCount] = useState<number>(37);
  const [customKeymap, setCustomKeymap] = useState<Record<string, number>>({});
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("score");
  const [specialKeys, setSpecialKeys] = useState({ ...DEFAULT_SPECIAL_KEYS });
  const [isPortrait, setIsPortrait] = useState(false);
  const [sustainOn, setSustainOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [remapMode, setRemapMode] = useState(false);
  const [remapTarget, setRemapTarget] = useState<number | null>(null);
  const [remapHint, setRemapHint] = useState("");
  const [notes, setNotes] = useState(() => parseScore(DEMO_SCORES[0].text));
  const [current, setCurrent] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(0);
  const [loadingTimbre, setLoadingTimbre] = useState<string | null>(null);
  const [timbreReady, setTimbreReady] = useState<string | null>(null);
  const [timbreFailed, setTimbreFailed] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  // ★ 标记是否已完成初始加载
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(56);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // ★ 标记是否已尝试过自动激活音频
  const autoActivateAttempted = useRef(false);

  const keys = useMemo(() => buildKeys(baseOctave, keyCount), [baseOctave, keyCount]);

  const keymap = useMemo(() => {
    let savedCustom: Record<string, number> = {};
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.keymap);
      if (saved) savedCustom = JSON.parse(saved);
    } catch {}
    return generateFullKeymap(keyCount, savedCustom);
  }, [keyCount]);

  // ---- 顶栏高度测量 ----
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
  }, []);

  // ---- 竖屏检测 ----
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ---- 延音踏板键盘事件 ----
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

  // ---- 延音同步引擎 ----
  useEffect(() => {
    engine.setSustain(sustainOn);
  }, [sustainOn]);

  // ============================================================
  // ★★★ 自动激活音频 + 自动加载音色（无需用户点击）★★★
  // ============================================================

  /**
   * ★ 自动激活音频并加载音色
   * 页面加载后自动执行，无需用户交互
   */
  useEffect(() => {
    // 防止重复执行
    if (autoActivateAttempted.current) return;
    autoActivateAttempted.current = true;

    // 延迟一小段时间，确保 DOM 完全渲染
    const timer = setTimeout(async () => {
      try {
        // 尝试激活 AudioContext（如果被浏览器拦截，会静默失败）
        await Tone.start();
        console.log("[Piano] ✅ 音频自动激活成功");
      } catch (e) {
        console.log("[Piano] ⚠️ 音频自动激活被浏览器拦截，等待用户交互");
      }

      // ★ 无论音频是否激活成功，都开始加载音色
      // （Tone.Sampler 加载不依赖 AudioContext 状态）
      const savedTimbre = localStorage.getItem(STORAGE_KEYS.timbre);
      const targetTimbre = savedTimbre && TIMBRE_LIST.some((t) => t.id === savedTimbre)
        ? savedTimbre
        : "piano";

      if (targetTimbre !== timbre) {
        setTimbre(targetTimbre);
      }

      // 开始加载音色
      await loadTimbreWithProgress(targetTimbre);

      // 标记初始加载完成
      setInitialLoadDone(true);

      // 再次尝试激活音频（可能之前被拦截，现在用户可能已有交互）
      try {
        if (Tone.getContext().state !== "running") {
          await Tone.start();
        }
      } catch {}
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ★ 当 timbre 变化时自动加载音色（仅当初始加载已完成）
   */
  useEffect(() => {
    if (initialLoadDone) {
      void loadTimbreWithProgress(timbre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timbre]);

  // ---- 音色就绪通知动画 ----
  useEffect(() => {
    if (timbreReady && notifyRef.current) {
      anime.remove(notifyRef.current);
      anime({
        targets: notifyRef.current,
        translateY: [-24, 0],
        opacity: [0, 1],
        duration: 450,
        easing: "easeOutBack",
      });
    }
  }, [timbreReady]);

  useEffect(() => {
    return () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  // ---- localStorage 恢复（只恢复状态，不加载音色） ----
  useEffect(() => {
    try {
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
      const savedMode = localStorage.getItem(STORAGE_KEYS.mode);
      if (savedMode === "free" || savedMode === "score") setMode(savedMode);
      const savedSpecialKeys = localStorage.getItem(STORAGE_KEYS.specialKeys);
      if (savedSpecialKeys) {
        try {
          setSpecialKeys(JSON.parse(savedSpecialKeys));
        } catch {}
      }
    } catch {}
  }, []);

  // ---- 音名换算 ----
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
    keys.forEach((k) => {
      m[`${NOTE_NAMES[k.noteIdx]}${k.octave}`] = k.pos;
    });
    return m;
  }, [keys]);

  const keyOfPos = useMemo(() => {
    const m: Record<number, string> = {};
    for (const [ch, pos] of Object.entries(keymap)) {
      if (m[pos] === undefined) m[pos] = ch;
    }
    return m;
  }, [keymap]);

  // ---- 按下琴键 ----
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
        // ★ 播放前确保音频已激活
        const ensureAudio = async () => {
          if (Tone.getContext().state !== "running") {
            try { await Tone.start(); } catch {}
          }
        };
        ensureAudio();
        void engine.play(freq);
      }

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
    [keys, current, notes, mode]
  );

  // ---- 休止符自动跳过 ----
  useEffect(() => {
    if (mode === "score" && current < notes.length && notes[current].isRest) {
      const t = setTimeout(() => setCurrent((c) => c + 1), 400);
      return () => clearTimeout(t);
    }
  }, [current, notes, mode]);

  // ---- 键盘监听 ----
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "Escape") {
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (remapMode) {
          setRemapMode(false);
          setRemapTarget(null);
          setRemapHint("");
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
          const newMap = { ...keymap };
          for (const [k, p] of Object.entries(newMap)) {
            if (p === remapTarget) delete newMap[k];
          }
          delete newMap[ch];
          newMap[ch] = remapTarget;
          try {
            localStorage.setItem(STORAGE_KEYS.keymap, JSON.stringify(newMap));
          } catch {}
          setCustomKeymap(newMap);
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

  // ============================================================
  // ★★★ 核心函数：加载音色（带进度条）★★★
  // ============================================================

  const loadTimbreWithProgress = useCallback(
    async (id: string) => {
      // 先更新引擎的当前音色
      await engine.setTimbre(id);

      // 检查是否已加载
      if (engine.isTimbreLoaded(id)) {
        setLoadProgress(100);
        const name = TIMBRE_LIST.find((t) => t.id === id)?.name ?? "";
        setTimbreReady(name);
        if (readyTimer.current) clearTimeout(readyTimer.current);
        readyTimer.current = setTimeout(() => setTimbreReady(null), 3000);
        setLoadingTimbre(null);
        return;
      }

      // 未加载 → 显示进度条
      setLoadingTimbre(id);
      setLoadProgress(0);
      setTimbreReady(null);
      setTimbreFailed(null);

      if (progressTimer.current) clearInterval(progressTimer.current);
      progressTimer.current = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev < 90) {
            return Math.min(90, prev + 1 + Math.random() * 3);
          }
          return prev;
        });
      }, 300);

      // 轮询等待加载完成
      const startTime = Date.now();
      await new Promise<void>((resolve) => {
        const check = () => {
          if (engine.isTimbreLoaded(id)) {
            resolve();
            return;
          }
          if (engine.getTimbreState(id) === "timeout") {
            resolve();
            return;
          }
          if (Date.now() - startTime > 46000) {
            resolve();
            return;
          }
          setTimeout(check, 300);
        };
        check();
      });

      setLoadingTimbre(null);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }

      if (!engine.isTimbreLoaded(id)) {
        const name = TIMBRE_LIST.find((t) => t.id === id)?.name ?? id;
        setTimbreFailed(name);
        setLoadProgress(0);
        setTimeout(() => setTimbreFailed(null), 5000);
        return;
      }

      setLoadProgress(100);
      const name = TIMBRE_LIST.find((t) => t.id === id)?.name ?? "";
      setTimbreReady(name);
      if (readyTimer.current) clearTimeout(readyTimer.current);
      readyTimer.current = setTimeout(() => setTimbreReady(null), 3000);
      try {
        localStorage.setItem(STORAGE_KEYS.timbre, id);
      } catch {}
    },
    []
  );

  // ---- 切换音色 ----
  const changeTimbre = useCallback(
    async (id: string) => {
      setTimbre(id);
      await loadTimbreWithProgress(id);
    },
    [loadTimbreWithProgress]
  );

  // ---- 其他设置函数 ----
  const changeVolume = (v: number) => {
    setVolume(v);
    engine.setVolume(v);
    try {
      localStorage.setItem(STORAGE_KEYS.volume, String(v));
    } catch {}
  };

  const changeOctave = (o: number) => {
    setBaseOctave(o);
    try {
      localStorage.setItem(STORAGE_KEYS.octave, String(o));
    } catch {}
  };

  const changeKeyCount = (c: number) => {
    setKeyCount(c);
    try {
      localStorage.removeItem(STORAGE_KEYS.keymap);
    } catch {}
    setCustomKeymap({});
    try {
      localStorage.setItem(STORAGE_KEYS.keyCount, String(c));
    } catch {}
  };

  const changeSpecialKeys = (k: Partial<typeof specialKeys>) => {
    const next = { ...specialKeys, ...k };
    setSpecialKeys(next);
    try {
      localStorage.setItem(STORAGE_KEYS.specialKeys, JSON.stringify(next));
    } catch {}
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem(STORAGE_KEYS.mode, m);
    } catch {}
  };

  const resetKeymap = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.keymap);
    } catch {}
    setCustomKeymap({});
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

  // ---- 延音踏板 UI ----
  const sustainPedal = (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        toggleSustain();
      }}
      aria-pressed={sustainOn}
      className={`relative flex w-[60px] flex-shrink-0 cursor-pointer touch-none select-none flex-col items-center justify-center gap-1 border-l-[3px] transition-all duration-150 sm:w-[80px] sm:gap-1.5 sm:border-l-4 md:w-[110px] ${
        sustainOn
          ? "border-l-cyan bg-linear-to-r from-neon/20 via-cyan/30 to-cyan/40 shadow-[inset_0_0_30px_rgba(56,225,255,0.45)]"
          : "border-l-white/25 bg-linear-to-r from-[#0a0b12] to-[#22242f] shadow-[inset_6px_0_20px_rgba(0,0,0,0.6)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-y-4 left-1.5 w-1.5 rounded-full transition-all duration-150 sm:inset-y-6 sm:left-2.5 sm:w-2 ${
          sustainOn ? "bg-cyan/70 blur-[2px]" : "bg-white/15 blur-[2px]"
        }`}
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full transition-all duration-150 sm:top-3 sm:h-3.5 sm:w-3.5 ${
          sustainOn ? "bg-cyan shadow-[0_0_14px_rgba(56,225,255,1)]" : "bg-white/20"
        }`}
      />
      <span
        className={`text-xs font-black tracking-[0.25em] transition-colors sm:text-sm sm:tracking-[0.35em] md:text-lg ${
          sustainOn ? "text-cyan drop-shadow-[0_0_8px_rgba(56,225,255,0.8)]" : "text-dim"
        }`}
        style={{ writingMode: "vertical-rl" }}
      >
        延音踏板
      </span>
      <span
        className={`hidden text-lg font-black transition-colors sm:block ${
          sustainOn ? "text-cyan drop-shadow-[0_0_6px_rgba(56,225,255,0.6)]" : "text-dim/60"
        }`}
      >
        {sustainOn ? "开" : "关"}
      </span>
      <span className={`block h-2 w-2 rounded-full transition-colors sm:hidden ${sustainOn ? "bg-cyan" : "bg-white/20"}`} />
      <span className="hidden rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-mist/70 sm:block sm:px-2 sm:text-xs">
        {keyDisplayName(specialKeys.sustain)}
      </span>
    </button>
  );

  // ---- 渲染 ----
  return (
    <div className="relative flex h-[100svh] flex-col overflow-hidden bg-ink text-mist">
      {/* 顶栏 */}
      <header
        ref={headerRef}
        className="z-20 flex flex-shrink-0 items-center gap-1.5 overflow-x-auto border-b border-white/10 bg-ink px-2 py-2 sm:gap-2 sm:px-3"
      >
        <Link
          href="/"
          className="flex-shrink-0 rounded-full border border-white/15 px-2.5 py-1.5 text-xs text-dim transition-colors hover:border-cyan/50 hover:text-cyan sm:px-3 sm:text-sm"
        >
          ← 返回
        </Link>
        <h1 className="hidden flex-shrink-0 text-base font-black text-gradient sm:block">QeeYu 音琴</h1>
        <span className="flex-shrink-0 text-sm font-black text-gradient sm:hidden">音琴</span>
        <div className="flex-1" />

        <div className="flex flex-shrink-0 overflow-hidden rounded-full border border-white/15">
          <button
            onClick={() => changeMode("score")}
            className={`px-2.5 py-1.5 text-xs transition-colors sm:px-4 sm:text-sm ${
              mode === "score" ? "bg-cyan/20 text-cyan" : "text-dim hover:text-mist"
            }`}
          >
            琴谱
          </button>
          <button
            onClick={() => changeMode("free")}
            className={`px-2.5 py-1.5 text-xs transition-colors sm:px-4 sm:text-sm ${
              mode === "free" ? "bg-cyan/20 text-cyan" : "text-dim hover:text-mist"
            }`}
          >
            自由
          </button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-0.5 rounded-full border border-white/15 px-0.5 sm:gap-1 sm:px-1">
          <button
            onClick={() => changeOctave(Math.max(1, baseOctave - 1))}
            className="h-6 w-6 cursor-pointer rounded-full text-sm text-mist hover:bg-white/10 disabled:opacity-30 sm:h-7 sm:w-7 sm:text-base"
            disabled={baseOctave <= 1}
          >
            −
          </button>
          <span className="flex-shrink-0 font-mono text-xs font-black text-cyan sm:text-sm">C{baseOctave}</span>
          <button
            onClick={() => changeOctave(Math.min(5, baseOctave + 1))}
            className="h-6 w-6 cursor-pointer rounded-full text-sm text-mist hover:bg-white/10 disabled:opacity-30 sm:h-7 sm:w-7 sm:text-base"
            disabled={baseOctave >= 5}
          >
            ＋
          </button>
        </div>

        <span className="hidden flex-shrink-0 font-mono text-xs text-dim md:block">{keyCount}键</span>
        <span className="hidden flex-shrink-0 font-mono text-xs text-dim md:block xl:block">
          {TIMBRE_LIST.find((t) => t.id === timbre)?.name}
        </span>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex-shrink-0 cursor-pointer rounded-full border border-neon/40 px-3 py-1.5 text-xs text-neon transition-colors hover:bg-neon/15 sm:px-5 sm:text-sm"
        >
          设置
        </button>
      </header>

      {/* ★★★ 已移除音频激活提示 ★★★ */}

      {/* 加载进度条 */}
      {loadingTimbre && (
        <div className="fixed left-1/2 top-16 z-[299] w-[min(400px,80vw)] -translate-x-1/2 rounded-xl border border-neon/30 bg-ink-2/95 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-neon">
            <span>正在加载 {TIMBRE_LIST.find((t) => t.id === loadingTimbre)?.name} 采样...</span>
            <span className="font-mono">{Math.round(loadProgress)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-neon to-cyan transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 悬浮通知 */}
      {(timbreReady || timbreFailed) && (
        <div
          ref={notifyRef}
          className={`fixed left-1/2 top-16 z-[300] -translate-x-1/2 rounded-2xl border px-5 py-2.5 text-sm shadow-2xl backdrop-blur-md ${
            timbreFailed
              ? "border-pink/50 bg-ink-2/95"
              : "border-lime/40 bg-ink-2/90"
          }`}
        >
          {timbreFailed ? (
            <button
              onClick={() => {
                setTimbreFailed(null);
                void changeTimbre(timbre);
              }}
              className="flex cursor-pointer items-center gap-3 text-pink"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-pink" />
              <span className="font-bold">{timbreFailed} 加载超时（CDN 响应慢）</span>
              <span className="rounded-full bg-pink/20 px-3 py-1 text-xs font-bold text-pink transition-colors hover:bg-pink/40">
                点击重试
              </span>
            </button>
          ) : (
            <span className="flex items-center gap-2 text-lime">
              <span className="h-2.5 w-2.5 rounded-full bg-lime" />
              {timbreReady} 采样已就绪，可以开始演奏
            </span>
          )}
        </div>
      )}

      {/* 主区域 */}
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
          {/* 琴谱带 20% */}
          <div className="h-[20%] flex-shrink-0">
            <ScoreTrack
              notes={mode === "score" ? notes : []}
              current={current}
              wrongFlash={wrongFlash}
              keyOfPos={keyOfPos}
              posOfNote={posOfNote}
              onRestart={() => {
                setCurrent(0);
                setWrongFlash(0);
              }}
              freeMode={mode === "free"}
            />
          </div>

          {/* FFT + 踏板 38% */}
          <div className="flex h-[38%] flex-shrink-0 border-t border-white/5">
            <div className="min-h-0 min-w-0 flex-1">
              <FFTVisualizer />
            </div>
            {sustainPedal}
          </div>

          {/* 琴键 42% */}
          <div className="h-[42%] flex-shrink-0 px-2 md:px-3">
            <PianoKeyboard
              keys={keys}
              pressedKeys={pressedKeys}
              remapTarget={remapTarget}
              keyOfPos={keyOfPos}
              onPointerDown={handleKeyboardDown}
            />
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        timbre={timbre}
        onTimbre={changeTimbre}
        volume={volume}
        onVolume={changeVolume}
        keyCount={keyCount}
        onKeyCount={changeKeyCount}
        specialKeys={specialKeys}
        onSpecialKeys={changeSpecialKeys}
        onEnterRemapMode={enterRemapMode}
        onResetKeymap={resetKeymap}
        onLoadScore={loadScore}
      />

      {/* 键位自定义提示 */}
      {remapMode && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-[200] flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-pink/40 bg-ink-2/95 px-6 py-3 text-base text-pink shadow-2xl backdrop-blur-md">
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-pink" />
          <span className="font-bold">{remapHint || "点击要修改的琴键"}</span>
          <span className="text-sm text-dim">Esc 退出</span>
          <button
            onClick={() => {
              setRemapMode(false);
              setRemapTarget(null);
              setRemapHint("");
            }}
            className="pointer-events-auto cursor-pointer rounded-full bg-pink/20 px-4 py-1.5 text-sm hover:bg-pink/40"
          >
            退出自定义
          </button>
        </div>
      )}
    </div>
  );
}