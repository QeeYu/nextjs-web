// ====================================================================
// 全站静态数据：改文案 / 链接 / 数据，只需要改这一个文件
// ====================================================================

// —— 个人信息 ——
export const profile = {
  name: "QeeYu",
  avatar: "/avatar.jpg",
  tagline: "化工学士 · 全栈开发 · 系统思维践行者",
  intro:
    "你好，我是 QeeYu 👋\n" +
    "化工专业出身，自学全栈开发。\n" +
    "将化工的「系统优化」思维带入代码世界——\n" +
    "注重流程、数据驱动、追求极致性能。\n" +
    "相信：最优雅的代码，和最完美的化工流程一样，\n" +
    "都是系统工程的艺术。",
};

// —— 链接项 ——
export interface LinkItem {
  label: string;
  icon: string;
  action: "open" | "copy";
  href?: string;
  value?: string;
}
export const links: LinkItem[] = [
  { label: "GitHub", icon: "🐙", action: "open", href: "https://github.com/QeeYu" },
  { label: "QQ", icon: "🐧", action: "copy", value: "3094554686" },
  {
    label: "Bilibili",
    icon: "📺",
    action: "open",
    href: "https://space.bilibili.com/86648019?spm_id_from=333.1007.0.0",
  },
  { label: "Email", icon: "📮", action: "open", href: "mailto:3094554686@qq.com" },
];

// —— 项目语言（环形图数据） ——
export interface LangItem {
  name: string;
  pct: number;
  color: string;
  url: string;
  note: string;
}
export const languages: LangItem[] = [
  {
    name: "TypeScript",
    pct: 34,
    color: "#3178c6",
    url: "https://www.typescriptlang.org/zh/",
    note: "类型安全，整个项目的骨架语言",
  },
  {
    name: "React/JSX",
    pct: 22,
    color: "#61dafb",
    url: "https://react.dev",
    note: "所有 UI 都由 React 19 组件构成",
  },
  {
    name: "CSS",
    pct: 18,
    color: "#2965f1",
    url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS",
    note: "Tailwind 4 编译产出的样式",
  },
  {
    name: "JavaScript",
    pct: 14,
    color: "#f7df1e",
    url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript",
    note: "无处不在的胶水语言",
  },
  {
    name: "HTML",
    pct: 12,
    color: "#e34f26",
    url: "https://developer.mozilla.org/zh-CN/docs/Web/HTML",
    note: "一切的起点",
  },
];

// —— 技能（含硬技能 + 软技能） ——
export const skills = [
  // 硬技能
  { name: "React 19", level: 15, icon: "⚛️", url: "https://react.dev" },
  { name: "Next.js 16", level: 20, icon: "▲", url: "https://nextjs.org" },
  { name: "Tailwind 4", level: 10, icon: "🌊", url: "https://tailwindcss.com" },
  { name: "TypeScript", level: 35, icon: "🔷", url: "https://www.typescriptlang.org/zh/" },
  { name: "GSAP", level: 10, icon: "🟢", url: "https://gsap.com" },
  { name: "anime.js", level: 10, icon: "🎬", url: "https://animejs.com" },
  { name: "Node.js", level: 30, icon: "🟩", url: "https://nodejs.org" },
  // ★ 软技能（化工背景赋予）
  { name: "系统工程思维", level: 40, icon: "⚙️", url: "#" },
  { name: "数据驱动决策", level: 35, icon: "📊", url: "#" },
  { name: "跨学科学习力", level: 45, icon: "🧠", url: "#" },
];

// —— 相册 ——
export const album = [
  {
    title: "自创AI角色海报",
    emoji: "🌙",
    grad: "linear-gradient(135deg,#7c5cff,#38e1ff)",
    src: "/album/1.jpg",
  },
  {
    title: "超帅的卡芙卡AI",
    emoji: "☕",
    grad: "linear-gradient(135deg,#ff9f5c,#ff5c8a)",
    src: "/album/2.jpg",
  },
  {
    title: "AI海报卡芙卡2",
    emoji: "🚀",
    grad: "linear-gradient(135deg,#38e1ff,#b4ff39)",
    src: "/album/3.jpg",
  },
  {
    title: "玛奇玛也很帅",
    emoji: "🌧️",
    grad: "linear-gradient(135deg,#4b6cb7,#182848)",
    src: "/album/4.jpg",
  },
  {
    title: "玛奇玛2",
    emoji: "🖥️",
    grad: "linear-gradient(135deg,#ff5c8a,#7c5cff)",
    src: "/album/5.jpg",
  },
  {
    title: "Fate还不错",
    emoji: "⛰️",
    grad: "linear-gradient(135deg,#11998e,#38ef7d)",
    src: "/album/6.jpg",
  },
];

