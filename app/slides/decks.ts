// 这里保存仍然独立创作的 deck，并把它们与 RIN 文档派生 deck 合并成公开注册表。
// 路由和播放器只消费合并后的数据；双视图内容的正文不在这里维护副本。
// 本模块不负责导航状态、Reveal 生命周期或具体视觉交互。
import { assetPath, type SectionSlug } from "../sections";
import { getAllRinDocuments } from "@/lib/articles";
import { compileRinDeck } from "./compile-rin-deck";
import type { ListedSlideDeckData, SlideDeckData } from "./types";

export type {
  ListedSlideDeckData,
  RenderedSlideContent,
  RenderedSlideDeckData,
  SlideChapter,
  SlideContent,
  SlideDeckData,
  SlideDeckListing,
  SlideItem,
} from "./types";

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
];

export function getAllSlideDecks() {
  const derived = getAllRinDocuments().map(compileRinDeck);
  const slugs = new Set(slideDecks.map((deck) => deck.slug));
  for (const deck of derived) {
    if (slugs.has(deck.slug)) {
      throw new Error(`Duplicate slide deck slug "${deck.slug}"`);
    }
    slugs.add(deck.slug);
  }
  return [...slideDecks, ...derived];
}

// 按公开 slug 查找静态演示，路由层不重复维护另一份注册表。
export function getSlideDeck(slug: string) {
  return getAllSlideDecks().find((deck) => deck.slug === slug);
}

// 返回需要作为独立内容出现在指定分区列表中的 decks。
export function getListedSlideDecks(section: SectionSlug): ListedSlideDeckData[] {
  return slideDecks.filter(
    (deck): deck is ListedSlideDeckData => deck.section === section && deck.listing !== undefined,
  );
}
