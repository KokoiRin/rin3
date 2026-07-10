// 这里定义演示的内容模型与静态注册表。
// 路由和播放器只消费这些数据，不另外维护内容副本。
// 本模块不负责导航状态、Reveal 生命周期或具体视觉交互。
import { assetPath } from "../sections";

// 表示侧栏中的一个章节，以及它在演示中的稳定标识。
export type SlideChapter = {
  id: string;
  label: string;
  title: string;
  summary: string;
};

// 表示卡片、流程节点或契约字段等可复用的内容单元。
export type SlideItem = {
  label?: string;
  title: string;
  body: string;
};

// 表示一页演示的共用元数据和所属章节。
type SlideBase = {
  chapter: string;
  eyebrow: string;
  title: string;
};

// 表示 RIN III 模板当前支持的页面布局。
export type SlideContent =
  | (SlideBase & {
      kind: "cover";
      summary: string;
      tags: string[];
    })
  | (SlideBase & {
      kind: "cards";
      intro: string;
      items: SlideItem[];
    })
  | (SlideBase & {
      kind: "matrix";
      intro: string;
      columns: [string, string, string];
      rows: Array<[string, string, string]>;
    })
  | (SlideBase & {
      kind: "flow";
      intro: string;
      items: SlideItem[];
    })
  | (SlideBase & {
      kind: "contract";
      intro: string;
      items: SlideItem[];
    })
  | (SlideBase & {
      kind: "checklist";
      intro: string;
      items: string[];
    })
  | (SlideBase & {
      kind: "formula";
      intro: string;
      formula: string;
      items: SlideItem[];
    })
  | (SlideBase & {
      kind: "code";
      intro: string;
      language: string;
      code: string;
      caption?: string;
    })
  | (SlideBase & {
      kind: "closing";
      statement: string;
      note: string;
    });

// 表示公式和代码已经在构建阶段转成安全静态 HTML 的播放数据。
export type RenderedSlideContent =
  | Exclude<SlideContent, { kind: "formula" | "code" }>
  | (Extract<SlideContent, { kind: "formula" | "code" }> & { html: string });

// 表示一份可被通用播放器消费并静态生成的完整演示。
export type SlideDeckData = {
  slug: string;
  lang: "en" | "zh-CN";
  series: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  articleHref: string;
  chapters: SlideChapter[];
  slides: SlideContent[];
};

// 表示可以直接交给客户端播放器的完整 deck，内容已在服务端准备完成。
export type RenderedSlideDeckData = Omit<SlideDeckData, "slides"> & {
  slides: RenderedSlideContent[];
};