// —— 日记 ——
export const diary = [
  {
    date: "2026-08-23",
    title: "把动画调到了丝滑",
    mood: "😎",
    text: "今天终于把横向滚动的 scrub 调到了 1，动画像黄油一样顺滑。原来性能和美感可以兼得，秘诀就是 rAF + transform。",
  },
  {
    date: "2026-08-23",
    title: "和 Canvas 粒子大战三百回合",
    mood: "🤯",
    text: "为了 4K 屏不卡顿，把 devicePixelRatio 限制到 2，粒子数按面积自适应。优化完帧率稳稳 60fps，舒服了。",
  },
  {
    date: "2026-08-23",
    title: "环形图的反向旋转",
    mood: "🤔",
    text: "想让环形语言图的标签一直保持水平：外层正转 360°，标签自身反转 360°，速度相同方向相反，就是永恒的水平。有点哲学。",
  },
  {
    date: "2026-08-23",
    title: "劳动节也在劳动",
    mood: "🛠️",
    text: "给自己主页加了个迷你音琴，用 Web Audio 纯手写振荡器发声。第一次听到自己代码「弹」出音符，值了。",
  },
];

// —— 一言 ——
export const hitokoto = [
  "代码如诗，bug 如标点。",
  "今天的动画，比昨天多丝滑 1%。",
  "把复杂留给机器，把简单留给人。",
  "每一个像素都值得被认真对待。",
  "灵感总在洗完澡之后到来。",
  "先让它跑起来，再让它美起来。",
  "删掉的代码，才是最好的代码。",
  "屏幕里的光，都是热爱的证据。",
  "人生没有 Ctrl+Z，所以更要认真生活。",
  "慢慢来，比较快。",
];

// —— Journey 面板数据（新增化工背景面板） ——
export interface JourneyStat {
  value: number;
  suffix: string;
  label: string;
}
export interface JourneyPanel {
  chapter: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  text?: string;
  stats?: JourneyStat[];
  tags?: string[];
  accent: string;
}

export const journeyPanels: JourneyPanel[] = [
  {
    chapter: "CHAPTER 00 · 起点",
    titleBefore: "化工学士 → ",
    titleHighlight: "全栈开发者",
    titleAfter: " 🧪",
    text: "用化工的严谨，写干净的代码。\n从物料衡算到状态管理，\n从反应器设计到系统架构，\n跨界，是我最强的竞争力。",
    accent: "text-cyan",
    stats: [
      { value: 4, suffix: " 年", label: "化工学习" },
      { value: 1.5, suffix: " 年", label: "全栈自学" },
      { value: 20, suffix: " +", label: "个人项目" },
    ],
  },
  {
    chapter: "CHAPTER 01",
    titleBefore: "一切，",
    titleHighlight: "从这里开始",
    titleAfter: "",
    text: "欢迎来到 QeeYu 的个人主页。\n这里记录了一个化工学生的编程成长之路。",
    accent: "text-cyan",
  },
  {
    chapter: "CHAPTER 02 · 热爱",
    titleBefore: "为热爱 ",
    titleHighlight: "发电",
    titleAfter: " 🔥",
    text: "白天写代码，晚上调动画；\n把每一个像素，都当作作品来雕琢。",
    accent: "text-pink",
  },
  {
    chapter: "CHAPTER 03 · 数字",
    titleBefore: "一些",
    titleHighlight: "奇怪的统计",
    titleAfter: " 📊",
    stats: [
      { value: 1, suffix: " 个", label: "Hello World" },
      { value: 99, suffix: " +", label: "Bug 已修复" },
      { value: 3, suffix: " 个", label: "失眠夜" },
      { value: 0, suffix: " 的", label: "Offer 已收到" },
    ],
    accent: "text-lime",
  },
  {
    chapter: "CHAPTER 04 · 哲学",
    titleBefore: "动画，是页面的",
    titleHighlight: "呼吸",
    titleAfter: " 🌬️",
    text: "一次缓动、一帧延迟、一点过冲，\n都是人机之间无声的悄悄话。",
    accent: "text-cyan",
  },
  {
    chapter: "CHAPTER 05 · 装备",
    titleBefore: "我的",
    titleHighlight: "工具箱",
    titleAfter: " 🧰",
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "GSAP", "anime.js", "Canvas", "Node.js"],
    accent: "text-neon",
  },
  {
    chapter: "CHAPTER 06 · 抵达",
    titleBefore: "欢迎来到",
    titleHighlight: "我的主页",
    titleAfter: " 🎉",
    text: "开场动画到此结束，\n故事才刚刚开始 —— 继续下滑，去认识一个更完整的 QeeYu。",
    accent: "text-pink",
  },
];

// —— 时间线数据（用于 TimelineCard） ——
export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
  icon?: string;
}
export const timeline: TimelineItem[] = [
  { date: "2023", title: "化工专业在读", desc: "学习化工原理、反应工程、流程优化", icon: "🧪" },
  { date: "2024", title: "自学编程", desc: "从 HTML/CSS 到 JavaScript/React", icon: "💻" },
  { date: "2025", title: "全栈入门", desc: "Next.js + TypeScript + Tailwind", icon: "🚀" },
  { date: "2026", title: "个人主页上线", desc: "首个完整的全栈作品", icon: "🎉" },
];