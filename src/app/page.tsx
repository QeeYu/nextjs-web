// 页面入口（服务端组件）：组装三大区块
import HeroSection from "@/components/HeroSection";           // ① 首屏粒子 + QeeYu
import JourneySection from "@/components/JourneySection";     // ② 横向滚动长动画
import MainSection from "@/components/MainSection";           // ③ 主页（两页卡片）

export default function Home() {
  return (
    <main>
      <HeroSection />
      <JourneySection />
      <MainSection />
    </main>
  );
}