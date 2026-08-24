// ====================================================================
// 全站静态数据：改文案 / 链接 / 数据，只需要改这一个文件
// ====================================================================

// —— 个人信息 ——
export const profile = {
  name: "QeeYu",
  avatar: "/avatar.jpg", // 头像路径（public 下，可换成自己的图片）
  tagline: "前端开发者 · 动画爱好者 · 终身学习者",
  intro:
    "你好，我是 QeeYu 👋\n" +
    "一名喜欢「让界面动起来」的前端开发者。\n" +
    "日常与 React / Next.js 为伴，热衷于用 Canvas、\n" +
    "GSAP、anime.js 把平平无奇的页面做成会呼吸的作品。\n" +
    "相信：好的动画不是装饰，而是与用户的对话。",
};

// —— 链接项（action: open = 新窗口打开 / copy = 复制到剪贴板） ——
export interface LinkItem {
  label: string;
  icon: string;
  action: "open" | "copy";
  href?: string;  // open 时的目标地址
  value?: string; // copy 时的内容（如 QQ 号）
}
export const links: LinkItem[] = [
  { label: "GitHub",   icon: "🐙", action: "open", href: "https://github.com/QeeYu" },
  { label: "QQ",       icon: "🐧", action: "copy", value: "3094554686" }, // ★ 换成你的 QQ
  { label: "Bilibili", icon: "📺", action: "open", href: "https://space.bilibili.com/86648019?spm_id_from=333.1007.0.0" },
  { label: "Email",    icon: "📮", action: "open", href: "mailto:3094554686@qq.com" },
];

// —— 项目语言（环形图数据，pct 总和必须 = 100） ——
export interface LangItem {
  name: string; pct: number; color: string; url: string; note: string;
}
export const languages: LangItem[] = [
  { name: "TypeScript", pct: 34, color: "#3178c6", url: "https://www.typescriptlang.org/zh/",
    note: "类型安全，整个项目的骨架语言" },
  { name: "React/JSX",  pct: 22, color: "#61dafb", url: "https://react.dev",
    note: "所有 UI 都由 React 19 组件构成" },
  { name: "CSS",        pct: 18, color: "#2965f1", url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS",
    note: "Tailwind 4 编译产出的样式" },
  { name: "JavaScript", pct: 14, color: "#f7df1e", url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript",
    note: "无处不在的胶水语言" },
  { name: "HTML",       pct: 12, color: "#e34f26", url: "https://developer.mozilla.org/zh-CN/docs/Web/HTML",
    note: "一切的起点" },
];

// —— 技能（点击进入官方文档，level 为熟练度 0~100） ——
export const skills = [
  { name: "React 19",     level: 15, icon: "⚛️", url: "https://react.dev" },
  { name: "Next.js 16",   level: 20, icon: "▲",  url: "https://nextjs.org" },
  { name: "Tailwind 4",   level: 10, icon: "🌊", url: "https://tailwindcss.com" },
  { name: "TypeScript",   level: 35, icon: "🔷", url: "https://www.typescriptlang.org/zh/" },
  { name: "GSAP",         level: 10, icon: "🟢", url: "https://gsap.com" },
  { name: "anime.js",     level: 10, icon: "🎬", url: "https://animejs.com" },
  { name: "Node.js",      level: 30, icon: "🟩", url: "https://nodejs.org" },
];

// —— 相册（用渐变色块代替照片，替换成 <img> 也完全可以） ——
export const album = [
  { title: "自创AI角色海报",   emoji: "🌙", grad: "linear-gradient(135deg,#7c5cff,#38e1ff)", src: "/album/1.jpg" },
  { title: "超帅的卡芙卡AI",   emoji: "☕", grad: "linear-gradient(135deg,#ff9f5c,#ff5c8a)", src: "/album/2.jpg" },
  { title: "AI海报卡芙卡2",   emoji: "🚀", grad: "linear-gradient(135deg,#38e1ff,#b4ff39)", src: "/album/3.jpg" },
  { title: "玛奇玛也很帅",   emoji: "🌧️", grad: "linear-gradient(135deg,#4b6cb7,#182848)", src: "/album/4.jpg" },
  { title: "玛奇玛2",     emoji: "🖥️", grad: "linear-gradient(135deg,#ff5c8a,#7c5cff)", src: "/album/5.jpg" },
  { title: "Fate还不错",     emoji: "⛰️", grad: "linear-gradient(135deg,#11998e,#38ef7d)", src: "/album/6.jpg" },
];

