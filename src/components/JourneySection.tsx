"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyPanels } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

const panelCls =
  "j-panel relative flex h-[60vh] w-[82vw] flex-shrink-0 flex-col items-center justify-center " +
  "rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm " +
  "md:h-[62vh] md:w-[48vw] md:p-10";

// ============================================================
// ★ 主组件（最原始版本）
// ============================================================
export default function JourneySection({ onMounted }: { onMounted?: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCleanup = false;

    const ctx = gsap.context(() => {
      const getDist = () => trackRef.current!.scrollWidth - window.innerWidth;

      const horiz = gsap.to(trackRef.current, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => "+=" + (getDist() + window.innerHeight * 0.5),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress });
          },
        },
      });

      ScrollTrigger.config({ ignoreMobileResize: true });

      const fromIf = (els: NodeListOf<HTMLElement>, vars: gsap.TweenVars) => {
        if (els.length > 0) gsap.from(els, vars);
      };

      const panels = gsap.utils.toArray<HTMLElement>(wrapRef.current!.querySelectorAll(".j-panel"));

      panels.forEach((panel) => {
        // 标题
        fromIf(panel.querySelectorAll<HTMLElement>(".j-title"), {
          y: 100,
          rotate: 10,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horiz,
            start: "left 85%",
          },
        });

        // 正文
        fromIf(panel.querySelectorAll<HTMLElement>(".j-text"), {
          y: 50,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horiz,
            start: "left 72%",
          },
        });

        // 形状
        fromIf(panel.querySelectorAll<HTMLElement>(".j-shape"), {
          scale: 0,
          y: 80,
          rotate: -150,
          stagger: 0.06,
          duration: 0.85,
          ease: "back.out(2.2)",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horiz,
            start: "left 82%",
          },
        });
      });

      // 数字计数器
      gsap.utils.toArray<HTMLElement>(wrapRef.current!.querySelectorAll(".j-num")).forEach((numEl) => {
        const target = Number(numEl.dataset.value || 0);
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: numEl,
            containerAnimation: horiz,
            start: "left 78%",
          },
          onUpdate: () => {
            numEl.textContent = String(Math.round(counter.v));
          },
        });
      });

    }, wrapRef);

    const onLoad = () => {
      if (!isCleanup) ScrollTrigger.refresh();
    };
    window.addEventListener("load", onLoad);

    onMounted?.();

    return () => {
      isCleanup = true;
      window.removeEventListener("load", onLoad);
      // 稳健清理
      const sts = ScrollTrigger.getAll();
      sts.forEach(st => st.disable());
      sts.forEach(st => st.kill());
      ctx.revert();
    };
  }, [onMounted]);

  return (
    <section ref={wrapRef} id="journey" className="relative h-screen overflow-hidden bg-ink">
      {/* 进度条 */}
      <div className="absolute left-0 top-0 z-20 h-1 w-full bg-white/5">
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-neon via-cyan to-pink" />
      </div>

      <div className="absolute left-5 top-5 z-20 font-mono text-[11px] tracking-[0.35em] text-dim">JOURNEY →</div>
      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] tracking-[0.25em] text-dim">
        继续滚动 · 画面将向左流动
      </div>

      {/* 横向轨道 */}
      <div ref={trackRef} className="flex h-full items-center gap-6 pl-[6vw] pr-[12vw] will-change-transform md:gap-10">
        {journeyPanels.map((p, i) => (
          <div key={p.chapter} className={panelCls}>
            {/* 面板内置装饰（只有两个基础形状） */}
            <div className="j-shape absolute -left-3 top-10 md:-left-6">
              <div className="anim-blob h-20 w-20 rounded-full border-4 border-neon/50" />
            </div>
            <div className="j-shape absolute -right-3 bottom-14 md:-right-6">
              <div className="anim-spin-slow h-12 w-12 rounded-xl bg-linear-to-br from-cyan/60 to-pink/50 blur-[1px]" />
            </div>

            <p className={`j-text mb-4 font-mono text-[11px] tracking-[0.5em] ${p.accent}`}>
              {p.chapter}
            </p>

            <h2 className="j-title text-3xl font-black md:text-5xl">
              {p.titleBefore}
              <span className="text-gradient">{p.titleHighlight}</span>
              {p.titleAfter}
            </h2>

            {p.text && (
              <p className="j-text mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base whitespace-pre-line">
                {p.text}
              </p>
            )}

            {p.stats && (
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4 md:gap-x-10">
                {p.stats.map((s) => (
                  <div key={s.label} className="j-text">
                    <div className="font-mono text-3xl font-black text-cyan md:text-4xl">
                      <span className="j-num" data-value={s.value}>
                        0
                      </span>
                      <span className="text-base text-mist">{s.suffix}</span>
                    </div>
                    <p className="mt-1 text-[11px] tracking-[0.3em] text-dim">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {p.tags && (
              <div className="mt-8 flex max-w-md flex-wrap justify-center gap-2.5">
                {p.tags.map((t) => (
                  <span key={t} className="j-text rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-mist/90">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {i === journeyPanels.length - 1 && (
              <div className="j-shape mt-8">
                <div className="anim-float text-cyan drop-shadow-[0_0_12px_rgba(56,225,255,.8)]">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 4v14m0 0l-6-6m6 6l6-6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}