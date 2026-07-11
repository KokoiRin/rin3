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
  // 这份学习笔记沿原对话的提问顺序展开，让读者从具体例子逐步形成可定义性的完整概念。
  {
    slug: "model-theory-for-software-engineering",
    lang: "zh-CN",
    series: "RIN III / MATHEMATICS / DEFINABILITY",
    title: "模型论中的可定义性",
    description: "沿着一次学习对话，逐步理解语言如何在结构中定义元素、集合与关系。",
    date: "2026 / 07 / 12",
    coverImage: assetPath("/entrance/math-sakura.webp"),
    section: "mathematics",
    sectionTitle: "Mathematics",
    sectionHref: "/mathematics",
    listing: {
      topic: "Model Theory / Definability",
      date: "2026-07-12",
      order: 20,
    },
    chapters: [
      { id: "start", label: "00", title: "Start with Order", summary: "从后继关系开始" },
      { id: "language", label: "01", title: "Language Limits", summary: "能说什么，不能说什么" },
      { id: "definition", label: "02", title: "Definability", summary: "公式如何挑出集合" },
      { id: "parameters", label: "03", title: "Parameters", summary: "直接点名还是自行定位" },
      { id: "synthesis", label: "04", title: "Put It Together", summary: "把概念连成一条线" },
    ],
    slides: [
      {
        kind: "cover",
        chapter: "start",
        eyebrow: "MATHEMATICS / MODEL THEORY / DEFINABILITY",
        title: "模型论中的可定义性",
        summary: "沿着一次真实的学习过程，理解公式怎样在一个结构中准确挑出元素、集合与关系。",
        tags: ["ORDER", "LANGUAGE", "FORMULA", "PARAMETERS"],
      },
      {
        kind: "formula",
        chapter: "start",
        eyebrow: "START / SUCCESSOR FROM ORDER",
        title: "第一步：只用 <，怎样说 y 是 x 的后继",
        intro: "先写出 x < y，再排除它们之间还存在别的元素。这是对话中第一次用已有语言表达一个新关系。",
        formula: String.raw`S(x,y)\;\equiv\;x<y\land\neg\exists z\,(x<z\land z<y)`,
        items: [
          { label: "VISIBLE SYMBOL", title: "语言里只有 <", body: "公式不能直接使用“后继”这个新符号，只能使用结构已经提供的顺序关系。" },
          { label: "NEW RELATION", title: "公式定义 S", body: "所有满足公式的二元组 (x,y)，恰好组成后继关系。" },
        ],
      },
      {
        kind: "cards",
        chapter: "start",
        eyebrow: "START / PROPERTY VERSUS EXISTENCE",
        title: "能写出性质，不代表结构里一定有满足它的元素",
        intro: "“最大自然数”帮助我们分清：公式是否能表达一个性质，与是否存在对象满足它，是两个问题。",
        items: [
          { label: "THE FORMULA", title: "可以表达“最大”", body: "¬∃y(x < y) 是一条合法公式，意思是没有元素比 x 更大。" },
          { label: "THE STRUCTURE", title: "自然数里没有最大元", body: "在 (ℕ,<) 中，每个 x 都有更大的数，因此没有任何元素满足这条公式。" },
          { label: "THE RESULT", title: "它定义了空集", body: "公式仍然定义了一个集合，只是满足它的元素集合恰好为空。" },
        ],
      },
      {
        kind: "matrix",
        chapter: "language",
        eyebrow: "LANGUAGE / RELATIVE EXPRESSIVE POWER",
        title: "第二步：同一个概念，换一种语言，答案可能改变",
        intro: "“可定义”总要同时说明语言和结构；不能脱离它们单独判断。",
        columns: ["目标", "在 (ℕ,<) 中", "在更丰富的语言中"],
        rows: [
          ["后继关系", "可定义：排除中间元素", "仍然可定义"],
          ["质数集合", "仅靠顺序无法区分", "有乘法后可以描述因子"],
          ["偶数集合", "仅靠后继不能用有限公式反复走两步", "有加法后可写 ∃y(x=y+y)"],
          ["最大元素", "公式可写，但定义出空集", "是否非空仍取决于结构"],
        ],
      },
      {
        kind: "cards",
        chapter: "language",
        eyebrow: "LANGUAGE / A COMMON FALSE START",
        title: "“从 0 开始反复走两次后继”还不是一阶定义",
        intro: "这个想法能够生成偶数，但它描述的是一个无限执行过程，而不是一条有限的一阶公式。",
        items: [
          { label: "PROCEDURE", title: "生成方法", body: "0、S(S(0))、S(S(S(S(0))))……需要不断重复同一个步骤。" },
          { label: "FORMULA", title: "一阶公式", body: "必须是一段有限表达式，不能直接说“重复任意多次”或使用传递闭包。" },
          { label: "RICHER LANGUAGE", title: "加入加法", body: "有了 +，偶数可一次写成 ∃y(x = y + y)，无限重复被压缩进一个见证 y。" },
        ],
      },
      {
        kind: "formula",
        chapter: "definition",
        eyebrow: "DEFINITION / THE CORE IDEA",
        title: "第三步：可定义，就是存在一条公式把目标集合恰好挑出来",
        intro: "固定语言 L 和结构 M。若 φ 对 A 中元素为真、对其余元素为假，A 就在 M 中可定义。",
        formula: String.raw`A=\{a\in M^n\mid M\models\varphi(a)\}`,
        items: [
          { label: "FORMULA / φ", title: "筛选条件", body: "φ 使用语言 L 中允许的符号，并留下 n 个自由变量。" },
          { label: "EXACT MATCH", title: "不多不少", body: "公式的所有满足者必须与目标 A 完全一致，才算定义成功。" },
        ],
      },
      {
        kind: "formula",
        chapter: "definition",
        eyebrow: "DEFINITION / NEGATION",
        title: "把公式取反，就定义了原集合的补集",
        intro: "如果 φ(x) 定义 A，那么 ¬φ(x) 对且仅对 A 之外的元素为真。",
        formula: String.raw`M\setminus A=\{a\in M\mid M\models\neg\varphi(a)\}`,
        items: [
          { label: "A", title: "满足 φ 的元素", body: "公式 φ 把这些元素挑进集合 A。" },
          { label: "COMPLEMENT", title: "不满足 φ 的元素", body: "否定公式不需要重新寻找定义，直接挑出 M 中剩余的元素。" },
        ],
      },
      {
        kind: "cards",
        chapter: "parameters",
        eyebrow: "PARAMETERS / THE CONFUSION ABOUT FIVE",
        title: "第四步：先分清“5 这个对象”与“语言里能否直接写 5”",
        intro: "结构中的元素一直存在；参数讨论的是公式能不能直接引用那个元素。",
        items: [
          { label: "OBJECT", title: "5 是结构中的元素", body: "无论语言有没有名字，5 都已经属于自然数结构的底集。" },
          { label: "NAME", title: "语言未必有符号 5", body: "如果语言只给出 0 和后继，就不能把“5”当成一个未经说明的常量直接写入公式。" },
          { label: "PARAMETER", title: "允许外部直接点名", body: "把 5 作为参数，等于先告诉公式我们指的是结构中的哪个元素。" },
        ],
      },
      {
        kind: "formula",
        chapter: "parameters",
        eyebrow: "PARAMETERS / TWO WAYS TO DEFINE X > 5",
        title: "x > 5 可以带参数定义，也可以先无参数定位 5",
        intro: "因为 5 本身能由 0 和后继唯一定位，所以这两种写法最后挑出同一个集合。",
        formula: String.raw`x>5\quad\text{或}\quad\exists y\,(\varphi_5(y)\land y<x)`,
        items: [
          { label: "WITH PARAMETER", title: "直接引用 5", body: "公式预先知道哪个元素是 5，再判断 x 是否大于它。" },
          { label: "WITHOUT PARAMETER", title: "先由 φ₅ 找到 5", body: "公式不点名 5，而是先唯一定位它，再用这个元素比较。" },
        ],
      },
      {
        kind: "cards",
        chapter: "parameters",
        eyebrow: "PARAMETERS / WHEN THE DIFFERENCE IS REAL",
        title: "真正体现参数差异的是：元素本身无法被语言定位",
        intro: "在只有顺序的结构 (ℝ,<) 中，π 与其他实数没有可由 < 单独识别的特殊性质。",
        items: [
          { label: "WITH π", title: "允许 π 作参数", body: "可以直接写 x > π，因而定义 π 右侧的所有实数。" },
          { label: "WITHOUT π", title: "不允许参数", body: "公式只能询问大小关系，无法谈圆、乘法或其他能唯一定位 π 的性质。" },
          { label: "CONCLUSION", title: "同一集合不再无参数可定义", body: "允许参数是在直接点名；无参数定义要求结构和语言自己把对象找出来。" },
        ],
      },
      {
        kind: "flow",
        chapter: "synthesis",
        eyebrow: "SYNTHESIS / FORMULA TO SET",
        title: "第五步：公式不是创造集合，而是在结构中筛出满足者",
        intro: "这是整段对话最后形成的核心图景。",
        items: [
          { label: "01", title: "写公式 φ(x)", body: "它是一段语言表达，带着等待代入的自由变量。" },
          { label: "02", title: "代入 a ∈ M", body: "在固定结构中解释所有符号。" },
          { label: "03", title: "判断 M ⊨ φ(a)", body: "每个 a 都得到成立或不成立的结果。" },
          { label: "04", title: "收集满足者", body: "所有成立的 a 组成公式定义的集合。" },
        ],
      },
      {
        kind: "matrix",
        chapter: "synthesis",
        eyebrow: "SYNTHESIS / NUMBER OF FREE VARIABLES",
        title: "一个自由变量挑元素，多个自由变量挑元组",
        intro: "公式定义的对象由自由变量个数决定。",
        columns: ["公式", "满足者位于", "得到的对象"],
        rows: [
          ["φ(x)", "M", "M 的一个子集"],
          ["φ(x,y)", "M × M", "一个二元关系"],
          ["φ(x₁,…,xₙ)", "Mⁿ", "一个 n 元关系"],
          ["例：x < y", "所有满足 x < y 的二元组", "结构中的顺序关系"],
        ],
      },
      {
        kind: "contract",
        chapter: "synthesis",
        eyebrow: "SYNTHESIS / FOUR VIEWS OF ONE THING",
        title: "公式、性质、满足者集合和可定义集合是同一条链上的四层",
        intro: "它们不是四个互不相关的新概念，只是从语法、语义和集合三个角度描述同一次筛选。",
        items: [
          { label: "SYNTAX", title: "公式 φ(x)", body: "语言里写出的表达式，本身带有自由变量。" },
          { label: "READING", title: "性质", body: "我们把 φ(x) 读成“x 具有某个性质”。" },
          { label: "SEMANTICS", title: "满足关系", body: "M ⊨ φ(a) 表示元素 a 在结构 M 中确实具有这个性质。" },
          { label: "EXTENSION", title: "可定义集合", body: "把所有满足者收集起来；若正好是目标 A，就说 φ 定义 A。" },
        ],
      },
      {
        kind: "cards",
        chapter: "synthesis",
        eyebrow: "SYNTHESIS / FORMULA OR STATEMENT",
        title: "最后分清：开放公式等待赋值，句子才直接具有真值",
        intro: "对话里“前面是公式，下面是命题”的直觉是对的，需要补上自由变量这一条界线。",
        items: [
          { label: "OPEN FORMULA", title: "φ(x)", body: "x 仍然自由；不指定 x 时，不能简单说整条公式真或假。" },
          { label: "AFTER ASSIGNMENT", title: "φ(a)", body: "把具体元素 a 代入后，可以判断 M ⊨ φ(a) 是否成立。" },
          { label: "SENTENCE", title: "没有自由变量", body: "所有变量都被量词绑定的公式称为句子；它在结构 M 中直接为真或为假。" },
        ],
      },
      {
        kind: "checklist",
        chapter: "synthesis",
        eyebrow: "SYNTHESIS / WHAT TO REMEMBER",
        title: "现在重新判断“可不可定义”，只需要依次问五件事",
        intro: "这五问就是这次学习链路最后留下的操作方法。",
        items: [
          "我们当前使用的语言允许哪些符号？",
          "这些符号在哪个结构中解释？",
          "目标是元素、集合，还是 n 元关系？",
          "是否允许直接引用结构中的参数？",
          "能否写出一条有限公式，恰好挑出全部目标对象？",
        ],
      },
      {
        kind: "closing",
        chapter: "synthesis",
        eyebrow: "MODEL THEORY / DEFINABILITY / RIN III",
        title: "一句话记住可定义性",
        statement: "给定语言和结构，如果一条允许的公式能够不多不少地挑出目标对象，那么这个对象就是可定义的。",
        note: "FORMULA → SATISFIERS → DEFINABLE SET",
      },
    ],
  },
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
