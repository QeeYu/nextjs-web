// ====================================================================
// 音琴数据层：键位定义 / 频率计算 / 默认键位 / 音色表 / 示例琴谱 / 解析器
// ====================================================================

/** 12 半音音名（索引 = 相对 C 的半音数） */
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/** 白键唱名（黑键回退显示音名） */
export const SOLFEGE = ["Do", "", "Re", "", "Mi", "Fa", "", "Sol", "", "La", "", "Si"];

/** 频率计算：A4 = 440Hz 标准音，noteIdx 为相对 C 的半音数 */
export const freqOf = (noteIdx: number, octave: number) =>
  440 * Math.pow(2, octave - 4 + (noteIdx - 9) / 12);

/** 琴键定义：25 键 = 两个完整八度 + 顶端 C（C..B, C..B, C） */
export interface KeyDef {
  pos: number;      // 键位索引（0~24，绑定键盘用）
  isBlack: boolean; // 是否黑键
  noteIdx: number;  // 半音索引 0~11
  oct: number;      // 相对 baseOctave 的八度偏移（0 / 1 / 2 顶端C）
}

/** 生成 25 个琴键 */
export const KEYS: KeyDef[] = (() => {
  const arr: KeyDef[] = [];
  let pos = 0;
  for (let oct = 0; oct < 2; oct++) {
    for (let n = 0; n < 12; n++) {
      arr.push({ pos: pos++, isBlack: NOTE_NAMES[n].endsWith("#"), noteIdx: n, oct });
    }
  }
  arr.push({ pos: pos++, isBlack: false, noteIdx: 0, oct: 2 }); // 顶端 C
  return arr;
})();

/** 默认键盘映射：按键字符（小写）→ 键位索引（下排 Z 行低八度，上排 Q 行高八度） */
export const DEFAULT_KEYMAP: Record<string, number> = {
  z: 0, s: 1, x: 2, d: 3, c: 4, v: 5, g: 6, b: 7, h: 8, n: 9, j: 10, m: 11, // C4 ~ B4
  q: 12, "2": 13, w: 14, "3": 15, e: 16, r: 17, "5": 18, t: 19, "6": 20, y: 21, "7": 22, u: 23, i: 24, // C5 ~ C6
};

/** 音色列表（合成参数见 synth.ts） */
export interface TimbreInfo { id: string; name: string; desc: string; }
export const TIMBRE_LIST: TimbreInfo[] = [
  { id: "piano",     name: "钢琴",   desc: "清脆颗粒感，默认音色" },
  { id: "erhu",      name: "二胡",   desc: "揉弦滑韵，如泣如诉" },
  { id: "guitar",    name: "吉他",   desc: "拨弦木质，温暖明亮" },
  { id: "violin",    name: "小提琴", desc: "弓弦绵长，揉音悠扬" },
  { id: "guzheng",   name: "古筝",   desc: "清越泛音，一拨即散" },
  { id: "harmonica", name: "口琴",   desc: "簧片颤感，复古味道" },
  { id: "musicbox",  name: "八音盒", desc: "高泛音钟声，童话质感" },
];

/** 内置示例琴谱（可复制进导入框看格式） */
export const DEMO_SCORES = [
  { name: "小星星", text: "C4 C4 G4 G4 A4 A4 G4 - F4 F4 E4 E4 D4 D4 C4 -" },
  { name: "欢乐颂", text: "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 - D4 D4" },
  { name: "两只老虎", text: "C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4 - E4 F4 G4 -" },
  { name: "生日快乐", text: "G4 G4 A4 G4 C5 - B4 - G4 G4 A4 G4 D5 - C5 -" },
];

/** 琴谱音符（解析产物） */
export interface ScoreNote {
  name: string;    // 完整音名（如 "C4"）
  noteIdx: number; // 半音索引
  octave: number;  // 八度数字
  label: string;   // 显示用（唱名或音名）
}

/**
 * 解析琴谱文本：
 * - 以空白/逗号分隔
 * - 格式：音名 + 可选 # / b + 八度数字（如 C4、F#5、Bb4）
 * - "|" 仅作视觉小节线（忽略）；"-" 延音休止（跳过）
 * - 非法 token 自动忽略
 */
export function parseScore(text: string): ScoreNote[] {
  return text
    .split(/[\s,]+/)
    .filter((t) => t && t !== "|" && t !== "-")
    .map((t) => {
      const m = /^([A-Ga-g])([#b]?)(\d)$/.exec(t); // 匹配 音名 升降 八度
      if (!m) return null;
      const base = m[1].toUpperCase();
      let idx = NOTE_NAMES.indexOf(base as (typeof NOTE_NAMES)[number]);
      if (idx < 0) return null;
      if (m[2] === "#") idx += 1;
      if (m[2] === "b") idx -= 1;
      if (idx < 0 || idx > 11) return null; // 越界忽略
      const octave = parseInt(m[3], 10);
      const name = NOTE_NAMES[idx] + octave;
      const label = SOLFEGE[idx] || NOTE_NAMES[idx];
      return { name, noteIdx: idx, octave, label } as ScoreNote;
    })
    .filter((n): n is ScoreNote => n !== null);
}