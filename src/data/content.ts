// ====================================================================
// 全站静态数据：改文案 / 链接 / 数据，只需要改这一个文件
// ====================================================================

// —— 个人信息 ——
export const profile = {
  name: "邝有航",
  avatar: "/avatar.jpg",
  tagline: "化工学生",
  intro:
    "你好，我是邝有航 \n" +
    "西北大学化工专业本科生。\n" +
    "能够熟练使用电脑,工作软件等\n" +
    "完成专业学科学习，能够使用各类专业软件如CAD，Aspen+，3DMAX等\n" +
    "自学全栈开发，和AI等，这是我制作的个人网页\n" +
    "熟练使用各种AI,自学各种AIGC\n" +
    "能够本地部署各类AI模型，熟练使用各类agent，目前主要使用DSH\n" +
    "熟练使用comfyui，自建Krea2，MiniMaxH3等工作流",
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
  { label: "微信", icon: "💬", action: "copy", value: "kyh3094554686" },
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
  { name: "专业能力", level: 85, url: "#" },
  { name: "AI使用", level: 70, url: "#" },
  { name: "agent使用", level: 65, url: "#" },
  { name: "AIGC能力", level: 75, url: "#" },
  { name: "前后端编程", level: 60, url: "#" },
  { name: "skill创造", level: 60, url: "#" },
  { name: "系统工程思维", level: 80, url: "#" },
  { name: "跨学科学习力", level: 100, url: "#" },
];

// —— 作品集 ——
export interface WorkItem {
  title: string;
  desc: string;
  category: string;
  emoji: string;
  grad: string;
  src?: string;          // 封面图
  thumb?: string;        // 缩略图（可选）
  video?: string;        // ★ 视频链接
  downloadUrl?: string;  // ★ 工作流下载链接
  downloadName?: string; // ★ 下载时的文件名
  tags: string[];
  href?: string;
}

const COS_IMAGE = "https://qyzuop-1378763038.cos.ap-chongqing.myqcloud.com/image";
const COS_VIDEO = "https://qyzuop-1378763038.cos.ap-chongqing.myqcloud.com/video";

