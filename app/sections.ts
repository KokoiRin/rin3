export const siteBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string) {
  return `${siteBasePath}${path}`;
}

export const sections = [
  {
    slug: "mathematics",
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
    title: "Software Engineering",
    english: "SOFTWARE ENGINEERING",
    flower: "MAPLE / SYSTEMS IN MOTION",
    image: assetPath("/entrance/engineering-maple.webp"),
    alt: "An autumn mountain workshop where architectural plans connect layered structures",
    intro: "Designing software that remains legible as it grows.",
    topics: ["Architecture & Design", "Quality & Testing", "Collaboration & Delivery"],
  },
] as const;

export type SectionSlug = (typeof sections)[number]["slug"];

export function getSection(slug: string) {
  return sections.find((section) => section.slug === slug);
}