// 作为全部公开演示的唯一注册表，同时驱动内容入口与静态路由。
export const slideDecks = [
  {
    slug: "interface-contracts",
    lang: "zh-CN",
    series: "RIN III / SOFTWARE ENGINEERING / 01",
    title: "流程清楚，接口却模糊",
    description: "为什么知道工作流之后，把它变成 Skill 仍然困难？",
    date: "2026 / 07 / 10",
    coverImage: assetPath("/entrance/engineering-maple.webp"),
    articleHref: "/software-engineering/when-workflows-are-clear-but-interfaces-are-not",
    chapters: [
      {
        id: "opening",
        label: "00",
        title: "Opening",
        summary: "知道路径为什么还不够",
      },
      {
        id: "ambiguity",
        label: "01",
        title: "The Ambiguity",
        summary: "触发、输入与输出",
      },
      {
        id: "contract",
        label: "02",
        title: "The Contract",
        summary: "把经验变成可执行协议",
      },
      {
        id: "test",
        label: "03",
        title: "The Test",
        summary: "自动化之前的四个问题",
      },
      {
        id: "closing",
        label: "04",
        title: "Closing",
        summary: "让模糊变得有限",
      },
    ],
    slides: [
      {
        kind: "cover",
        chapter: "opening",
        eyebrow: "SOFTWARE ENGINEERING / FIELD NOTE 01",
        title: "流程清楚，接口却模糊",
        summary: "我明明知道该做什么，为什么把它变成 Skill 后仍然困难？",
        tags: ["WORKFLOW", "SKILL", "INTERFACE", "CONTRACT"],
      },
      {
        kind: "cards",
        chapter: "opening",
        eyebrow: "OPENING / THE GAP",
        title: "知道路径，不等于能够沿着路径行动",
        intro: "一张流程图描述了顺序，却没有自动补齐每一步的判断边界。",
        items: [
          {
            label: "01 / MAP",
            title: "流程告诉我们去哪",
            body: "理解问题、检查状态、选择方案、执行修改、验证结果。",
          },
          {
            label: "02 / JUDGMENT",
            title: "经验负责跨过缝隙",
            body: "人会依靠上下文和直觉，判断什么证据已经足够。",
          },
          {
            label: "03 / INTERFACE",
            title: "Skill 需要明确边界",
            body: "它必须知道何时接手、拿到什么、交付什么，以及何时停止。",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "ambiguity",
        eyebrow: "PART 01 / THREE BOUNDARIES",
        title: "困难集中在三个接口上",
        intro: "模糊不是一个抽象问题，它会在三个具体位置进入系统。",
        columns: ["边界", "必须回答", "没有答案时"],
        rows: [
          ["触发 / Trigger", "什么时候应该调用？", "错误的问题进入系统"],
          ["输入 / Input", "执行前必须具备什么？", "执行者不断猜测上下文"],
          ["输出 / Output", "结束时必须交付什么？", "无法判断完成还是停笔"],
        ],
      },
      {
        kind: "flow",
        chapter: "ambiguity",
        eyebrow: "PART 01 / COMPOUNDING",
        title: "模糊性会沿着流程放大",
        intro: "更长的提示词可以描述更多行为，却不一定定义了接口。",
        items: [
          {
            label: "01",
            title: "错误触发",
            body: "不适合的任务首先进入系统。",
          },
          {
            label: "02",
            title: "隐含假设",
            body: "执行过程被迫补齐缺失上下文。",
          },
          {
            label: "03",
            title: "模糊交付",
            body: "结果听起来合理，却无法推动下一步。",
          },
          {
            label: "04",
            title: "无法验收",
            body: "团队分不清完成与继续分析。",
          },
        ],
      },
      {
        kind: "contract",
        chapter: "contract",
        eyebrow: "PART 02 / EXECUTABLE AGREEMENT",
        title: "Skill 需要的不是口号，而是契约",
        intro: "真正可复用的部分，是流程两侧稳定而窄的翻译层。",
        items: [
          {
            label: "USE WHEN",
            title: "Trigger",
            body: "描述可以进入系统的问题，并明确拒绝哪些开放探索。",
          },
          {
            label: "REQUIRED",
            title: "Input",
            body: "目标、相关证据、不可改变的约束，以及验收条件。",
          },
          {
            label: "DELIVER",
            title: "Output",
            body: "决策、具体产物、影响结果的假设，以及可执行下一步。",
          },
          {
            label: "STOP WHEN",
            title: "Completion",
            body: "验收通过，或一个被明确命名的外部依赖阻止继续。",
          },
        ],
      },
      {
        kind: "formula",
        chapter: "contract",
        eyebrow: "PART 02 / A TESTABLE SHAPE",
        title: "接口可以被写成一个函数",
        intro: "重点不是数学化一切，而是让输入、约束和交付物同时出现在同一个可检查的表达里。",
        formula: String.raw`\operatorname{Skill}(T, I, C) \longrightarrow (D, A, H, N)`,
        items: [
          {
            label: "T / I / C",
            title: "进入系统",
            body: "Trigger、Input、Constraints",
          },
          {
            label: "D / A / H / N",
            title: "离开系统",
            body: "Decision、Artifact、Hypotheses、Next step",
          },
        ],
      },
      {
        kind: "code",
        chapter: "test",
        eyebrow: "PART 03 / MACHINE-READABLE",
        title: "契约也可以成为可检查的结构",
        intro: "当同一份结构既能指导人，也能成为测试输入，Skill 才开始具备稳定复用的条件。",
        language: "yaml",
        code: `use_when:
  - goal_is_explicit
  - evidence_is_available
required:
  - target
  - constraints
deliver:
  - decision
  - artifact
  - assumptions
stop_when: accepted_or_blocked`,
        caption: "A compact contract can serve as documentation, input schema, and test fixture.",
      },
      {
        kind: "checklist",
        chapter: "test",
        eyebrow: "PART 03 / BEFORE AUTOMATION",
        title: "先问四个问题",
        intro: "如果这些问题很难回答，缺少的可能不是更多自动化，而是一个更清楚的接口。",
        items: [
          "我能否分别给出一个有效输入和一个无效输入？",
          "我能否不用“有帮助”“足够好”描述输出？",
          "下一个步骤能否不重新解释，直接消费这份结果？",
          "Skill 能否说明自己为什么在这里停止？",
        ],
      },
      {
        kind: "closing",
        chapter: "closing",
        eyebrow: "CLOSING / RIN III",
        title: "让模糊变得可见、有限，而且可以被测试",
        statement: "流程知识说明事情如何发生；接口知识决定它能否被稳定地执行。",
        note: "A thing does not become reusable merely because we call it a Skill.",
      },
    ],
  },
] satisfies SlideDeckData[];

// 按公开 slug 查找静态演示，路由层不重复维护另一份注册表。
export function getSlideDeck(slug: string) {
  return slideDecks.find((deck) => deck.slug === slug);
}
