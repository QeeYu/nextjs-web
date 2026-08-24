"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyPanels } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

/** 面板通用样式 */
const panelCls =
  "j-panel relative flex h-[60vh] w-[82vw] flex-shrink-0 flex-col items-center justify-center " +
  "rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm " +
  "md:h-[62vh] md:w-[48vw] md:p-10";

/** 每个面板的装饰图形（纯视觉，不放数据里） */
function PanelShapes({ index }: { index: number }) {
  switch (index) {
    case 0: return (<>
      <div className="j-shape absolute -left-3 top-10 md:-left-6"><div className="anim-blob h-20 w-20 rounded-full border-4 border-neon/50" /></div>
      <div className="j-shape absolute -right-3 bottom-14 md:-right-6"><div className="anim-spin-slow h-12 w-12 rounded-xl bg-linear-to-br from-cyan/60 to-pink/50 blur-[1px]" /></div>
    </>);
    case 1: return (<>
      <div className="j-shape absolute left-6 top-12"><div className="anim-spin-slow h-12 w-12 rounded-xl bg-linear-to-br from-neon to-cyan/60" /></div>
      <div className="j-shape absolute right-8 top-24"><div className="anim-blob h-9 w-9 rounded-full bg-pink/60" /></div>
      <div className="j-shape absolute bottom-10 left-1/3"><div className="anim-spin-slow h-14 w-14 rounded-2xl bg-linear-to-tr from-lime/60 to-cyan/50" style={{ animationDuration: "22s" }} /></div>
    </>);
    case 2: return (<>
      <div className="j-shape absolute left-8 top-10"><div className="anim-blob h-3 w-3 rounded-full bg-lime/80" /></div>
      <div className="j-shape absolute right-10 bottom-12"><div className="anim-blob h-2.5 w-2.5 rounded-full bg-neon/80" style={{ animationDelay: "1s" }} /></div>
    </>);
    case 3: return (<>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="j-shape"><div className="anim-spin-slow h-72 w-72 rounded-full border-2 border-dashed border-neon/30 md:h-80 md:w-80" /></div>
      </div>
      <div className="j-shape absolute left-[16%] top-[22%]"><div className="anim-blob h-3 w-3 rounded-full bg-cyan/90" /></div>
      <div className="j-shape absolute right-[14%] bottom-[20%]"><div className="anim-blob h-2.5 w-2.5 rounded-full bg-pink/90" style={{ animationDelay: "1.2s" }} /></div>
    </>);
    case 4: return (<>
      <div className="j-shape absolute -right-2 top-8 md:right-4"><div className="anim-spin-slow h-10 w-10 rounded-lg border-4 border-lime/50" /></div>
    </>);
    case 5: return (<>
      <div className="j-shape absolute left-8 top-14"><div className="anim-blob h-3 w-3 rounded-full bg-lime/80" /></div>
      <div className="j-shape absolute right-10 top-20"><div className="anim-blob h-2.5 w-2.5 rounded-full bg-cyan/80" style={{ animationDelay: ".8s" }} /></div>
      <div className="j-shape absolute bottom-16 right-16"><div className="anim-blob h-3.5 w-3.5 rounded-full bg-pink/70" style={{ animationDelay: "1.6s" }} /></div>
    </>);
    default: return null;
  }
}

