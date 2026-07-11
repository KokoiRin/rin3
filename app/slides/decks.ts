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
  // 这份学习笔记保留原对话的认知推进：先判断学习价值，再把模型论概念逐层翻译到软件语义。
  {
    slug: "model-theory-for-software-engineering",
    lang: "zh-CN",
    series: "RIN III / MATHEMATICS / MODEL THEORY",
    title: "从模型论到软件语义",
    description: "沿着一次学习对话，理解满足、可定义性、初等等价、同态与同构如何进入软件工程。",
    date: "2026 / 07 / 12",
    coverImage: assetPath("/entrance/math-sakura.webp"),
    section: "mathematics",
    sectionTitle: "Mathematics",
    sectionHref: "/mathematics",
    listing: {
      topic: "Model Theory & Semantics",
      date: "2026-07-12",
      order: 20,
    },
    chapters: [
      {
        id: "why",
        label: "00",
        title: "Why Learn It",
        summary: "先判断学习价值",
      },
      {
        id: "satisfaction",
        label: "01",
        title: "Satisfaction",
        summary: "规范与程序的关系",
      },
      {
        id: "definability",
        label: "02",
        title: "Definability",
        summary: "语言能否说清概念",
      },
      {
        id: "equivalence",
        label: "03",
        title: "Equivalence",
        summary: "语言看不出的差异",
      },
      {
        id: "mappings",
        label: "04",
        title: "Mappings",
        summary: "转换保留了什么",
      },
      {
        id: "route",
        label: "05",
        title: "Learning Route",
        summary: "把概念放回实践",
      },
    ],
    slides: [
      {
        kind: "cover",
        chapter: "why",
        eyebrow: "MATHEMATICS / MODEL THEORY / SOFTWARE SEMANTICS",
        title: "从模型论到软件语义",
        summary: "不是为了学完一门数学，而是借它回答：规范写下之后，程序何时才算真正满足它？",
        tags: ["SATISFACTION", "DEFINABILITY", "EQUIVALENCE", "ISOMORPHISM"],
      },
      {
        kind: "cards",
        chapter: "why",
        eyebrow: "WHY / THE FIRST TURN",
        title: "第一步不是继续学，而是判断什么值得学",
        intro: "原对话的转折点，是把目标从“读完模型论”改成“提取能帮助软件工程的语义工具”。",
        items: [
          {
            label: "KEEP",
            title: "保留思想",
            body: "结构、公式、满足、可定义性和结构保持，能帮助我们更精确地讨论规范、测试与实现。",
          },
          {
            label: "SKIP",
            title: "跳过低收益细节",
            body: "纯数学证明只需知道它解决什么问题和得到什么结论，不必把技术细节当成当前主线。",
          },
          {
            label: "CHANGE THE QUESTION",
            title: "换一个学习问题",
            body: "以后每遇到一个数学概念，都问它在 Spec、测试、代码和 Agent 工作流里对应什么。",
          },
        ],
      },
      {
        kind: "flow",
        chapter: "why",
        eyebrow: "WHY / THE SHARED PROBLEM",
        title: "模型论与软件工程研究的是同一种落差",
        intro: "两者都不满足于符号本身，而要追问一个表示进入现实结构后是否仍然成立。",
        items: [
          {
            label: "01",
            title: "业务语义",
            body: "我们真正想保护的现实规则与意图。",
          },
          {
            label: "02",
            title: "规范语言",
            body: "用 Requirement、Scenario 或约束表达意图。",
          },
          {
            label: "03",
            title: "程序结构",
            body: "代码、对象图、数据库和状态机承载实际行为。",
          },
          {
            label: "04",
            title: "满足判断",
            body: "验证实现是否真的让规范在运行结构中成立。",
          },
        ],
      },
      {
        kind: "formula",
        chapter: "satisfaction",
        eyebrow: "SATISFACTION / THE CENTRAL QUESTION",
        title: "程序何时真正满足规范",
        intro: "模型论把结构与公式分开，再用满足关系连接二者；软件工程可以采用同一副心智模型。",
        formula: String.raw`\mathcal{P} \models \mathcal{S}\;?`,
        items: [
          {
            label: "STRUCTURE / P",
            title: "Program",
            body: "不是源文件文本，而是包含状态、数据、关系与行为的运行结构。",
          },
          {
            label: "FORMULA / S",
            title: "Specification",
            body: "不是旁注，而是一组希望在程序结构中成立的约束。",
          },
        ],
      },
      {
        kind: "contract",
        chapter: "satisfaction",
        eyebrow: "SATISFACTION / THREE TERMS",
        title: "先把 Structure、Formula、Satisfaction 分开",
        intro: "这三个概念一旦混在一起，我们就容易把“写了规范”误认为“实现已正确”。",
        items: [
          {
            label: "STRUCTURE",
            title: "结构",
            body: "数据库、对象图、AST、状态机与运行时环境；它们共同决定公式在哪里被解释。",
          },
          {
            label: "FORMULA",
            title: "公式",
            body: "库存不得为负、订单终会支付或取消、模块不能循环依赖，都是可被判断的约束。",
          },
          {
            label: "SATISFACTION",
            title: "满足",
            body: "给定具体结构后，约束是否为真；它把抽象语义变成可验证判断。",
          },
          {
            label: "ENGINEERING",
            title: "工程对应",
            body: "Spec、测试与代码不是三份独立文档，而应共同逼近同一个满足关系。",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "satisfaction",
        eyebrow: "SATISFACTION / TRANSLATION TABLE",
        title: "把模型论术语翻译到软件工程",
        intro: "这不是严格的数学等同，而是一种帮助我们提问的结构类比。",
        columns: ["模型论", "软件工程", "需要追问"],
        rows: [
          ["语言", "Spec / DSL / 测试 API", "它能表达哪些事实？"],
          ["结构", "程序 / 数据 / 运行状态", "事实在什么世界里解释？"],
          ["公式", "需求 / 不变量 / 场景", "想让什么始终成立？"],
          ["满足", "验证 / 测试 / 检查", "证据足以说明实现正确吗？"],
        ],
      },
      {
        kind: "formula",
        chapter: "definability",
        eyebrow: "DEFINABILITY / EXPRESSING A CONCEPT",
        title: "可定义性：当前语言能否说清业务概念",
        intro: "一个集合或概念若能被当前语言中的公式精确挑出来，它才在这套语言中可定义。",
        formula: String.raw`X=\{a\in M\mid M\models\varphi(a,p)\}`,
        items: [
          {
            label: "CONCEPT / X",
            title: "想表达的概念",
            body: "例如“缺货”“高价值用户”“可分配库存”。",
          },
          {
            label: "LANGUAGE / φ",
            title: "系统已有语言",
            body: "类型、字段、状态、函数、测试步骤与 DSL 共同决定表达能力。",
          },
        ],
      },
      {
        kind: "flow",
        chapter: "definability",
        eyebrow: "DEFINABILITY / OUT OF STOCK",
        title: "“缺货”为什么不一定等于 quantity ≤ 0",
        intro: "定义失败往往不是条件写少了，而是当前模型没有承载完整的业务语义。",
        items: [
          {
            label: "01",
            title: "表面数量",
            body: "quantity 只描述账面库存。",
          },
          {
            label: "02",
            title: "占用关系",
            body: "预占、订单锁定会改变真正可用量。",
          },
          {
            label: "03",
            title: "上下文状态",
            body: "仓库、区域、上下架状态也参与判断。",
          },
          {
            label: "04",
            title: "稳定定义",
            body: "模型补齐后，规则才可能被统一表达与复用。",
          },
        ],
      },
      {
        kind: "cards",
        chapter: "definability",
        eyebrow: "DEFINABILITY / PARAMETERS",
        title: "有参数的定义，提醒我们区分规则与策略",
        intro: "“消费金额大于 10000 的用户”可以定义一个集合，但阈值本身来自上下文参数。",
        items: [
          {
            label: "INVARIANT",
            title: "业务不变量",
            body: "无论部署、客户或时间如何变化，都必须成立；它属于领域模型的稳定边界。",
          },
          {
            label: "PARAMETER",
            title: "策略参数",
            body: "阈值、地区、租户和活动配置会变化；它们不应伪装成永恒的领域真理。",
          },
          {
            label: "DESIGN QUESTION",
            title: "谁拥有变化",
            body: "每次看到常量或条件，都问：这是概念的定义，还是当前环境提供的一组参数？",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "definability",
        eyebrow: "DEFINABILITY / SEMANTIC DRIFT",
        title: "不可定义或定义不稳时，三层会各说各话",
        intro: "语义漂移的根因常常不是实现粗心，而是团队使用的语言没有共同表达同一个概念。",
        columns: ["层次", "可能表达成", "风险"],
        rows: [
          ["需求", "缺货时阻止下单", "“缺货”没有精确定义"],
          ["测试", "quantity = 0", "只覆盖了一个可观察切面"],
          ["代码", "available - reserved ≤ 0", "实现偷偷加入额外语义"],
          ["结果", "A / B / C", "三层分别正确，却没有语义一致性"],
        ],
      },
      {
        kind: "formula",
        chapter: "equivalence",
        eyebrow: "EQUIVALENCE / THE OBSERVATION LANGUAGE",
        title: "初等等价：当前语言分辨不出的差异",
        intro: "如果两个结构对当前语言中的每个句子都给出相同真假判断，这门语言就把它们视为等价。",
        formula: String.raw`A\equiv_L B\iff\forall\varphi\in L,\;A\models\varphi\Leftrightarrow B\models\varphi`,
        items: [
          {
            label: "LANGUAGE / L",
            title: "观察能力",
            body: "测试、监控和公开 API 决定我们能够提出哪些问题。",
          },
          {
            label: "A / B",
            title: "两个实现",
            body: "内部可以完全不同，只要当前观察语言无法分辨，它们就表现等价。",
          },
        ],
      },
      {
        kind: "cards",
        chapter: "equivalence",
        eyebrow: "EQUIVALENCE / TESTING CONSEQUENCE",
        title: "测试通过，只说明实现满足了测试能表达的部分",
        intro: "初等等价带来的工程提醒，不是怀疑一切测试，而是正视测试语言的边界。",
        items: [
          {
            label: "VISIBLE",
            title: "可观察行为",
            body: "公开输出、状态变化和副作用能够被测试语言区分，应成为行为测试的中心。",
          },
          {
            label: "INVISIBLE",
            title: "不可观察差异",
            body: "竞态、未来输入、资源泄漏或隐藏状态，可能暂时落在现有测试表达力之外。",
          },
          {
            label: "IMPLICATION",
            title: "扩展语言，而非堆断言",
            body: "发现真实风险时，应增加新的观察维度和业务场景，而不是绑定更多内部实现细节。",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "mappings",
        eyebrow: "MAPPINGS / STRUCTURE PRESERVATION",
        title: "同态与同构：转换究竟保留了什么",
        intro: "5.3 最值得保留的不是证明技巧，而是审查表示转换时的结构损失。",
        columns: ["概念", "保持程度", "软件中的典型问题"],
        rows: [
          ["普通映射", "只建立对应", "字段搬过去了吗？"],
          ["同态", "保持指定运算或关系", "哪些业务结构被保留、哪些丢失？"],
          ["同构", "双向且完整保持结构", "是否只是换了表示，行为结构仍相同？"],
          ["工程判断", "先声明要保留什么", "没有不变量清单，就无法判断转换是否安全"],
        ],
      },
      {
        kind: "flow",
        chapter: "mappings",
        eyebrow: "MAPPINGS / A LOSSY DTO",
        title: "Order → OrderDTO 是一次有选择的结构遗忘",
        intro: "DTO 映射可以是正确的有损转换，但必须明确它的边界，不能假装两个表示完全等价。",
        items: [
          {
            label: "01",
            title: "领域对象",
            body: "拥有身份、状态、行为、不变量与聚合边界。",
          },
          {
            label: "02",
            title: "保留字段",
            body: "orderId、status、totalPrice 被投影到 DTO。",
          },
          {
            label: "03",
            title: "遗忘结构",
            body: "行为方法、不变量和聚合边界通常不会随字段一起传递。",
          },
          {
            label: "04",
            title: "边界契约",
            body: "接收方只能依赖被明确保留的结构。",
          },
        ],
      },
      {
        kind: "cards",
        chapter: "mappings",
        eyebrow: "MAPPINGS / REFACTORING",
        title: "安全重构追求的是可观察结构不变",
        intro: "文件、类和函数可以彻底变化；真正需要守住的是外部可依赖的关系、行为与不变量。",
        items: [
          {
            label: "CAN CHANGE",
            title: "表示形态",
            body: "命名、模块布局、算法和内部协作可以改变，它们不是最终目的。",
          },
          {
            label: "MUST HOLD",
            title: "行为结构",
            body: "输入输出关系、领域不变量、错误语义和可观察副作用必须继续成立。",
          },
          {
            label: "EVIDENCE",
            title: "验证映射",
            body: "测试的作用，是为旧结构与新结构之间的行为保持提供证据。",
          },
        ],
      },
      {
        kind: "matrix",
        chapter: "route",
        eyebrow: "LEARNING ROUTE / RETURN ON ATTENTION",
        title: "最终结论不是放弃模型论，而是重新分配注意力",
        intro: "对当前目标而言，软件设计提供直接收益；模型论作为语义工具，在需要时回来取用。",
        columns: ["投入", "学习主线", "直接服务的问题"],
        rows: [
          ["70%", "软件架构与设计", "领域模型、边界、不变量、复杂度与演化"],
          ["20%", "AI 工程", "上下文、Agent 架构、评估与工具设计"],
          ["10%", "模型论与形式化方法", "语义、规范、可定义性与验证"],
          ["原则", "围绕问题串书", "所有材料服务于一个长期工程目标"],
        ],
      },
      {
        kind: "checklist",
        chapter: "route",
        eyebrow: "LEARNING ROUTE / FIVE QUESTIONS",
        title: "以后遇到数学概念，就用这五个问题带回工程",
        intro: "这套提问方式保留了对话真正形成的方法，而不只是记住几个术语。",
        items: [
          "它试图区分或解释什么现象？",
          "它所依赖的语言、结构和参数分别是什么？",
          "它在 Spec、测试、代码或 Agent 工作流中对应什么？",
          "表示转换时，哪些关系与不变量必须被保留？",
          "这个概念能否改善当前项目的一个真实设计判断？",
        ],
      },
      {
        kind: "closing",
        chapter: "route",
        eyebrow: "MODEL THEORY / SOFTWARE SEMANTICS / RIN III",
        title: "规范不是注释，程序也不只是文本",
        statement: "规范提出一个可判断的语义世界；程序给出一个具体结构；工程的核心问题，是这个结构是否真的让规范成立。",
        note: "LANGUAGE → STRUCTURE → SATISFACTION → EVIDENCE",
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
