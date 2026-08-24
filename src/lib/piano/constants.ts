// ====================================================================
// 音琴常量：音符 / 键位 / 9 种乐器（CDN）/ 键盘范围 / 琴谱 / 快捷键
// ====================================================================

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const SOLFEGE = ["Do", "", "Re", "", "Mi", "Fa", "", "Sol", "", "La", "", "Si"];

export const freqOf = (noteIdx: number, octave: number) =>
  440 * Math.pow(2, octave - 4 + (noteIdx - 9) / 12);

export interface KeyDef {
  pos: number;
  isBlack: boolean;
  noteIdx: number;
  octave: number;
}

export function buildKeys(baseOctave: number, count = 37): KeyDef[] {
  const octaves = Math.floor((count - 1) / 12);
  const arr: KeyDef[] = [];
  let pos = 0;
  for (let oct = 0; oct < octaves; oct++) {
    for (let n = 0; n < 12; n++) {
      arr.push({ pos: pos++, isBlack: NOTE_NAMES[n].endsWith("#"), noteIdx: n, octave: baseOctave + oct });
    }
  }
  const remain = count - arr.length;
  for (let n = 0; n < remain; n++) {
    arr.push({ pos: pos++, isBlack: NOTE_NAMES[n].endsWith("#"), noteIdx: n, octave: baseOctave + octaves });
  }
  return arr;
}

export const DEFAULT_KEYMAP: Record<string, number> = {
  z: 0, s: 1, x: 2, d: 3, c: 4, v: 5, g: 6, b: 7, h: 8, n: 9, j: 10, m: 11,
  q: 12, "2": 13, w: 14, "3": 15, e: 16, r: 17, "5": 18, t: 19, "6": 20, y: 21, "7": 22, u: 23, i: 24,
  "9": 25, o: 26, "0": 27, p: 28, "[": 29, "]": 30,
  "=": 31,
  Z: 1, X: 3, C: 5, V: 7, B: 9, N: 11,
  Q: 13, W: 15, E: 17, R: 19, T: 21, Y: 23,
  O: 26, P: 28,
};

// ====================================================================
// 9 种乐器（jsdelivr CDN 加载采样，无本地文件）
// ====================================================================
export interface TimbreInfo {
  id: string;
  name: string;
  desc: string;
  baseUrl: string;
  sampleUrls: Record<string, string>;
  range: string;
}

