// 网站分区、部署 base path 与资源 URL 都由宿主拥有。
// 可移植文档 package 只保存中立 section id 和原始资源引用，不依赖这里。
export const siteBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 站内根路径使用部署前缀，外部或相对资源保持作者提供的原地址。
export function assetPath(path: string) {
  return path.startsWith("/") ? `${siteBasePath}${path}` : path;
}

export const learningSections = [
  {
    slug: "mathematics",
    kind: "learning",
    title: "Mathematics",
    english: "MATHEMATICS",
    flower: "SAKURA / THE LOGIC OF FORM",
    image: assetPath("/entrance/math-sakura.webp"),
    alt: "A mountain observatory framed by sakura, with geometric paths crossing the sky",
    intro: "From axioms to structure, one proof at a time.",
    topics: ["Analysis & Algebra", "Geometry & Topology", "Probability & Statistics"],
  },
  {
    slug: "computer-science",
    kind: "learning",
    title: "Computer Science",
    english: "COMPUTER SCIENCE",
    flower: "LOTUS / THE ART OF COMPUTATION",
    image: assetPath("/entrance/computer-lotus.webp"),
    alt: "A luminous library above a lotus pond with circuits suspended in the night sky",
    intro: "Exploring what can be computed and how machines make it real.",
    topics: ["Algorithms & Data", "Systems & Networks", "Languages & Intelligence"],
  },
  {
    slug: "software-engineering",
    kind: "learning",
    title: "Software Engineering",
    english: "SOFTWARE ENGINEERING",
    flower: "MAPLE / SYSTEMS IN MOTION",
    image: assetPath("/entrance/engineering-maple.webp"),
    alt: "An autumn mountain workshop where architectural plans connect layered structures",
    intro: "Designing software that remains legible as it grows.",
    topics: ["Architecture & Design", "Quality & Testing", "Collaboration & Delivery"],
  },
] as const;

// 额外分区沿用文章基础设施，但不计入首页的三门学科。
export const personalSection = {
  slug: "me",
  kind: "personal",
  title: "Me",
  english: "BECOMING",
  flower: "SNOW / THE QUIET WORK OF BECOMING",
  image: assetPath("/entrance/winter-path.webp"),
  alt: "A trail of footprints crosses a snowy mountain retreat toward a single warm pavilion",
  intro: "Notes on choosing, changing, and becoming more fully myself.",
  topics: ["Reflections", "Choices", "Practices"],
} as const;

export const sections = [...learningSections, personalSection] as const;

export type SectionSlug = (typeof sections)[number]["slug"];

export function getSection(slug: string) {
  return sections.find((section) => section.slug === slug);
}
