// 这里定义演示的内容模型与静态注册表。
// 路由和播放器只消费这些数据，不另外维护内容副本。
// 本模块不负责导航状态、Reveal 生命周期或具体视觉交互。
import { assetPath, type SectionSlug } from "../sections";

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

// 表示独立 deck 在所属分区列表中的公开摘要和排序信息。
export type SlideDeckListing = {
  topic: string;
  date: string;
  order: number;
};

// 表示确定会出现在分区列表中的 deck，listing 在这一边界之后必然存在。
export type ListedSlideDeckData = SlideDeckData & {
  listing: SlideDeckListing;
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
  section: SectionSlug;
  sectionTitle: string;
  sectionHref: string;
  listing?: SlideDeckListing;
  articleHref?: string;
  chapters: SlideChapter[];
  slides: SlideContent[];
};

// 表示可以直接交给客户端播放器的完整 deck，内容已在服务端准备完成。
export type RenderedSlideDeckData = Omit<SlideDeckData, "slides"> & {
  slides: RenderedSlideContent[];
};

// 作为全部公开演示的唯一注册表，同时驱动内容入口与静态路由。
export const slideDecks: SlideDeckData[] = [
  {
    slug: "component-guide",
    lang: "zh-CN",
    series: "RIN III / SOFTWARE ENGINEERING / COMPONENT GUIDE",
    title: "RIN III Slides 组件使用说明",
    description: "从注册、布局到 LaTeX、代码高亮与发布检查的一份可复用说明。",
    date: "2026 / 07 / 10",
    coverImage: assetPath("/entrance/engineering-maple.webp"),
    section: "software-engineering",
    sectionTitle: "Software Engineering",
    sectionHref: "/software-engineering",
    listing: {
      topic: "Site Components",
      date: "2026-07-10",
      order: 10,
    },
    chapters: [
      {
        id: "overview",
        label: "00",
        title: "Overview",
        summary: "模板边界与组成",
      },
      {
        id: "register",
        label: "01",
        title: "Register",
        summary: "新增一份 deck",
      },
      {
        id: "layouts",
        label: "02",
        title: "Layouts",
        summary: "按内容选择页面",
      },
      {
        id: "rich-content",
        label: "03",
        title: "Rich Content",
        summary: "公式与代码",
      },
      {
        id: "release",
        label: "04",
        title: "Release",
        summary: "检查与发布",
      },
    ],
    slides: [
      {
        kind: "cover",
        chapter: "overview",
        eyebrow: "SOFTWARE ENGINEERING / COMPONENT GUIDE",
        title: "RIN III Slides 组件使用说明",
        summary: "用一份数据注册内容，由同一个播放器负责桌面、手机、公式、代码和发布。",
        tags: ["REVEAL.JS", "KATEX", "SHIKI", "NEXT.JS"],
      },
      {
        kind: "cards",
        chapter: "overview",
        eyebrow: "OVERVIEW / THREE LAYERS",
        title: "内容、构建和播放各自只有一个职责",
        intro: "新增演示时只编写数据；公式与代码在构建期处理；交互状态统一交给播放器。",
        items: [
          {
            label: "01 / CONTENT",
            title: "decks.ts",
            body: "保存章节、页面内容、分区归属和列表摘要，是 deck 的唯一内容来源。",
          },
          {
            label: "02 / BUILD",
            title: "render-deck.ts",
            body: "在静态构建阶段把 LaTeX 和源码转换为 KaTeX 与 Shiki HTML。",
          },
          {
            label: "03 / PLAYER",
            title: "slide-deck.tsx",
            body: "负责章节跳转、键盘、触摸、进度、深链接、全屏和响应式外壳。",
          },
        ],
      },
      {
        kind: "flow",
        chapter: "register",
        eyebrow: "REGISTER / FOUR STEPS",
        title: "新增一份 deck 只需要四步",
        intro: "路由、播放器和响应式样式已经共用，不要为新内容复制组件。",
        items: [
          {
            label: "01",
            title: "注册元数据",
            body: "填写 slug、标题、父分区和列表摘要。",
          },
          {
            label: "02",
            title: "声明章节",
            body: "每个 chapter 使用稳定 id，并提供短标题与摘要。",
          },
          {
            label: "03",
            title: "组织页面",
            body: "根据内容意图选择现有 kind，并让每页只表达一个判断。",
          },
          {
            label: "04",
            title: "验证发布",
            body: "运行生产构建，并检查桌面、手机和最长内容页。",
          },
        ],
      },
      {
        kind: "contract",
        chapter: "register",
        eyebrow: "REGISTER / REQUIRED METADATA",
        title: "四组字段决定 deck 如何进入网站",
        intro: "这些字段属于内容契约；缺少父级或列表信息时，不应该依赖页面自行猜测。",
        items: [
          {
            label: "IDENTITY",
            title: "slug / title / lang",
            body: "决定公开 URL、分享标题和内容语言。",
          },
          {
            label: "HIERARCHY",
            title: "section / sectionHref",
            body: "保证任何深链接都能稳定返回所属分区。",
          },
          {
            label: "DISCOVERY",
            title: "listing",
            body: "独立 deck 通过 topic、date 和 order 进入分区列表。",
          },
          {
            label: "OPTIONAL",
            title: "articleHref",
            body: "只有确实存在补充文章时，播放器才显示书本入口。",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "layouts",
        eyebrow: "LAYOUTS / CHOOSE BY INTENT",
        title: "先判断内容关系，再选择布局",
        intro: "页面 kind 表达的是信息结构，而不是装饰风格。内容装不下时优先拆页。",
        columns: ["内容意图", "优先布局", "使用边界"],
        rows: [
          ["建立主题", "cover / closing", "只保留一个主判断"],
          ["并列或比较", "cards / matrix / contract", "控制在 2-4 个单元"],
          ["过程与检查", "flow / checklist", "步骤必须有明确顺序"],
          ["技术表达", "formula / code", "公式一条，代码约 12 行"],
        ],
      },
      {
        kind: "formula",
        chapter: "rich-content",
        eyebrow: "RICH CONTENT / LATEX",
        title: "公式页直接填写 LaTeX 本体",
        intro: "不需要 $ 或 $$。使用 String.raw 保留反斜杠，构建阶段由 KaTeX 校验并输出静态标记。",
        formula: String.raw`\det(A-\lambda I)=0 \quad\Longrightarrow\quad A\mathbf{v}=\lambda\mathbf{v}`,
        items: [
          {
            label: "SOURCE",
            title: "String.raw",
            body: String.raw`\det(A-\lambda I)=0`,
          },
          {
            label: "OUTPUT",
            title: "KaTeX HTML",
            body: "浏览器只负责显示，不在运行时解析公式。",
          },
        ],
      },
      {
        kind: "code",
        chapter: "rich-content",
        eyebrow: "RICH CONTENT / CODE",
        title: "代码页声明语言和源码即可",
        intro: "Shiki 在构建时完成 token 高亮；示例应保持短小，让观众无需滚动就能读完。",
        language: "typescript",
        code: `const deck = {
  slug: "example-deck",
  section: "mathematics",
  sectionTitle: "Mathematics",
  sectionHref: "/mathematics",
  listing: {
    topic: "Linear Algebra",
    date: "2026-07-10",
    order: 10,
  },
  slides: [{ kind: "cover", chapter: "opening" }],
} satisfies SlideDeckData;`,
        caption: "Language examples: typescript, python, yaml, json, bash.",
      },
      {
        kind: "checklist",
        chapter: "release",
        eyebrow: "RELEASE / CHECKLIST",
        title: "发布前检查这五件事",
        intro: "生产构建保护结构，浏览器检查保护真实阅读体验；两者缺一不可。",
        items: [
          "每个 slide 的 chapter 都引用了已注册的章节 id。",
          "父分区、列表入口和可选文章链接都能真实到达。",
          "最长标题、公式和代码在桌面与手机上没有溢出。",
          "深链接进入时，章节、计数器和画面保持同步。",
          "GitHub Pages base path 下的生产导出与测试全部通过。",
        ],
      },
      {
        kind: "closing",
        chapter: "release",
        eyebrow: "COMPONENT GUIDE / RIN III",
        title: "内容写在数据里，能力留在组件里",
        statement: "新增 deck 应该扩展内容，而不是复制播放器、路由或响应式状态。",
        note: "ONE CONTENT SOURCE / ONE PLAYER / STATIC OUTPUT",
      },
    ],
  },
];

// 按公开 slug 查找静态演示，路由层不重复维护另一份注册表。
export function getSlideDeck(slug: string) {
  return slideDecks.find((deck) => deck.slug === slug);
}

// 返回需要作为独立内容出现在指定分区列表中的 decks。
export function getListedSlideDecks(section: SectionSlug): ListedSlideDeckData[] {
  return slideDecks.filter(
    (deck): deck is ListedSlideDeckData => deck.section === section && deck.listing !== undefined,
  );
}
