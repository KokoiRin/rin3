// Slides 子树只引入 Reveal 核心样式和演示模板样式，不影响文章页面。
import "reveal.js/reveal.css";
import "@/components/slides/slides.css";

// 为 slides 路由提供独立样式边界，不持有任何播放状态。
export default function SlidesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