export const TIMBRE_LIST: TimbreInfo[] = [
  {
    id: "piano", name: "钢琴", desc: "全音域三角钢琴",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-piano-mp3@1.1.2/",
    range: "C1~C8",
    sampleUrls: {
      "A1": "A1.mp3", "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3", "A6": "A6.mp3", "A7": "A7.mp3",
      "A#1": "As1.mp3", "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3", "A#5": "As5.mp3", "A#6": "As6.mp3", "A#7": "As7.mp3",
      "B1": "B1.mp3", "B2": "B2.mp3", "B3": "B3.mp3", "B4": "B4.mp3", "B5": "B5.mp3", "B6": "B6.mp3", "B7": "B7.mp3",
      "C1": "C1.mp3", "C2": "C2.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3", "C8": "C8.mp3",
      "C#1": "Cs1.mp3", "C#2": "Cs2.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3", "C#6": "Cs6.mp3", "C#7": "Cs7.mp3",
      "D1": "D1.mp3", "D2": "D2.mp3", "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3", "D6": "D6.mp3", "D7": "D7.mp3",
      "D#1": "Ds1.mp3", "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3", "D#6": "Ds6.mp3", "D#7": "Ds7.mp3",
      "E1": "E1.mp3", "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3", "E5": "E5.mp3", "E6": "E6.mp3", "E7": "E7.mp3",
      "F1": "F1.mp3", "F2": "F2.mp3", "F3": "F3.mp3", "F4": "F4.mp3", "F5": "F5.mp3", "F6": "F6.mp3", "F7": "F7.mp3",
      "F#1": "Fs1.mp3", "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3", "F#6": "Fs6.mp3", "F#7": "Fs7.mp3",
      "G1": "G1.mp3", "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3", "G5": "G5.mp3", "G6": "G6.mp3", "G7": "G7.mp3",
      "G#1": "Gs1.mp3", "G#2": "Gs2.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3", "G#5": "Gs5.mp3", "G#6": "Gs6.mp3", "G#7": "Gs7.mp3",
    },
  },
  {
    id: "guitar-acoustic", name: "木吉他", desc: "民谣吉他拨弦",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic-mp3@1.1.2/",
    range: "D2~C5",
    sampleUrls: {
      "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3",
      "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3",
      "D2": "D2.mp3", "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3",
      "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3",
      "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3",
      "F2": "F2.mp3", "F3": "F3.mp3", "F4": "F4.mp3",
      "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3",
      "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3",
      "G#2": "Gs2.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3",
      "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3",
      "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3",
      "B2": "B2.mp3", "B3": "B3.mp3", "B4": "B4.mp3",
    },
  },
  {
    id: "bass-electric", name: "电贝司", desc: "现代低音",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-bass-electric-mp3@1.1.2/",
    range: "E1~A#4",
    sampleUrls: {
      "A#1": "As1.mp3", "A#2": "As2.mp3", "A#3": "As3.mp3", "A#4": "As4.mp3",
      "C#1": "Cs1.mp3", "C#2": "Cs2.mp3", "C#3": "Cs3.mp3", "C#4": "Cs4.mp3",
      "E1": "E1.mp3", "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3",
      "G1": "G1.mp3", "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3",
    },
  },
  {
    id: "violin", name: "小提琴", desc: "弓弦揉音悠扬",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/",
    range: "A3~C7",
    sampleUrls: {
      "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3", "A6": "A6.mp3",
      "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3",
      "E4": "E4.mp3", "E5": "E5.mp3", "E6": "E6.mp3",
      "G4": "G4.mp3", "G5": "G5.mp3", "G6": "G6.mp3",
    },
  },
  {
    id: "cello", name: "大提琴", desc: "低沉温暖弦乐",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-cello-mp3@1.1.1/",
    range: "C2~C5",
    sampleUrls: {
      "C2": "C2.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3",
      "C#3": "Cs3.mp3", "C#4": "Cs4.mp3",
      "D2": "D2.mp3", "D3": "D3.mp3", "D4": "D4.mp3",
      "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3",
      "E2": "E2.mp3", "E3": "E3.mp3", "E4": "E4.mp3",
      "F2": "F2.mp3", "F3": "F3.mp3", "F4": "F4.mp3",
      "F#3": "Fs3.mp3", "F#4": "Fs4.mp3",
      "G2": "G2.mp3", "G3": "G3.mp3", "G4": "G4.mp3",
      "G#2": "Gs2.mp3", "G#3": "Gs3.mp3", "G#4": "Gs4.mp3",
      "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3",
      "A#2": "As2.mp3", "A#3": "As3.mp3",
      "B2": "B2.mp3", "B3": "B3.mp3", "B4": "B4.mp3",
    },
  },
  {
    id: "harp", name: "竖琴", desc: "清越拨弦",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-harp-mp3@1.1.1/",
    range: "E1~D7",
    sampleUrls: {
      "A2": "A2.mp3", "A4": "A4.mp3", "A6": "A6.mp3",
      "B1": "B1.mp3", "B3": "B3.mp3", "B5": "B5.mp3", "B6": "B6.mp3",
      "C3": "C3.mp3", "C5": "C5.mp3",
      "D2": "D2.mp3", "D4": "D4.mp3", "D6": "D6.mp3", "D7": "D7.mp3",
      "E1": "E1.mp3", "E3": "E3.mp3", "E5": "E5.mp3",
      "F2": "F2.mp3", "F4": "F4.mp3", "F6": "F6.mp3", "F7": "F7.mp3",
      "G1": "G1.mp3", "G3": "G3.mp3", "G5": "G5.mp3",
    },
  },
  {
    id: "saxophone", name: "萨克斯", desc: "爵士风味",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-saxophone-mp3@1.1.2/",
    range: "C#3~F#5",
    sampleUrls: {
      "A4": "A4.mp3", "A5": "A5.mp3",
      "A#3": "As3.mp3", "A#4": "As4.mp3",
      "B3": "B3.mp3", "B4": "B4.mp3",
      "C4": "C4.mp3", "C5": "C5.mp3",
      "C#3": "Cs3.mp3", "C#4": "Cs4.mp3", "C#5": "Cs5.mp3",
      "D3": "D3.mp3", "D4": "D4.mp3", "D5": "D5.mp3",
      "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3",
      "E3": "E3.mp3", "E4": "E4.mp3", "E5": "E5.mp3",
      "F3": "F3.mp3", "F4": "F4.mp3", "F5": "F5.mp3",
      "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3",
      "G3": "G3.mp3", "G4": "G4.mp3", "G5": "G5.mp3",
      "G#3": "Gs3.mp3", "G#4": "Gs4.mp3", "G#5": "Gs5.mp3",
    },
  },
  {
    id: "xylophone", name: "木琴", desc: "清脆打击",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-xylophone-mp3@1.1.2/",
    range: "G4~C8",
    sampleUrls: {
      "C5": "C5.mp3", "C6": "C6.mp3", "C7": "C7.mp3", "C8": "C8.mp3",
      "G4": "G4.mp3", "G5": "G5.mp3", "G6": "G6.mp3", "G7": "G7.mp3",
    },
  },
  {
    id: "organ", name: "管风琴", desc: "教堂管风琴",
    baseUrl: "https://cdn.jsdelivr.net/npm/tonejs-instrument-organ-mp3@1.1.1/",
    range: "C1~C6",
    sampleUrls: {
      "A1": "A1.mp3", "A2": "A2.mp3", "A3": "A3.mp3", "A4": "A4.mp3", "A5": "A5.mp3",
      "C1": "C1.mp3", "C2": "C2.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3",
      "D#1": "Ds1.mp3", "D#2": "Ds2.mp3", "D#3": "Ds3.mp3", "D#4": "Ds4.mp3", "D#5": "Ds5.mp3",
      "F#1": "Fs1.mp3", "F#2": "Fs2.mp3", "F#3": "Fs3.mp3", "F#4": "Fs4.mp3", "F#5": "Fs5.mp3",
    },
  },
];