// —— 日记 ——
export const diary = [
  { date: "2026-08-23", title: "把动画调到了丝滑", mood: "😎",
    text: "今天终于把横向滚动的 scrub 调到了 1，动画像黄油一样顺滑。原来性能和美感可以兼得，秘诀就是 rAF + transform。" },
  { date: "2026-08-23", title: "和 Canvas 粒子大战三百回合", mood: "🤯",
    text: "为了 4K 屏不卡顿，把 devicePixelRatio 限制到 2，粒子数按面积自适应。优化完帧率稳稳 60fps，舒服了。" },
  { date: "2026-08-23", title: "环形图的反向旋转", mood: "🤔",
    text: "想让环形语言图的标签一直保持水平：外层正转 360°，标签自身反转 360°，速度相同方向相反，就是永恒的水平。有点哲学。" },
  { date: "2026-08-23", title: "劳动节也在劳动", mood: "🛠️",
    text: "给自己主页加了个迷你音琴，用 Web Audio 纯手写振荡器发声。第一次听到自己代码「弹」出音符，值了。" },
];

// —— 一言（本地语料，保证离线也能用） ——
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
// —— 旅程面板数据（文字内容在这里改）——
export interface JourneyStat {
  value: number;
  suffix: string;
  label: string;
}
export interface JourneyPanel {
  chapter: string;          // 章节标签
  titleBefore: string;      // 标题前半
  titleHighlight: string;   // 标题高亮部分（text-gradient）
  titleAfter: string;       // 标题后半（含 emoji）
  text?: string;            // 正文（\n 换行）
  stats?: JourneyStat[];    // 数字统计（面板 3 用）
  tags?: string[];           // 技术词条（面板 5 用）
  accent: string;            // 章节标签颜色类名
}
export const journeyPanels: JourneyPanel[] = [
  { chapter: "CHAPTER 01", titleBefore: "一切，", titleHighlight: "从这里开始", titleAfter: "",
    text: "欢迎来到 QeeYu 的小宇宙 \n这段向左流动的画面，是我送你的开场动画 ——\n请系好安全带，我们出发。", accent: "text-cyan" },
  { chapter: "CHAPTER 02 · 热爱", titleBefore: "为热爱 ", titleHighlight: "发电", titleAfter: " 🔥",
    text: "白天写代码，晚上调动画；\n把每一个像素，都当作作品来雕琢。", accent: "text-pink" },
  { chapter: "CHAPTER 03 · 数字", titleBefore: "一些", titleHighlight: "奇怪的统计", titleAfter: " 📊",
    stats: [
      { value: 1,   suffix: " 个", label: "Hello World" },   // 第一个程序
      { value: 99,  suffix: " +", label: "Bug 已修复" },    // 修了99个bug
      { value: 3,   suffix: " 个", label: "失眠夜" },        // 熬夜三次
      { value: 0,   suffix: " 的", label: "Offer 已收到" },  // 还没找到工作（哈哈）  
    ], accent: "text-lime" },
  { chapter: "CHAPTER 04 · 哲学", titleBefore: "动画，是页面的", titleHighlight: "呼吸", titleAfter: " 🌬️",
    text: "一次缓动、一帧延迟、一点过冲，\n都是人机之间无声的悄悄话。", accent: "text-cyan" },
  { chapter: "CHAPTER 05 · 装备", titleBefore: "我的", titleHighlight: "工具箱", titleAfter: " 🧰",
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "GSAP", "anime.js", "Canvas", "Node.js"], accent: "text-neon" },
  { chapter: "CHAPTER 06 · 抵达", titleBefore: "欢迎来到", titleHighlight: "我的主页", titleAfter: " 🎉",
    text: "开场动画到此结束，\n故事才刚刚开始 —— 继续下滑，去认识一个更完整的 QeeYu。", accent: "text-pink" },
];