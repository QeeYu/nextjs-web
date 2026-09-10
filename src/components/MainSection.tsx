// 主页：交互背景 + 两页卡片 + 页脚
import dynamic from "next/dynamic";
import InteractiveBackground from "./InteractiveBackground";
import Reveal from "./Reveal";
import ProfileCard from "./cards/ProfileCard";
import TimeCard from "./cards/TimeCard";
import LinksCard from "./cards/LinksCard";
import SkillsCard from "./cards/SkillsCard";
import LanguageRingCard from "./cards/LanguageRingCard";
import ExperienceCard from "./cards/ExperienceCard";
import WorksCard from "./cards/WorksCard";
import { PianoCard, DiceRoller, ColorPalette, ReactionTimer } from "./cards/WidgetCards";

// ★ 关键优化：ThreeAtom 独立动态加载（Three.js 500+ KB 不跟 MainSection 一起下）
const ThreeAtom = dynamic(() => import("./ThreeAtom"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink-2/30">
      <div className="flex flex-col items-center gap-3">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
        <span className="font-mono text-[10px] tracking-widest text-dim">
          LOADING 3D...
        </span>
      </div>
    </div>
  ),
});

/** 两页共用的页头 */
function PageHeader({
  index,
  zh,
  en,
  nextId,
  nextLabel,
}: {
  index: string;
  zh: string;
  en: string;
  nextId: string;
  nextLabel: string;
}) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.5em] text-cyan">
            PAGE {index}
          </p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            {zh}
            <span className="ml-3 align-middle text-base font-bold text-dim/70 md:text-lg">
              {en}
            </span>
          </h2>
          <div className="mt-3 h-[3px] w-24 rounded-full bg-linear-to-r from-neon via-cyan to-pink" />
        </div>
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
      <InteractiveBackground />

      <div className="relative z-10 -mt-[100svh]">
        {/* ============ 第一页：关于我 ============ */}
        <section
          id="main-page-1"
          className="mx-auto max-w-6xl px-4 pb-10 pt-20 md:px-8 md:pt-28"
        >
          <PageHeader
            index="01"
            zh="关于我"
            en="ABOUT ME"
            nextId="#main-page-2"
            nextLabel="前往第 2 页"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <ProfileCard />
            </Reveal>
            <Reveal delay={90}>
              <TimeCard />
            </Reveal>
            <Reveal delay={60}>
              <LinksCard />
            </Reveal>
            <Reveal delay={150}>
              <SkillsCard />
            </Reveal>
            <Reveal delay={180}>
              <LanguageRingCard />
            </Reveal>
            {/* 3D 分子装饰（动态加载，有骨架屏） */}
            <Reveal delay={200}>
              <div className="card-glass card-line relative h-full min-h-[300px] overflow-hidden p-0">
                <ThreeAtom />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 分隔提示 */}
        <div className="flex flex-col items-center gap-1 py-8 text-dim">
          <span className="text-[10px] tracking-[0.45em]">继续下滑</span>
          <span className="anim-float text-cyan">▼</span>
        </div>

        {/* ============ 第二页：经历 · 作品 · 趣味 ============ */}
        <section
          id="main-page-2"
          className="mx-auto max-w-6xl px-4 pb-16 md:px-8"
        >
          <PageHeader
            index="02"
            zh="经历 · 作品 · 趣味"
            en="EXPERIENCE / WORKS / FUN ZONE"
            nextId="#hero"
            nextLabel="回到顶部"
          />

          <Reveal>
            <ExperienceCard />
          </Reveal>

          <Reveal delay={90} className="mt-8 md:mt-10">
            <WorksCard />
          </Reveal>

          <div className="mt-14">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <h3 className="text-xl font-black">
                  趣味小插件{" "}
                  <span className="text-sm font-bold text-dim/70">
                    FUN ZONE
                  </span>
                </h3>
                <div className="h-[2px] flex-1 rounded-full bg-linear-to-r from-neon/60 via-cyan/60 to-transparent" />
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <Reveal>
                <PianoCard />
              </Reveal>
              <Reveal delay={60}>
                <DiceRoller />
              </Reveal>
              <Reveal delay={120}>
                <ColorPalette />
              </Reveal>
              <Reveal delay={180}>
                <ReactionTimer />
              </Reveal>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-10 text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-dim">
            QEEYU · PERSONAL HOMEPAGE · 2026
          </p>
          <p className="mt-2 text-[11px] text-dim/70">
            Built with Next.js 16 · React 19 · Tailwind CSS 4 · GSAP · anime.js · Canvas
          </p>
          <a
            href="#hero"
            className="mt-4 inline-block text-xs text-cyan transition-colors hover:text-neon"
          >
            ↑ 回到最初的粒子星空
          </a>
        </footer>
      </div>
    </div>
  );
}