/** 键盘范围选项 */
export const KEY_COUNT_OPTIONS = [
  { count: 25, label: "25 键", range: "2 个八度", desc: "窄键盘，适合手机" },
  { count: 37, label: "37 键", range: "3 个八度", desc: "标准键盘（默认）" },
  { count: 49, label: "49 键", range: "4 个八度", desc: "宽键盘，适合桌面" },
];

export const DEMO_SCORES = [
  { name: "小星星", text: "C4 C4 G4 G4 A4 A4 G4 - F4 F4 E4 E4 D4 D4 C4 -" },
  { name: "欢乐颂", text: "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 - D4 D4" },
  { name: "两只老虎", text: "C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4 - E4 F4 G4 -" },
  { name: "生日快乐", text: "G4 G4 A4 G4 C5 - B4 - G4 G4 A4 G4 D5 - C5 -" },
  { name: "天空之城", text: "A4 - E5 - D5 C5 B4 - A4 B4 C5 B4 C5 A4 - G4 -" },
];

export interface ScoreNote {
  name: string;
  noteIdx: number;
  octave: number;
  label: string;
  isRest?: boolean;
}

export function parseScore(text: string): ScoreNote[] {
  return text
    .split(/[\s,]+/)
    .filter((t) => t && t !== "|")
    .map((t) => {
      if (t === "-") {
        return { name: "-", noteIdx: -1, octave: 0, label: "♪", isRest: true } as ScoreNote;
      }
      const m = /^([A-Ga-g])([#b]?)(\d)$/.exec(t);
      if (!m) return null;
      const base = m[1].toUpperCase();
      let idx = NOTE_NAMES.indexOf(base as (typeof NOTE_NAMES)[number]);
      if (idx < 0) return null;
      if (m[2] === "#") idx += 1;
      if (m[2] === "b") idx -= 1;
      if (idx < 0 || idx > 11) return null;
      const octave = parseInt(m[3], 10);
      const name = NOTE_NAMES[idx] + octave;
      const label = SOLFEGE[idx] || NOTE_NAMES[idx];
      return { name, noteIdx: idx, octave, label } as ScoreNote;
    })
    .filter((n): n is ScoreNote => n !== null);
}

export const STORAGE_KEYS = {
  timbre: "piano-timbre",
  volume: "piano-volume",
  octave: "piano-octave",
  keymap: "piano-keymap",
  mode: "piano-mode",
  specialKeys: "piano-special-keys",
  keyCount: "piano-key-count",
} as const;

/** ★ 特殊按键默认值（八度 + 延音踏板） */
export const DEFAULT_SPECIAL_KEYS = {
  up: "ArrowUp",     // 升八度
  down: "ArrowDown", // 降八度
  sustain: " ",      // 延音踏板（默认空格）
};

/** 显示按键名（空格显示「空格」） */
export const keyDisplayName = (key: string) =>
  key === " " ? "空格" : key === "ArrowUp" ? "↑" : key === "ArrowDown" ? "↓" : key;