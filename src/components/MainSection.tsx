// 主页：交互背景 + 两页卡片 + 页脚
// 本组件是服务端组件（自身无交互），所有交互都由各卡片（客户端组件）自行实现
import InteractiveBackground from "./InteractiveBackground";
import Reveal from "./Reveal";
import ProfileCard from "./cards/ProfileCard";
import TimeCard from "./cards/TimeCard";
import LinksCard from "./cards/LinksCard";
import LanguageRingCard from "./cards/LanguageRingCard";
import SkillsCard from "./cards/SkillsCard";
import AlbumCard from "./cards/AlbumCard";
import DiaryCard from "./cards/DiaryCard";
import { HitokotoCard, PianoCard, BubbleCard, FortuneCard } from "./cards/WidgetCards";

/** 两页共用的页头（含跳转到另一页的锚点按钮） */
function PageHeader({
  index, zh, en, nextId, nextLabel,
}: {
  index: string; zh: string; en: string; nextId: string; nextLabel: string;
}) {
  return (
    // Reveal：滚到这里时页头先浮现
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.5em] text-cyan">PAGE {index}</p>
          {/* 中文大标题 + 英文小字 */}
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            {zh}
            <span className="ml-3 align-middle text-base font-bold text-dim/70 md:text-lg">{en}</span>
          </h2>
          {/* 标题下的渐变短线 */}
          <div className="mt-3 h-[3px] w-24 rounded-full bg-linear-to-r from-neon via-cyan to-pink" />
        </div>
        {/* 跳转到另一页 / 回顶部 */}
        <a
          href={nextId}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-dim transition-colors hover:border-cyan/60 hover:text-cyan"
        >
          {nextLabel} ↓
        </a>
      </div>
    </Reveal>
  );
}

export default function MainSection() {
  return (
    <div id="main" className="relative">
      {/* ① 交互背景：sticky 铺满视口（内部监听 window 的鼠标/点击事件） */}
      <InteractiveBackground />

      {/* ② 内容层：负 margin 上移 100svh，覆盖在背景之上（z-10 保证层级） */}
      <div className="relative z-10 -mt-[100svh]">

        {/* ============ 第一页：关于我 ============ */}
        <section id="main-page-1" className="mx-auto max-w-6xl px-4 pb-10 pt-20 md:px-8 md:pt-28">
          <PageHeader index="01" zh="关于我" en="ABOUT ME" nextId="#main-page-2" nextLabel="前往第 2 页" />

          {/* 卡片栅格：手机 1 列 / 平板 2 列（每张卡片错峰浮现） */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal><ProfileCard /></Reveal>
            <Reveal delay={90}><TimeCard /></Reveal>
            <Reveal delay={60}><LinksCard /></Reveal>
            <Reveal delay={150}><LanguageRingCard /></Reveal>
          </div>
        </section>

        {/* 两页之间的分隔提示（向下的灵动箭头） */}
        <div className="flex flex-col items-center gap-1 py-8 text-dim">
          <span className="text-[10px] tracking-[0.45em]">继续下滑</span>
          <span className="anim-float text-cyan">▼</span>
        </div>

        {/* ============ 第二页：技能 · 相册 · 日记 ============ */}
        <section id="main-page-2" className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <PageHeader index="02" zh="技能 · 相册 · 日记" en="SKILLS / ALBUM / DIARY" nextId="#hero" nextLabel="回到顶部" />

          {/* 三列卡片：手机 1 列 / 平板 2 列 / 桌面 3 列 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Reveal><SkillsCard /></Reveal>
            <Reveal delay={90}><AlbumCard /></Reveal>
            <Reveal delay={180}><DiaryCard /></Reveal>
          </div>

          {/* —— 趣味小插件区 —— */}
          <div className="mt-14">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <h3 className="text-xl font-black">
                  趣味小插件 <span className="text-sm font-bold text-dim/70">FUN ZONE</span>
                </h3>
                {/* 渐变分隔线（从有色渐隐到透明） */}
                <div className="h-[2px] flex-1 rounded-full bg-linear-to-r from-neon/60 via-cyan/60 to-transparent" />
              </div>
            </Reveal>

            {/* 四个小插件：手机 1 列 / 小屏 2 列 / 桌面 4 列 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Reveal><HitokotoCard /></Reveal>
              <Reveal delay={80}><PianoCard /></Reveal>
              <Reveal delay={160}><BubbleCard /></Reveal>
              <Reveal delay={240}><FortuneCard /></Reveal>
            </div>
          </div>
        </section>

        {/* ============ 页脚 ============ */}
        <footer className="border-t border-white/10 px-4 py-10 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-dim">QEEYU · PERSONAL HOMEPAGE · 2026</p>
          <p className="mt-2 text-[11px] text-dim/70">
            Built with Next.js 16 · React 19 · Tailwind CSS 4 · GSAP · anime.js · Canvas
          </p>
          {/* 回到首屏（html 已开启平滑滚动） */}
          <a href="#hero" className="mt-4 inline-block text-xs text-cyan transition-colors hover:text-neon">
            ↑ 回到最初的粒子星空
          </a>
        </footer>
      </div>
    </div>
  );
}