export const siteBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string) {
  return `${siteBasePath}${path}`;
}

export const sections = [
  {
    slug: "mathematics",
    title: "数学",
    english: "MATHEMATICS",
    flower: "樱花 · 观万象之理",
    image: assetPath("/entrance/math-sakura.png"),
    alt: "樱花环绕的山间数学观象台，几何轨迹在天空中延展",
    intro: "从定义出发，沿证明抵达结构。",
    topics: ["分析与代数", "几何与拓扑", "概率与统计"],
  },
  {
    slug: "computer-science",
    title: "计算机",
    english: "COMPUTER SCIENCE",
    flower: "莲花 · 探机器之心",
    image: assetPath("/entrance/computer-lotus.png"),
    alt: "莲池上的未来图书馆，电路与数据星图悬浮在夜空中",
    intro: "理解计算的边界，也理解机器如何思考。",
    topics: ["算法与数据结构", "系统与网络", "语言与智能"],
  },
  {
    slug: "software-engineering",
    title: "软件工程",
    english: "SOFTWARE ENGINEERING",
    flower: "枫叶 · 筑系统之城",
    image: assetPath("/entrance/engineering-maple.png"),
    alt: "枫林中的山间工坊城市，架构蓝图连接起层叠建筑",
    intro: "让复杂系统可理解、可演进、可长久维护。",
    topics: ["架构与设计", "质量与测试", "协作与交付"],
  },
] as const;

export type SectionSlug = (typeof sections)[number]["slug"];

export function getSection(slug: string) {
  return sections.find((section) => section.slug === slug);
}
