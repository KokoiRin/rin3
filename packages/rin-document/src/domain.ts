// 这里定义 RIN 内容角色、视图投影和 Slides 表现三个彼此独立的领域概念。
// Markdown 仍由 remark 负责语法解析；本模块只保存跨投影必须稳定的业务语义。
// 角色拥有投影策略，避免每个 block 同时保存 role 与 targets 两份可能冲突的事实。

export const rinSlidePresentations = [
  "prose",
  "cards",
  "matrix",
  "flow",
  "contract",
  "checklist",
  "formula",
  "code",
  "closing",
] as const;

export type RinSlidePresentation = (typeof rinSlidePresentations)[number];
export type RinContentRole = "core" | "detail";
export type RinProjectionTarget = "article" | "slides";

export type RinContentBlock = {
  role: RinContentRole;
  markdown: string;
  line: number;
};

export type RinSlidePage = {
  presentation: RinSlidePresentation;
  chapter: string;
  eyebrow: string;
  blocks: RinContentBlock[];
  line: number;
};

const roleTargets: Record<RinContentRole, readonly RinProjectionTarget[]> = {
  core: ["article", "slides"],
  detail: ["article"],
};

// 投影只根据内容角色选择 block；字数、布局和运行时尺寸都不能改变内容可见性。
export function projectRinContent(
  blocks: readonly RinContentBlock[],
  target: RinProjectionTarget,
) {
  return blocks
    .filter((block) => roleTargets[block.role].includes(target))
    .map((block) => block.markdown)
    .filter(Boolean)
    .join("\n\n")
    .trim();
}