export const works: WorkItem[] = [
  // ============================================================
  // ① 工作流作品（带 JSON 下载）
  // ============================================================
  {
    title: "MiniMax H3 总控工作流",
    desc: "自建 ComfyUI 总控台工作流，整合 H3 系列模型与多路调度节点，可一键产出批量化作品。下载后可直接导入 ComfyUI 使用。",
    category: "工作流 · ComfyUI",
    emoji: "🎛️",
    grad: "linear-gradient(135deg,#7c5cff,#38e1ff)",
    src: `${COS_IMAGE}/ComfyuiH3总台流.png`,
    downloadUrl: `${COS_IMAGE}/miniMax H3总控.json`,
    downloadName: "MiniMax-H3-总控工作流.json",
    tags: ["ComfyUI", "工作流", "可下载"],
  },
  {
    title: "Krea2 平面海报工作流",
    desc: "针对平面海报场景优化的 Krea2 工作流，集成风格控制与高清放大节点，适合商业海报快速产出。",
    category: "工作流 · ComfyUI",
    emoji: "🎨",
    grad: "linear-gradient(135deg,#ff5c8a,#7c5cff)",
    src: `${COS_IMAGE}/krea2平面海报.png`,
    downloadUrl: `${COS_IMAGE}/krea2平面海报.json`,
    downloadName: "Krea2-平面海报工作流.json",
    tags: ["ComfyUI", "Krea2", "海报", "可下载"],
  },
  {
    title: "Krea2 生图对比工作流",
    desc: "用于对比不同参数/模型出图效果的实验性工作流，同一提示词可并行生成多路结果，便于调参。",
    category: "工作流 · ComfyUI",
    emoji: "🔬",
    grad: "linear-gradient(135deg,#38e1ff,#b4ff39)",
    src: `${COS_IMAGE}/krea2生图对比工作流.png`,
    downloadUrl: `${COS_IMAGE}/krea2生图对比.json`,
    downloadName: "Krea2-生图对比工作流.json",
    tags: ["ComfyUI", "Krea2", "对比", "可下载"],
  },
  {
    title: "Krea2 人物资产工作流",
    desc: "人物角色资产生成工作流，支持角色一致性控制与多姿态输出，适合作为角色设定集的生产工具。",
    category: "工作流 · ComfyUI",
    emoji: "🧑‍🎨",
    grad: "linear-gradient(135deg,#ff9f5c,#ff5c8a)",
    src: `${COS_IMAGE}/人物资产工作流.png`,
    downloadUrl: `${COS_IMAGE}/krea2人物资产.json`,
    downloadName: "Krea2-人物资产工作流.json",
    tags: ["ComfyUI", "Krea2", "人物", "可下载"],
  },

  // ============================================================
  // ② AI 图像作品
  // ============================================================
  {
    title: "AI 角色海报1",
    desc: "ComfyUI Krea2 出图作品。",
    category: "AIGC · 视觉",
    emoji: "🌙",
    grad: "linear-gradient(135deg,#7c5cff,#38e1ff)",
    src: `${COS_IMAGE}/ComfyUI_01591_.png`,
    tags: ["ComfyUI", "AI 绘画", "krea2", "角色"],
  },
  {
    title: "AI 角色海报2",
    desc: "ComfyUI Krea2 出图作品。",
    category: "AIGC · 视觉",
    emoji: "🌌",
    grad: "linear-gradient(135deg,#38e1ff,#b4ff39)",
    src: `${COS_IMAGE}/ComfyUI_01605_.png`,
    tags: ["ComfyUI", "AI 绘画", "krea2", "角色"],
  },
  {
    title: "AI 角色海报3",
    desc: "ComfyUI Krea2 出图作品。",
    category: "AIGC · 视觉",
    emoji: "🎭",
    grad: "linear-gradient(135deg,#ff5c8a,#7c5cff)",
    src: `${COS_IMAGE}/ComfyUI_01615_.png`,
    tags: ["ComfyUI", "AI 绘画", "krea2", "角色"],
  },
  {
    title: "AI 角色海报4",
    desc: "ComfyUI Krea2 出图作品。",
    category: "AIGC · 视觉",
    emoji: "🌆",
    grad: "linear-gradient(135deg,#ff9f5c,#ff5c8a)",
    src: `${COS_IMAGE}/ComfyUI_01628_.png`,
    tags: ["ComfyUI", "AI 绘画", "krea2", "角色"],
  },

  // ============================================================
  // ③ 视频作品
  // ============================================================
  {
    title: "MiniMax H3 · 短片 069",
    desc: "MiniMax H3 模型生成的 AI 动画短片。",
    category: "AIGC · 视频",
    emoji: "🎬",
    grad: "linear-gradient(135deg,#7c5cff,#ff5c8a)",
    video: `${COS_VIDEO}/MiniMax_H3_00069_.mp4`,
    tags: ["MiniMax H3", "视频", "AI 动画"],
  },
  {
    title: "MiniMax H3 · 短片 071",
    desc: "MiniMax H3 模型生成短片。",
    category: "AIGC · 视频",
    emoji: "🎞️",
    grad: "linear-gradient(135deg,#38e1ff,#7c5cff)",
    video: `${COS_VIDEO}/MiniMax_H3_00071_.mp4`,
    tags: ["MiniMax H3", "视频", "AI 动画"],
  },
  {
    title: "MiniMax H3 · 短片 086",
    desc: "MiniMax H3 模型生成短片。",
    category: "AIGC · 视频",
    emoji: "🎥",
    grad: "linear-gradient(135deg,#ff5c8a,#ff9f5c)",
    video: `${COS_VIDEO}/MiniMax_H3_00086_.mp4`,
    tags: ["MiniMax H3", "视频", "AI 动画"],
  },
  {
    title: "MiniMax H3 · 短片 105",
    desc: "MiniMax H3 模型生成短片。",
    category: "AIGC · 视频",
    emoji: "📽️",
    grad: "linear-gradient(135deg,#b4ff39,#38e1ff)",
    video: `${COS_VIDEO}/MiniMax_H3_00105_.mp4`,
    tags: ["MiniMax H3", "视频", "AI 动画"],
  },
];

// ====================================================================
// Journey 面板数据（快速自我介绍的 6 章节）
// ====================================================================
export type JourneyPanelType =
  | "intro"
  | "courses"
  | "skills"
  | "ai"
  | "fullstack"
  | "traits";

export interface JourneyStat {
  value: number;
  suffix?: string;
  label: string;
  icon: string;
}

export interface JourneyCourseGroup {
  label: string;
  icon: string;
  items: string[];
}

export interface JourneySkillCard {
  icon: string;
  title: string;
  desc: string;
  tags: string[];
}

export interface JourneyTrait {
  icon: string;
  title: string;
  desc: string;
}

export interface JourneyPanel {
  type: JourneyPanelType;
  chapter: string;
  accent: string;
  titleBefore?: string;
  titleHighlight?: string;
  titleAfter?: string;
  subtitle?: string;
  stats?: JourneyStat[];
  courseGroups?: JourneyCourseGroup[];
  skillCards?: JourneySkillCard[];
  traits?: JourneyTrait[];
}

