"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyPanels, type JourneyPanel } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 强调色板：按卡片索引循环使用
// ============================================================
const ACCENTS = ["#38e1ff", "#b4ff39", "#ff5c8a", "#7c5cff", "#ff9f5c", "#00ffcc"];

// ============================================================
// 面板宽度
// ============================================================
const widthByType: Record<JourneyPanel["type"], CSSProperties> = {
  intro:     { width: "min(88vw, 900px)" },
  courses:   { width: "min(90vw, 1100px)" },
  skills:    { width: "min(88vw, 1000px)" },
  ai:        { width: "min(90vw, 1060px)" },
  fullstack: { width: "min(88vw, 1000px)" },
  traits:    { width: "min(88vw, 1000px)" },
};

// ============================================================
// ★ 通用卡片外壳
//    - 渐变描边（1px padding 技巧）
//    - 悬停上浮 + 光晕
//    - 角落扫光
//    - 每张卡分配不同强调色
// ============================================================
function GlowCard({
  index,
  children,
  className = "",
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <div
      className={`j-card group relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.14] via-white/[0.05] to-white/[0.02] p-[1px] transition-transform duration-500 ease-out hover:-translate-y-1.5 ${className}`}
      style={{ "--accent": accent } as CSSProperties}
    >
      {/* 内层容器 */}
      <div className="relative h-full overflow-hidden rounded-[15px] bg-ink-2/95 p-5">
        {/* 角落光晕（悬停时亮起） */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: accent, opacity: 0 }}
        />
        {/* 悬停时的实际光晕 */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
          style={{ background: accent }}
        />
        {/* 扫光条 */}
        <div className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/[0.06] to-transparent transition-all duration-[1200ms] ease-out group-hover:left-full" />
        {/* 左侧强调条 */}
        <div
          className="pointer-events-none absolute inset-y-4 left-0 w-[2px] rounded-r-full opacity-50 transition-all duration-500 group-hover:inset-y-2 group-hover:opacity-100"
          style={{
            background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          }}
        />
        {/* 内容 */}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// 面板容器
// ============================================================
function Panel({
  panel,
  index,
  total,
}: {
  panel: JourneyPanel;
  index: number;
  total: number;
}) {
  return (
    <article
      className="j-panel relative flex h-[78vh] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink-2/70 p-7 md:h-[80vh] md:p-12"
      style={widthByType[panel.type]}
    >
      <div className="j-chapter mb-5 flex flex-shrink-0 items-center gap-3 md:mb-6">
        <span className="font-mono text-xs tracking-widest text-dim/50">
          {String(index + 1).padStart(2, "0")}
          <span className="text-dim/30">
            {" / "}
            {String(total).padStart(2, "0")}
          </span>
        </span>
        <div className="h-px flex-1 bg-white/10" />
        <span
          className={`font-mono text-[11px] tracking-[0.4em] ${panel.accent}`}
        >
          {panel.chapter}
        </span>
      </div>

      {panel.type === "intro" && <IntroContent panel={panel} />}
      {panel.type === "courses" && <CoursesContent panel={panel} />}
      {(panel.type === "skills" ||
        panel.type === "ai" ||
        panel.type === "fullstack") && <SkillsContent panel={panel} />}
      {panel.type === "traits" && <TraitsContent panel={panel} />}

      {/* 装饰：角落圆弧 + 光点 */}
      <div className="j-shape pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/5 md:-right-24 md:-top-24 md:h-80 md:w-80" />
      <div className="j-shape pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-3xl bg-linear-to-br from-neon/10 to-transparent blur-2xl" />
      <div className="j-shape pointer-events-none absolute right-8 top-1/2 hidden h-1.5 w-1.5 rounded-full bg-cyan/70 shadow-[0_0_10px_rgba(56,225,255,1)] md:block" />
      <div className="j-shape pointer-events-none absolute bottom-12 right-20 hidden h-1 w-1 rounded-full bg-pink/70 shadow-[0_0_8px_rgba(255,92,138,1)] md:block" />
    </article>
  );
}

// ============================================================
// CHAPTER 00 · 主角登场
// ============================================================
function IntroContent({ panel }: { panel: JourneyPanel }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto pr-1 md:gap-10">
      <div className="flex-shrink-0">
        <h2 className="j-title-line text-[clamp(2rem,5.2vw,4.2rem)] font-black leading-[1.1] tracking-[-0.03em]">
          {panel.titleBefore}
        </h2>
        <h2 className="j-title-line text-gradient-hero text-[clamp(2.4rem,6vw,5rem)] font-black leading-[1.05] tracking-[-0.03em]">
          {panel.titleHighlight}
          {panel.titleAfter}
        </h2>
        {panel.subtitle && (
          <p className="j-text mt-6 max-w-2xl whitespace-pre-line text-[15px] leading-[1.85] tracking-[0.01em] text-mist/80 md:text-base">
            {panel.subtitle}
          </p>
        )}
      </div>

      {panel.stats && (
        <div className="grid flex-shrink-0 grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {panel.stats.map((s, i) => (
            <GlowCard key={s.label} index={i}>
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[10deg]">
                {s.icon}
              </div>
              <div
                className="j-num-glow font-mono text-3xl font-black leading-none tracking-tight md:text-4xl"
                style={{
                  color: ACCENTS[i % ACCENTS.length],
                  textShadow: `0 0 24px ${ACCENTS[i % ACCENTS.length]}66`,
                }}
              >
                <span className="j-num" data-value={s.value}>
                  0
                </span>
                {s.suffix && (
                  <span className="ml-0.5 text-base text-mist/80">
                    {s.suffix}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11.5px] font-medium tracking-[0.08em] text-dim">
                {s.label}
              </p>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHAPTER 01 · 学科地图
// ============================================================
function CoursesContent({ panel }: { panel: JourneyPanel }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0">
        <h2 className="j-title-line text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.1] tracking-[-0.03em]">
          {panel.titleBefore}
          <span className="text-gradient">{panel.titleHighlight}</span>
          {panel.titleAfter}
        </h2>
        {panel.subtitle && (
          <p className="j-text mt-2.5 text-[15px] leading-[1.8] tracking-[0.01em] text-mist/75 md:text-base">
            {panel.subtitle}
          </p>
        )}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2 md:gap-4">
          {panel.courseGroups?.map((g, i) => (
            <GlowCard key={g.label} index={i}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg]"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENTS[i % ACCENTS.length]}33, ${ACCENTS[i % ACCENTS.length]}11)`,
                  }}
                >
                  {g.icon}
                </div>
                <h3 className="text-[14px] font-black tracking-[0.12em] text-mist">
                  {g.label}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[12px] leading-tight text-mist/85 transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAPTER 02/03/04 · 技能卡片
// ============================================================
function SkillsContent({ panel }: { panel: JourneyPanel }) {
  const count = panel.skillCards?.length ?? 0;
  const gridClass = count > 4 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0">
        <h2 className="j-title-line text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.1] tracking-[-0.03em]">
          {panel.titleBefore}
          <span className="text-gradient">{panel.titleHighlight}</span>
          {panel.titleAfter}
        </h2>
        {panel.subtitle && (
          <p className="j-text mt-2.5 max-w-2xl text-[15px] leading-[1.8] tracking-[0.01em] text-mist/75 md:text-base">
            {panel.subtitle}
          </p>
        )}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className={`grid grid-cols-1 gap-3 pb-2 ${gridClass} md:gap-4`}>
          {panel.skillCards?.map((s, i) => (
            <GlowCard key={s.title} index={i}>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[8deg] md:h-11 md:w-11 md:text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENTS[i % ACCENTS.length]}33, ${ACCENTS[i % ACCENTS.length]}11)`,
                  }}
                >
                  {s.icon}
                </div>
                <h3 className="text-[14px] font-black tracking-[-0.01em] text-mist md:text-[15px]">
                  {s.title}
                </h3>
              </div>
              <p className="mb-3 text-[13.5px] leading-[1.75] tracking-[0.005em] text-dim/90">
                {s.desc}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10.5px] tracking-wider text-dim/90 transition-colors duration-300 group-hover:bg-white/[0.1] group-hover:text-mist"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAPTER 05 · 我的特质
// ============================================================
function TraitsContent({ panel }: { panel: JourneyPanel }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-shrink-0">
        <h2 className="j-title-line text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.1] tracking-[-0.03em]">
          {panel.titleBefore}
          <span className="text-gradient">{panel.titleHighlight}</span>
          {panel.titleAfter}
        </h2>
        {panel.subtitle && (
          <p className="j-text mt-2.5 max-w-2xl text-[15px] leading-[1.8] tracking-[0.01em] text-mist/75 md:text-base">
            {panel.subtitle}
          </p>
        )}
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2">
          {panel.traits?.map((t, i) => (
            <GlowCard key={t.title} index={i}>
              <div className="mb-3 text-4xl transition-transform duration-700 group-hover:rotate-[12deg] group-hover:scale-125 md:text-5xl">
                {t.icon}
              </div>
              <h3 className="text-[16px] font-black tracking-[-0.01em] text-mist md:text-[17px]">
                {t.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-[1.8] tracking-[0.005em] text-dim/90">
                {t.desc}
              </p>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 构建面板入场 timeline
// ============================================================
function buildPanelTimeline(panel: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  const chapter = panel.querySelector(".j-chapter");
  const shapes = panel.querySelectorAll(".j-shape");
  const titleLines = panel.querySelectorAll(".j-title-line");
  const texts = panel.querySelectorAll(".j-text");
  const cards = panel.querySelectorAll(".j-card");
  const nums = panel.querySelectorAll<HTMLElement>(".j-num");

  // 初始状态：全部隐藏
  if (chapter) gsap.set(chapter, { x: -60, opacity: 0 });
  if (shapes.length) gsap.set(shapes, { scale: 0, rotate: -180, opacity: 0 });
  if (titleLines.length)
    gsap.set(titleLines, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
  if (texts.length) gsap.set(texts, { y: 24, opacity: 0 });
  if (cards.length)
    gsap.set(cards, {
      y: 70,
      opacity: 0,
      rotateX: -25,
      transformPerspective: 1000,
      transformOrigin: "50% 100%",
    });

  // 0.00s · 章节标签滑入
  if (chapter) {
    tl.to(chapter, { x: 0, opacity: 1, duration: 0.6 }, 0);
  }

  // 0.05s · 装饰形状
  if (shapes.length) {
    tl.to(
      shapes,
      {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: "back.out(2)",
      },
      0.05
    );
  }

  // 0.20s · 标题：声波揭示（clip-path）
  if (titleLines.length) {
    tl.to(
      titleLines,
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: "power4.out",
      },
      0.2
    );
  }

  // 0.35s · 副标题淡入
  if (texts.length) {
    tl.to(
      texts,
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 },
      0.35
    );
  }

  // 0.55s · 卡片 3D 翻转弹入
  if (cards.length) {
    tl.to(
      cards,
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.85,
        stagger: { each: 0.08, from: "start" },
        ease: "back.out(1.4)",
      },
      0.55
    );
  }

  // 0.85s · 数字计数器
  nums.forEach((numEl) => {
    const target = Number(numEl.dataset.value || 0);
    const counter = { v: 0 };
    tl.to(
      counter,
      {
        v: target,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          numEl.textContent = String(Math.round(counter.v));
        },
      },
      0.85
    );
  });

  return tl;
}

// ============================================================
// 主组件
// ============================================================
export default function JourneySection({
  onMounted,
}: {
  onMounted?: () => void;
}) {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let isCleanup = false;
    const observers: IntersectionObserver[] = [];

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const wrap = wrapRef.current!;
      const getDist = () => track.scrollWidth - window.innerWidth;

      // ① 横向滚动
      gsap.to(track, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => "+=" + (getDist() + window.innerHeight * 0.4),
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) {
              gsap.set(barRef.current, { scaleX: self.progress });
            }
            if (progressTextRef.current) {
              progressTextRef.current.textContent = String(
                Math.round(self.progress * 100)
              ).padStart(2, "0");
            }
          },
        },
      });

      ScrollTrigger.config({ ignoreMobileResize: true });

      // ② 面板入场：IntersectionObserver 只播一次
      const panels = gsap.utils.toArray<HTMLElement>(
        wrap.querySelectorAll(".j-panel")
      );

      panels.forEach((panel) => {
        const tl = buildPanelTimeline(panel);
        let played = false;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !played) {
              played = true;
              tl.play();
              observer.disconnect();
            }
          },
          { threshold: 0.05 }
        );
        observer.observe(panel);
        observers.push(observer);
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, wrapRef);

    const onLoad = () => {
      if (!isCleanup) ScrollTrigger.refresh();
    };
    window.addEventListener("load", onLoad);
    onMounted?.();

    return () => {
      isCleanup = true;
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [onMounted]);

  return (
    <section
      ref={wrapRef}
      id="journey"
      className="relative h-screen overflow-hidden bg-ink"
    >
      <div className="absolute left-0 top-0 z-30 h-1 w-full bg-white/5">
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-neon via-cyan to-pink"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-5 top-5 flex items-center gap-3 md:left-8 md:top-6">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_10px_rgba(56,225,255,1)]" />
          <span className="font-mono text-[11px] tracking-[0.4em] text-dim">
            QUICK INTRO
          </span>
        </div>

        <div className="absolute right-5 top-5 font-mono text-[11px] text-dim md:right-8 md:top-6">
          <span ref={progressTextRef}>00</span>
          <span className="text-dim/40"> / 100</span>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
          <p className="font-mono text-[10px] tracking-[0.35em] text-dim/70">
            继续滚动 · 画面将向右流动
          </p>
          <div className="flex items-center gap-1">
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan/60" />
            <span className="h-1 w-6 rounded-full bg-linear-to-r from-cyan/40 via-cyan to-cyan/40" />
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan/60" />
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex h-full items-center gap-5 px-[6vw] will-change-transform md:gap-8"
        style={{ transform: "translateZ(0)" }}
      >
        {journeyPanels.map((p, i) => (
          <Panel key={i} panel={p} index={i} total={journeyPanels.length} />
        ))}
      </div>
    </section>
  );
}