export default function JourneySection({ onMounted }: { onMounted?: () => void } = {}) {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const getDist = () => trackRef.current!.scrollWidth - window.innerWidth;
      const horiz = gsap.to(trackRef.current, {
        x: () => -getDist(), ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current, start: "top top",
          end: () => "+=" + (getDist() + window.innerHeight * 0.5),
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress }); },
        },
      });
      ScrollTrigger.config({ ignoreMobileResize: true });

      const fromIf = (els: NodeListOf<HTMLElement>, vars: gsap.TweenVars) => { if (els.length > 0) gsap.from(els, vars); };

      const panels = gsap.utils.toArray<HTMLElement>(wrapRef.current!.querySelectorAll(".j-panel"));
      panels.forEach((panel) => {
        fromIf(panel.querySelectorAll<HTMLElement>(".j-title"), { y: 90, rotate: 8, opacity: 0, duration: 0.8, ease: "back.out(1.8)", scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 85%" } });
        fromIf(panel.querySelectorAll<HTMLElement>(".j-text"), { y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 72%" } });
        fromIf(panel.querySelectorAll<HTMLElement>(".j-shape"), { scale: 0, y: 60, rotate: -120, stagger: 0.12, duration: 0.9, ease: "back.out(2.2)", scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 82%" } });
      });
      gsap.utils.toArray<HTMLElement>(wrapRef.current!.querySelectorAll(".j-num")).forEach((numEl) => {
        const target = Number(numEl.dataset.value || 0);
        const counter = { v: 0 };
        gsap.to(counter, { v: target, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: numEl, containerAnimation: horiz, start: "left 78%" }, onUpdate: () => { numEl.textContent = String(Math.round(counter.v)); } });
      });
    }, wrapRef);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    // ★ 挂载完成通知（滚动恢复用）
    onMounted?.();
    return () => { ctx.revert(); window.removeEventListener("load", onLoad); };
  }, []);

  return (
    <section ref={wrapRef} id="journey" className="relative h-screen overflow-hidden bg-ink">
      {/* 进度条 */}
      <div className="absolute left-0 top-0 z-20 h-1 w-full bg-white/5">
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-neon via-cyan to-pink" />
      </div>
      <div className="absolute left-5 top-5 z-20 font-mono text-[11px] tracking-[0.35em] text-dim">JOURNEY →</div>
      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] tracking-[0.25em] text-dim">继续滚动 · 画面将向左流动</div>

      {/* 横向轨道 */}
      <div ref={trackRef} className="flex h-full items-center gap-6 pl-[6vw] pr-[12vw] will-change-transform md:gap-10">

        {/* ★ 数据驱动渲染所有面板 */}
        {journeyPanels.map((p, i) => (
          <div key={p.chapter} className={panelCls}>
            {/* 装饰图形（视觉元素，不放数据里） */}
            <PanelShapes index={i} />

            {/* 章节标签（颜色从 accent 字段读取） */}
            <p className={`j-text mb-4 font-mono text-[11px] tracking-[0.5em] ${p.accent}`}>{p.chapter}</p>

            {/* 标题（前半 + 高亮 + 后半） */}
            <h2 className="j-title text-3xl font-black md:text-5xl">
              {p.titleBefore}<span className="text-gradient">{p.titleHighlight}</span>{p.titleAfter}
            </h2>

            {/* 正文（whitespace-pre-line 支持 \n 换行） */}
            {p.text && (
              <p className="j-text mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base whitespace-pre-line">{p.text}</p>
            )}

            {/* 数字统计（面板 3 有） */}
            {p.stats && (
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4 md:gap-x-10">
                {p.stats.map((s) => (
                  <div key={s.label} className="j-text">
                    <div className="font-mono text-3xl font-black text-cyan md:text-4xl">
                      <span className="j-num" data-value={s.value}>0</span>
                      <span className="text-base text-mist">{s.suffix}</span>
                    </div>
                    <p className="mt-1 text-[11px] tracking-[0.3em] text-dim">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 技术词条（面板 5 有） */}
            {p.tags && (
              <div className="mt-8 flex max-w-md flex-wrap justify-center gap-2.5">
                {p.tags.map((t) => (
                  <span key={t} className="j-text rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-mist/90">{t}</span>
                ))}
              </div>
            )}

            {/* 向下箭头（最后一个面板） */}
            {i === journeyPanels.length - 1 && (
              <div className="j-shape mt-8">
                <div className="anim-float text-cyan drop-shadow-[0_0_12px_rgba(56,225,255,.8)]">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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