export const journeyPanels: JourneyPanel[] = [
  {
    type: "intro",
    chapter: "CHAPTER 00 · 主角登场",
    accent: "text-cyan",
    titleBefore: "你好，我是",
    titleHighlight: "邝有航",
    titleAfter: " 👋",
    subtitle:
      "西北大学 · 化工专业 · 能源化学工程方向\n" +
      "化工的系统思维 × 全栈的工程实践 × AI 的深度应用\n" +
      "一个喜欢跨界，并且把每一件都做到极致的家伙。",
    stats: [
      { value: 4, suffix: " 年", label: "化工学习", icon: "🧪" },
      { value: 38, suffix: " +", label: "专业课程", icon: "📚" },
      { value: 30, suffix: " +", label: "大学实验", icon: "⚗️" },
      { value: 3, suffix: " 线", label: "跨界技能", icon: "🚀" },
    ],
  },
  {
    type: "courses",
    chapter: "CHAPTER 01 · 学科地图",
    accent: "text-lime",
    titleBefore: "我的",
    titleHighlight: "专业课程",
    titleAfter: "",
    subtitle: "从化学基础到工程实践 · 4 年沉淀 · 系统完整",
    courseGroups: [
      {
        label: "化学基础",
        icon: "🧬",
        items: ["无机化学", "分析化学", "有机化学", "物理化学", "仪器分析"],
      },
      {
        label: "化工核心",
        icon: "⚗️",
        items: [
          "化工原理",
          "化工热力学",
          "化学反应工程",
          "化工分离过程",
          "化工传递过程",
          "化工过程分析与合成",
        ],
      },
      {
        label: "工程实践",
        icon: "🛠️",
        items: [
          "工程制图",
          "化工设备机械基础",
          "化工设计与计算",
          "化工仪表及自动化",
          "化工原理课程设计",
          "机械设备基础课程设计",
        ],
      },
      {
        label: "能源与环保",
        icon: "🌱",
        items: [
          "新能源与可再生能源",
          "能源化学工艺学",
          "煤化学",
          "化工环保与安全",
          "电工与电子技术基础",
          "化工应用软件",
        ],
      },
    ],
  },
  {
    type: "skills",
    chapter: "CHAPTER 02 · 实验与工具",
    accent: "text-cyan",
    titleBefore: "实验 · ",
    titleHighlight: "专业软件",
    titleAfter: "",
    subtitle: "扎实的实验功底 · 熟练的专业工具链",
    skillCards: [
      {
        icon: "⚗️",
        title: "实验能力",
        desc: "熟练各类化工专业实验，优秀完成大学阶段全部实验课程，具备严谨的操作规范与数据处理能力。",
        tags: ["基础化学实验", "化工原理实验", "仪器分析"],
      },
      {
        icon: "📐",
        title: "专业软件",
        desc: "熟练使用各类化工与工程设计软件，覆盖流程模拟、图纸绘制、三维建模等核心场景。",
        tags: ["CAD", "Aspen Plus", "3DMAX"],
      },
      {
        icon: "📊",
        title: "办公与文档",
        desc: "熟练使用 Office 全家族办公软件，能够高质量完成课程报告、数据分析与技术文档撰写。",
        tags: ["Word", "Excel", "PowerPoint"],
      },
      {
        icon: "💻",
        title: "电脑技能",
        desc: "熟练使用电脑，具备快速学习新软件、新系统与新工具的能力，技术敏感度高。",
        tags: ["Windows", "系统工具", "快速上手"],
      },
    ],
  },
  {
    type: "ai",
    chapter: "CHAPTER 03 · AI 探索",
    accent: "text-neon",
    titleBefore: "AI ",
    titleHighlight: "深度应用",
    titleAfter: "",
    subtitle: "从使用者到构建者 · 从云端到本地",
    skillCards: [
      {
        icon: "🤖",
        title: "AI 精通使用",
        desc: "精通各类 AI 工具的使用，能够针对不同场景选择最合适的模型与工作方式。",
        tags: ["提示工程", "模型选型", "效率倍增"],
      },
      {
        icon: "🧠",
        title: "AI 智能体",
        desc: "熟练使用 AI Agent 完成复杂任务编排，日常主力使用 CODEX 与 DSH 进行自动化流程。",
        tags: ["CODEX", "DSH", "任务编排"],
      },
      {
        icon: "🏠",
        title: "本地化部署",
        desc: "能够独立完成各类 AI 模型的本地化部署，掌握推理环境配置、显存优化与私有化运行。",
        tags: ["本地部署", "推理环境", "私有化"],
      },
      {
        icon: "🎨",
        title: "ComfyUI 工作流",
        desc: "本地化使用 ComfyUI，自建完整工作流，覆盖文生图、图生图、ControlNet 等各类场景。",
        tags: ["ComfyUI", "自建工作流", "AIGC"],
      },
      {
        icon: "⚙️",
        title: "自建 Skills",
        desc: "根据个人需求自建 AI Skills 与工具链，让 AI 真正成为贴合自己工作流的专属助手。",
        tags: ["Skills", "工具链", "定制化"],
      },
      {
        icon: "🌐",
        title: "API 调用集成",
        desc: "熟悉各类 AI 服务的 API 调用方式，能够将 AI 能力集成到自建的 Web 应用与服务中。",
        tags: ["API", "集成", "本地服务"],
      },
    ],
  },
  {
    type: "fullstack",
    chapter: "CHAPTER 04 · 跨界全栈",
    accent: "text-pink",
    titleBefore: "自学",
    titleHighlight: "全栈开发",
    titleAfter: "",
    subtitle: "化工之外的另一个世界 · 从 0 到 1 独立完成",
    skillCards: [
      {
        icon: "🎨",
        title: "前端开发",
        desc: "独立完成个人网页项目，掌握 React、Next.js、Tailwind 等现代前端技术栈与动画方案。",
        tags: ["React", "Next.js", "Tailwind", "GSAP"],
      },
      {
        icon: "🗄️",
        title: "后端开发",
        desc: "独立完成后端服务搭建，包括个人数据库设计、本地 AI API 调用与业务逻辑实现。",
        tags: ["Node.js", "数据库", "API 调用"],
      },
      {
        icon: "🖥️",
        title: "服务器搭建",
        desc: "个人独立搭建服务器环境，完成部署、运维与域名解析，具备完整的全栈落地能力。",
        tags: ["服务器", "部署", "运维"],
      },
    ],
  },
  {
    type: "traits",
    chapter: "CHAPTER 05 · 我的特质",
    accent: "text-lime",
    titleBefore: "我，是这样的",
    titleHighlight: "一个人",
    titleAfter: "",
    subtitle: "化工 × AI × 全栈 · 用跨界构建不可替代性",
    traits: [
      {
        icon: "🌉",
        title: "跨学科学习力拉满",
        desc: "从化工到 AI 到全栈开发，跨越三个领域依然游刃有余。跨学科不是浅尝辄止，而是每一门都钻研到底。",
      },
      {
        icon: "🎯",
        title: "专业能力精通",
        desc: "化工专业知识体系完整扎实，从基础化学到工程设计，每一门课都留下扎实的实践痕迹。",
      },
      {
        icon: "🔥",
        title: "学习动力强劲",
        desc: "持续学习、主动探索是本能。看到新技术就想上手，遇到新问题就想钻研，永远保持在路上的状态。",
      },
      {
        icon: "🛠️",
        title: "动手能力强",
        desc: "从实验室的烧杯到服务器的终端，从 AI 模型到 Web 应用，习惯将想法落地为真实可用的成果。",
      },
    ],
  },
];

