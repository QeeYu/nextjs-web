"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册 ScrollTrigger 插件（全局一次即可）
gsap.registerPlugin(ScrollTrigger);

/** 旅程面板的通用样式（复用，减少重复代码） */
const panelCls =
  "j-panel relative flex h-[60vh] w-[82vw] flex-shrink-0 flex-col items-center justify-center " +
  "rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm " +
  "md:h-[62vh] md:w-[48vw] md:p-10";

/**
 * 旅程区块：滚动驱动的「横向长动画」
 * - 整个区块被 ScrollTrigger 钉住，纵向滚动 → 轨道整体向左移动
 * - 面板内元素：标题弹起、正文错峰浮现、图形跳跃/旋转、数字滚动计数
 * - 顶部进度条实时显示横向进度
 */
export default function JourneySection() {
  const wrapRef = useRef<HTMLElement>(null);     // 被钉住的外层区块
  const trackRef = useRef<HTMLDivElement>(null); // 横向轨道（GSAP 驱动 x 位移）
  const barRef = useRef<HTMLDivElement>(null);   // 顶部进度条

  useEffect(() => {
    // gsap.context：统一管理局内所有动画，卸载时 ctx.revert() 一键撤销
    const ctx = gsap.context(() => {
      // 横向总位移 = 轨道内容宽度 - 视口宽度（响应式，refresh 时重算）
      const getDist = () => trackRef.current!.scrollWidth - window.innerWidth;

      // —— 主时间线：钉住区块，scrub 让滚动平滑映射为位移 ——
      const horiz = gsap.to(trackRef.current, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => "+=" + (getDist() + window.innerHeight * 0.5), // 滚动距离略长，节奏从容
          pin: true,                 // 钉住整个区块
          scrub: 1,                  // 1 秒平滑追赶，手感丝滑
          anticipatePin: 1,
          invalidateOnRefresh: true, // 窗口尺寸变化后自动重算
          // 进度条随滚动进度缩放（加空值判断，杜绝 "target not found" 警告）
          onUpdate: (self) => {
            if (barRef.current) gsap.set(barRef.current, { scaleX: self.progress });
          },
        },
      });

      // 手机地址栏伸缩会触发 resize 抖动 → 忽略
      ScrollTrigger.config({ ignoreMobileResize: true });

      // ★ 小工具：目标列表为空时直接跳过
      //   （GSAP 收到空 NodeList / 空数组会在控制台打印 "target not found" 警告）
      const fromIf = (els: NodeListOf<HTMLElement>, vars: gsap.TweenVars) => {
        if (els.length > 0) gsap.from(els, vars);
      };

      // 收集全部面板
      const panels = gsap.utils.toArray<HTMLElement>(
        wrapRef.current!.querySelectorAll(".j-panel")
      );

      // —— 面板级动画：挂在 containerAnimation（横向容器时间轴）上 ——
      panels.forEach((panel) => {
        // 标题：弹起 + 轻微旋转入场（back 过冲 → 跳跃感）
        fromIf(panel.querySelectorAll<HTMLElement>(".j-title"), {
          y: 90, rotate: 8, opacity: 0, duration: 0.8, ease: "back.out(1.8)",
          scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 85%" },
        });
        // 正文 / 标签：错峰浮现
        fromIf(panel.querySelectorAll<HTMLElement>(".j-text"), {
          y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 72%" },
        });
        // 装饰图形：缩放弹出 + 大角度旋转跳跃
        fromIf(panel.querySelectorAll<HTMLElement>(".j-shape"), {
          scale: 0, y: 60, rotate: -120, stagger: 0.12, duration: 0.9, ease: "back.out(2.2)",
          scrollTrigger: { trigger: panel, containerAnimation: horiz, start: "left 82%" },
        });
      });

      // —— 数字滚动：进入视口时从 0 数到 data-value ——
      gsap.utils.toArray<HTMLElement>(
        wrapRef.current!.querySelectorAll(".j-num")
      ).forEach((numEl) => {
        const target = Number(numEl.dataset.value || 0);
        const counter = { v: 0 }; // 用对象属性做补间，onUpdate 写回 DOM
        gsap.to(counter, {
          v: target, duration: 1.6, ease: "power2.out",
          scrollTrigger: { trigger: numEl, containerAnimation: horiz, start: "left 78%" },
          onUpdate: () => { numEl.textContent = String(Math.round(counter.v)); },
        });
      });
    }, wrapRef);

    // 页面资源加载完成后刷新尺寸计算（图片/字体加载会改变高度）
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    // 卸载：撤销全部动画与 pin，移除监听
    return () => { ctx.revert(); window.removeEventListener("load", onLoad); };
  }, []);

  return (
    <section ref={wrapRef} id="journey" className="relative h-screen overflow-hidden bg-ink">

      {/* 顶部横向进度条（scaleX 由 onUpdate 驱动） */}
      <div className="absolute left-0 top-0 z-20 h-1 w-full bg-white/5">
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-neon via-cyan to-pink"
        />
      </div>

      {/* 左上角标识 */}
      <div className="absolute left-5 top-5 z-20 font-mono text-[11px] tracking-[0.35em] text-dim">
        JOURNEY →
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] tracking-[0.25em] text-dim">
        继续滚动 · 画面将向左流动
      </div>

      {/* 横向轨道：由 ScrollTrigger 驱动向左位移 */}
      <div
        ref={trackRef}
        className="flex h-full items-center gap-6 pl-[6vw] pr-[12vw] will-change-transform md:gap-10"
      >

        {/* ========== 面板 1：开场 ==========
            注意：装饰图形采用「双层结构」——
            外层 div 挂 .j-shape，由 GSAP 负责跳跃登场；
            内层 div 挂 CSS 动画类，负责持续漂浮/旋转。
            两层分离，避免 CSS 动画覆盖 GSAP 的 transform。 */}
        <div className={panelCls}>
          {/* 装饰：漂浮的渐变圆环 */}
          <div className="j-shape absolute -left-3 top-10 md:-left-6">
            <div className="anim-blob h-20 w-20 rounded-full border-4 border-neon/50" />
          </div>
          {/* 装饰：旋转的渐变方块 */}
          <div className="j-shape absolute -right-3 bottom-14 md:-right-6">
            <div className="anim-spin-slow h-12 w-12 rounded-xl bg-linear-to-br from-cyan/60 to-pink/50 blur-[1px]" />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-cyan">CHAPTER 01</p>
          <h2 className="j-title text-3xl font-black md:text-5xl">
            一切，<span className="text-gradient">从这里开始</span>
          </h2>
          <p className="j-text mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base">
            欢迎来到 QeeYu 的小宇宙 ✨<br />
            这段向左流动的画面，是我送你的开场动画 ——<br />
            请系好安全带，我们出发。
          </p>
        </div>

        {/* ========== 面板 2：热爱 ========== */}
        <div className={panelCls}>
          {/* 三块小图形：不同转速 / 漂移节奏 → 灵动跳跃 */}
          <div className="j-shape absolute left-6 top-12">
            <div className="anim-spin-slow h-12 w-12 rounded-xl bg-linear-to-br from-neon to-cyan/60" />
          </div>
          <div className="j-shape absolute right-8 top-24">
            <div className="anim-blob h-9 w-9 rounded-full bg-pink/60" />
          </div>
          <div className="j-shape absolute bottom-10 left-1/3">
            {/* animationDuration 覆写：错开节奏，避免「齐步走」的呆板感 */}
            <div
              className="anim-spin-slow h-14 w-14 rounded-2xl bg-linear-to-tr from-lime/60 to-cyan/50"
              style={{ animationDuration: "22s" }}
            />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-pink">CHAPTER 02 · 热爱</p>
          <h2 className="j-title text-3xl font-black md:text-5xl">
            为热爱 <span className="text-gradient">发电</span> 🔥
          </h2>
          <p className="j-text mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base">
            白天写代码，晚上调动画；<br />
            把每一个像素，都当作作品来雕琢。
          </p>
        </div>

        {/* ========== 面板 3：数字（滚动计数） ========== */}
        <div className={panelCls}>
          {/* ★ 装饰：两颗漂浮彩点（同时保证 .j-shape 选择器非空） */}
          <div className="j-shape absolute left-8 top-10">
            <div className="anim-blob h-3 w-3 rounded-full bg-lime/80" />
          </div>
          <div className="j-shape absolute right-10 bottom-12">
            <div className="anim-blob h-2.5 w-2.5 rounded-full bg-neon/80" style={{ animationDelay: "1s" }} />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-lime">CHAPTER 03 · 数字</p>
          <h2 className="j-title text-3xl font-black md:text-5xl">
            一些<span className="text-gradient">奇怪的统计</span> 📊
          </h2>

          {/* 四宫格统计：数字随滚动从 0 滚到目标值（见上方 .j-num 补间） */}
          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4 md:gap-x-10">
            {[
              { v: 20000, suffix: "+", label: "行代码" },
              { v: 1024,  suffix: " 杯", label: "咖啡" },
              { v: 9999,  suffix: " 个", label: "灵感" },
              { v: 365,   suffix: " 天", label: "热爱" },
            ].map((s) => (
              <div key={s.label} className="j-text">
                <div className="font-mono text-3xl font-black text-cyan md:text-4xl">
                  {/* j-num：进入视口时数字滚动；data-value 为目标值 */}
                  <span className="j-num" data-value={s.v}>0</span>
                  <span className="text-base text-mist">{s.suffix}</span>
                </div>
                <p className="mt-1 text-[11px] tracking-[0.3em] text-dim">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== 面板 4：哲学 ========== */}
        <div className={panelCls}>
          {/* 居中大虚线环：持续慢转（文字压其上，故文字加 relative 提高层级） */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="j-shape">
              <div className="anim-spin-slow h-72 w-72 rounded-full border-2 border-dashed border-neon/30 md:h-80 md:w-80" />
            </div>
          </div>
          {/* 环绕的小卫星点 */}
          <div className="j-shape absolute left-[16%] top-[22%]">
            <div className="anim-blob h-3 w-3 rounded-full bg-cyan/90" />
          </div>
          <div className="j-shape absolute right-[14%] bottom-[20%]">
            <div className="anim-blob h-2.5 w-2.5 rounded-full bg-pink/90" style={{ animationDelay: "1.2s" }} />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-cyan">CHAPTER 04 · 哲学</p>
          <h2 className="j-title relative text-3xl font-black md:text-5xl">
            动画，是页面的<span className="text-gradient">呼吸</span> 🌬️
          </h2>
          <p className="j-text relative mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base">
            一次缓动、一帧延迟、一点过冲，<br />
            都是人机之间无声的悄悄话。
          </p>
        </div>

        {/* ========== 面板 5：工具箱 ========== */}
        <div className={panelCls}>
          {/* 角落旋转的空心方框 */}
          <div className="j-shape absolute -right-2 top-8 md:right-4">
            <div className="anim-spin-slow h-10 w-10 rounded-lg border-4 border-lime/50" />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-neon">CHAPTER 05 · 装备</p>
          <h2 className="j-title text-3xl font-black md:text-5xl">
            我的<span className="text-gradient">工具箱</span> 🧰
          </h2>

          {/* 技术词条：错峰浮现（.j-text 被 GSAP stagger 捕获） */}
          <div className="mt-8 flex max-w-md flex-wrap justify-center gap-2.5">
            {["React", "Next.js", "TypeScript", "Tailwind", "GSAP", "anime.js", "Canvas", "Node.js"].map((t) => (
              <span
                key={t}
                className="j-text rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-mist/90"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ========== 面板 6：抵达（过渡到主页） ========== */}
        <div className={panelCls}>
          {/* 彩点装饰：不同延迟漂浮 */}
          <div className="j-shape absolute left-8 top-14">
            <div className="anim-blob h-3 w-3 rounded-full bg-lime/80" />
          </div>
          <div className="j-shape absolute right-10 top-20">
            <div className="anim-blob h-2.5 w-2.5 rounded-full bg-cyan/80" style={{ animationDelay: ".8s" }} />
          </div>
          <div className="j-shape absolute bottom-16 right-16">
            <div className="anim-blob h-3.5 w-3.5 rounded-full bg-pink/70" style={{ animationDelay: "1.6s" }} />
          </div>

          <p className="j-text mb-4 font-mono text-[11px] tracking-[0.5em] text-pink">CHAPTER 06 · 抵达</p>
          <h2 className="j-title text-3xl font-black md:text-5xl">
            欢迎来到<span className="text-gradient">我的主页</span> 🎉
          </h2>
          <p className="j-text mt-5 max-w-sm text-sm leading-relaxed text-dim md:text-base">
            开场动画到此结束，<br />
            故事才刚刚开始 —— 继续下滑，去认识一个更完整的 QeeYu。
          </p>

          {/* 向下大箭头：登场时弹跳，随后持续浮动 */}
          <div className="j-shape mt-8">
            <div className="anim-float text-cyan drop-shadow-[0_0_12px_rgba(56,225,255,.8)]">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 4v14m0 0l-6-6m6 6l6-6"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

      </div>
      {/* <!-- 横向轨道结束 --> */}
    </section>
  );
}