// ====================================================================
// 经历数据（用于 ExperienceCard）
// ====================================================================
export interface Experience {
  period: string;
  title: string;
  org: string;
  desc: string;
  tags?: string[];
  current?: boolean;
}

export const experiences: Experience[] = [
  {
    period: "2025 - 至今",
    title: "AIGC 工作流开发者",
    org: "个人项目",
    desc: "自建 ComfyUI 工作流 5 套（角色/海报/对比/人物资产/总控），部署 MiniMax H3 本地模型搭建视频生成流水线，累计产出 AI 图像与视频作品 200+。",
    tags: ["ComfyUI", "MiniMax H3", "AIGC"],
    current: true,
  },
  {
    period: "2026 - 至今",
    title: "全栈开发 · 个人项目",
    org: "自学 + 独立开发",
    desc: "掌握 React、Next.js、TypeScript 与 Tailwind，从零设计并上线个人主页，集成 3D 动画、Canvas 粒子、GSAP 滚动动画与音琴应用。",
    tags: ["Next.js", "React", "TypeScript", "GSAP"],
    current: true,
  },
  {
    period: "2024 - 至今",
    title: "AI 工具深度探索",
    org: "个人学习",
    desc: "系统学习 Prompt Engineering、AI Agent 编排与本地大模型部署，主力使用 Codex 与 DSH 完成日常自动化任务，搭建专属 AI 工具链。",
    tags: ["Prompt", "Agent", "本地部署"],
    current: true,
  },
  {
    period: "2023.09 - 2027.06",
    title: "能源化学工程 · 本科在读",
    org: "西北大学",
    desc: "主修化学基础、化工核心、工程实践三大方向共 20+ 门课程，完成化工原理课程设计与机械设备基础课程设计，优秀完成大学阶段全部实验课程。",
    tags: ["化工原理", "反应工程", "课程设计"],
  },
];