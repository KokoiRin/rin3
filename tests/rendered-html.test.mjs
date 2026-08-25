import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";

async function readOutput(relativePath) {
  return readFile(new URL(`../out/${relativePath}`, import.meta.url), "utf8");
}

test("exports the three learning gates with deploy-safe paths", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /<title>RIN III<\/title>/i);
  assert.match(html, /Mathematics/);
  assert.match(html, /Computer Science/);
  assert.match(html, /Software Engineering/);
  assert.match(html, new RegExp(`href="${basePath}/mathematics/"`));
  assert.match(html, new RegExp(`src="${basePath}/entrance/math-sakura\\.webp"`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("exports optimized entrance artwork", async () => {
  for (const fileName of [
    "math-sakura.webp",
    "computer-lotus.webp",
    "engineering-maple.webp",
  ]) {
    const asset = await stat(new URL(`../out/entrance/${fileName}`, import.meta.url));
    assert.ok(asset.size < 500_000, `${fileName} should remain below 500 KB`);
  }
});

// 额外分区必须随静态站点完整导出，且主图继续满足体积约束。
test("exports the fourth seasonal destination", async () => {
  const home = await readOutput("index.html");
  const personal = await readOutput("me/index.html");
  const artwork = await stat(new URL("../out/entrance/winter-path.webp", import.meta.url));

  assert.match(home, /data-extra-gate="hidden"/);
  assert.match(home, new RegExp(`href="${basePath}/me/"`));
  assert.match(personal, /<title>Me \| RIN III<\/title>/i);
  assert.match(personal, /THE QUIET WORK OF BECOMING/);
  assert.doesNotMatch(home, /<button/i);
  assert.ok(artwork.size < 500_000, "winter-path.webp should remain below 500 KB");
});

test("exports each section index", async () => {
  for (const [directory, title] of [
    ["mathematics", "Mathematics"],
    ["computer-science", "Computer Science"],
    ["software-engineering", "Software Engineering"],
  ]) {
    const html = await readOutput(`${directory}/index.html`);
    assert.match(html, new RegExp(`<title>${title} \\| RIN III<\\/title>`, "i"));
    assert.match(html, /Notes/);
  }
});

// 只有作者明确给出核心结论时，文章封面才升级为 TL;DR；普通文章仍保留摘要。
test("[ARTICLE-TLDR-001] 声明 TL;DR 的文章突出核心结论而其他文章保留普通摘要", async () => {
  const withTldr = await readOutput("software-engineering/why-client-automation-is-harder-than-web/index.html");
  const withoutTldr = await readOutput("software-engineering/domain-models-protect-valid-state/index.html");

  assert.match(withTldr, /class="article-tldr"/);
  assert.match(withTldr, />TL;DR</);
  assert.match(withTldr, /可观察、可控制、可同步、可复位、可诊断/);
  assert.match(withTldr, /从浏览器这套统一 Harness 出发/);
  assert.doesNotMatch(withoutTldr, /class="article-tldr"/);
  assert.match(withoutTldr, /从“给视频添加贴纸”这个小问题出发/);
});

test("renders the RIN component guide as a complete Markdown article", async () => {
  const html = await readOutput("me/component-guide/index.html");

  assert.match(html, /RIN III Slides 组件使用说明/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /<table>/);
  assert.match(html, /:::slide/);
  assert.match(html, /Markdown 内容块怎样变成 Slides 组件/);
  assert.match(html, /Markdown item 怎样获得自动编号/);
  assert.match(html, /编译器自动生成 01、02、03/);
  assert.match(html, /三层模型怎样协作/);
  assert.match(html, /这段说明故意作为 detail/);
  assert.match(html, /<article class="article-shell" lang="zh-CN">/);
  assert.match(html, /ON THIS PAGE/);
  assert.match(html, /href="#先判断内容关系再选择布局"/);
  assert.match(html, /ALL BECOMING NOTES/);
  assert.match(html, /VIEW SLIDES/);
  assert.match(html, new RegExp(`href="${basePath}/slides/component-guide/"`));
  assert.doesNotMatch(html, /:::slide \{&quot;kind&quot;[^<]*\}[\s\S]*^:::$/m);
});

// 富内容示例必须保留惰性 Mermaid 节点、部署安全图片和两类语义列表。
test("exports rich document media and editorial lists with deploy-safe markup", async () => {
  const article = await readOutput("me/component-guide/index.html");
  const deck = await readOutput("slides/component-guide/index.html");

  for (const html of [article, deck]) {
    assert.match(html, /<pre class="mermaid" data-mermaid-diagram="">/);
    assert.match(html, new RegExp(`src="${basePath}/entrance/computer-lotus\\.webp"`));
    assert.match(html, /<ol class="rin-list rin-list-ordered">/);
    assert.match(html, /<ul class="rin-list rin-list-unordered">/);
  }
});

// 模型论笔记迁移后必须保留原 Slides 地址，同时新增默认文章入口和双向切换。
test("[RIN-DOC-001] 模型论 RIN 文档发布为同源文章和 Slides", async () => {
  const article = await readOutput("mathematics/model-theory-for-software-engineering/index.html");
  const deck = await readOutput("slides/model-theory-for-software-engineering/index.html");
  const index = await readOutput("mathematics/index.html");

  assert.match(article, /模型论中的可定义性/);
  assert.match(article, /可定义性的明确含义：公式的满足者必须与目标完全相同/);
  assert.match(article, /需要修正的一点/);
  assert.match(article, /纯序一阶语言无法定义这些算术关系/);
  assert.match(article, /先分清“5 这个对象”与“公式能不能直接写 5”/);
  assert.match(article, /公式、性质、集合和关系是同一条链上的不同视角/);
  assert.match(article, /class="katex"/);
  assert.match(article, /<table>/);
  assert.match(article, /VIEW SLIDES/);
  assert.match(article, new RegExp(`href="${basePath}/slides/model-theory-for-software-engineering/"`));

  assert.match(index, /ARTICLE \+ SLIDES/);
  assert.match(index, new RegExp(`href="${basePath}/mathematics/model-theory-for-software-engineering/"`));
  assert.equal(index.match(/<li lang="zh-CN">/g)?.length, 1);

  assert.match(deck, /View document/);
  assert.match(deck, new RegExp(`href="${basePath}/mathematics/model-theory-for-software-engineering/"`));
  assert.match(deck, /FORMULA → SATISFACTION → DEFINABLE SET/);
  assert.doesNotMatch(deck, /需要修正的一点/);
});

test("lists the dual-view component guide once under me and defaults to the article", async () => {
  const index = await readOutput("me/index.html");
  const softwareEngineering = await readOutput("software-engineering/index.html");

  assert.match(index, /RIN III Slides 组件使用说明/);
  assert.match(index, /ARTICLE \+ SLIDES/);
  assert.match(index, new RegExp(`href="${basePath}/me/component-guide/"`));
  assert.equal(
    index.match(new RegExp(`href="${basePath}/me/component-guide/"`, "g"))?.length,
    1,
  );
  assert.doesNotMatch(softwareEngineering, /RIN III Slides 组件使用说明/);
});

test("publishes one Difficult Conversations record with all twelve quick-read chapters", async () => {
  const index = await readOutput("me/index.html");
  const article = await readOutput("me/difficult-conversations/index.html");

  assert.match(index, /《高难度谈话》学习记录/);
  assert.equal(
    index.match(new RegExp(`href="${basePath}/me/difficult-conversations/"`, "g"))?.length,
    1,
  );
  for (let chapter = 1; chapter <= 12; chapter += 1) {
    assert.match(
      article,
      new RegExp(
        `href="\\.\\.\\/\\.\\.\\/reading\\/difficult-conversations\\/chapter-${chapter}\\/"`,
      ),
    );
    const reader = await readOutput(
      `reading/difficult-conversations/chapter-${chapter}/index.html`,
    );
    assert.match(reader, /href="\.\.\/\.\.\/\.\.\/me\/difficult-conversations\/"/);
  }

  assert.match(article, /证据清楚不等于谈话已经清楚/);
  assert.match(article, /把影响与意图拆开/);
  assert.match(article, /从责任判决转向系统归责/);
  assert.match(article, /专业性不是一场谈话可以判决的/);
  assert.match(article, /下一次谈话前的 90 秒准备/);

  const chapter1 = await readOutput("reading/difficult-conversations/chapter-1/index.html");
  const chapter2 = await readOutput("reading/difficult-conversations/chapter-2/index.html");
  const chapter3 = await readOutput("reading/difficult-conversations/chapter-3/index.html");
  const chapter4 = await readOutput("reading/difficult-conversations/chapter-4/index.html");
  const chapter5 = await readOutput("reading/difficult-conversations/chapter-5/index.html");
  const chapter6 = await readOutput("reading/difficult-conversations/chapter-6/index.html");
  const chapter7 = await readOutput("reading/difficult-conversations/chapter-7/index.html");
  const chapter8 = await readOutput("reading/difficult-conversations/chapter-8/index.html");
  const chapter9 = await readOutput("reading/difficult-conversations/chapter-9/index.html");
  const chapter10 = await readOutput("reading/difficult-conversations/chapter-10/index.html");
  const chapter11 = await readOutput("reading/difficult-conversations/chapter-11/index.html");
  const chapter12 = await readOutput("reading/difficult-conversations/chapter-12/index.html");
  const readerCss = await readOutput("reading/difficult-conversations/reader.css");

  assert.match(chapter1, /三层谈话同时存在/);
  assert.match(chapter1, /本页是结构化精读，不声称逐字校订/);
  assert.match(chapter2, /聆听双方故事：“和”姿态/);
  assert.match(chapter3, /把行动、影响和假设分开/);
  assert.match(chapter4, /四种不容易看见的责任/);
  assert.match(chapter5, /表达情绪，而不是发泄评价/);
  assert.match(chapter6, /真正的技巧不是永不失衡/);
  assert.match(chapter7, /三类很可能无效的谈话/);
  assert.match(chapter8, /像仲裁人一样描述“差异”/);
  assert.match(chapter9, /真诚先于“积极倾听”动作/);
  assert.match(chapter10, /结论不是事实/);
  assert.match(chapter11, /再构造：不接住攻击的原始框架/);
  assert.match(chapter12, /原书信息表 12-1 · 语义重绘/);
  assert.match(article, /全书之后，我想保留的一张路线图/);
  assert.match(article, /哪些情况值得回到原书/);
  assert.match(readerCss, /--paper: #fffefa/);
});

// 同一本书只占一个学习记录入口，章节阅读器分别承载完整翻译并回到这篇整书笔记。
test("publishes one Learning DDD record with seven chapter readers", async () => {
  const article = await readOutput(
    "software-engineering/learning-domain-driven-design/index.html",
  );
  const index = await readOutput("software-engineering/index.html");

  assert.match(index, /《Learning Domain-Driven Design》学习记录/);
  assert.equal(
    index.match(
      new RegExp(`href="${basePath}/software-engineering/learning-domain-driven-design/"`, "g"),
    )?.length,
    1,
  );
  assert.doesNotMatch(index, /第十章学习记录|第十一章学习记录|第十二章学习记录|第十三章学习记录/);
  assert.match(article, /限界上下文首先是词义的边界/);
  assert.match(article, /设计决策应该带有失效条件/);
  assert.match(article, /先有业务故事，后有边界，最后才谈实现/);
  assert.match(article, /事件模型不等于事件溯源/);
  assert.match(article, /把 DDD 带回不理想的现实/);
  assert.match(article, /先恢复逻辑边界，再选择物理拆分/);
  assert.match(article, /微服务的“微”究竟在哪里/);
  assert.match(article, /限界上下文给上限，聚合给下限/);
  assert.match(article, /事件不会自动带来解耦/);
  assert.match(article, /内部领域事件不应直接等于公共 API/);
  assert.match(article, /分析数据也需要领域边界/);
  assert.match(article, /数据网格把分析责任还给领域团队/);

  for (const chapter of [10, 11, 12, 13, 14, 15, 16]) {
    assert.match(
      article,
      new RegExp(
        `href="\\.\\.\\/\\.\\.\\/reading\\/learning-domain-driven-design\\/chapter-${chapter}\\/"`,
      ),
    );
    const reader = await readOutput(
      `reading/learning-domain-driven-design/chapter-${chapter}/index.html`,
    );
    assert.match(
      reader,
      /href="\.\.\/\.\.\/\.\.\/software-engineering\/learning-domain-driven-design\/"/,
    );
    assert.match(reader, /返回整本书学习记录/);
  }

  const chapter10 = await readOutput(
    "reading/learning-domain-driven-design/chapter-10/index.html",
  );
  const chapter11 = await readOutput(
    "reading/learning-domain-driven-design/chapter-11/index.html",
  );
  const chapter12 = await readOutput(
    "reading/learning-domain-driven-design/chapter-12/index.html",
  );
  const chapter13 = await readOutput(
    "reading/learning-domain-driven-design/chapter-13/index.html",
  );
  const chapter14 = await readOutput(
    "reading/learning-domain-driven-design/chapter-14/index.html",
  );
  const chapter15 = await readOutput(
    "reading/learning-domain-driven-design/chapter-15/index.html",
  );
  const chapter16 = await readOutput(
    "reading/learning-domain-driven-design/chapter-16/index.html",
  );
  assert.match(chapter10, /第 10 章｜设计启发式｜RIN III/);
  assert.match(chapter11, /migrated-from-legacy/);
  for (let figure = 1; figure <= 12; figure += 1) {
    assert.match(chapter12, new RegExp(`图 12-${figure}(?!\\d)`));
  }
  assert.doesNotMatch(chapter12, /data-note-filter=/);
  assert.match(chapter13, /第 13 章｜现实世界中的领域驱动设计｜RIN III/);
  assert.match(chapter13, /想得大，但从小处开始/);
  assert.match(chapter13, /地下.*领域驱动设计/);
  for (let figure = 1; figure <= 5; figure += 1) {
    assert.match(chapter13, new RegExp(`图 13-${figure}(?!\\d)`));
  }
  assert.doesNotMatch(chapter13, /data-note-filter=/);
  assert.match(chapter14, /第 14 章｜微服务｜RIN III/);
  assert.match(chapter14, /AddTwoNumbers/);
  assert.match(chapter14, /所有微服务都是限界上下文/);
  assert.match(chapter14, /OASIS，《Reference Model for Service Oriented Architecture 1.0》/);
  for (let figure = 1; figure <= 13; figure += 1) {
    assert.match(chapter14, new RegExp(`图 14-${figure}(?!\\d)`));
  }
  assert.doesNotMatch(chapter14, /data-note-filter=/);
  assert.match(chapter15, /第 15 章｜事件驱动架构｜RIN III/);
  assert.match(chapter15, /事件携带状态转移/);
  assert.match(chapter15, /分布式大泥球/);
  assert.match(chapter15, /只有偏执狂才能生存/);
  for (let figure = 1; figure <= 6; figure += 1) {
    assert.match(chapter15, new RegExp(`图 15-${figure}(?!\\d)`));
  }
  assert.doesNotMatch(chapter15, /data-note-filter=/);
  assert.match(chapter16, /第 16 章｜数据网格｜RIN III/);
  assert.match(chapter16, /分析数据模型与事务数据模型/);
  assert.match(chapter16, /数据仓库与数据湖架构的挑战/);
  assert.match(chapter16, /结合数据网格与领域驱动设计/);
  assert.match(chapter16, /全书结语 · 原书正文续篇/);
  assert.match(chapter16, /始终留意你的统一语言/);
  assert.match(chapter16, /表 E-1/);
  assert.match(chapter16, /图 E-1/);
  for (let figure = 1; figure <= 15; figure += 1) {
    assert.match(chapter16, new RegExp(`图 16-${figure}(?!\\d)`));
  }
  assert.doesNotMatch(chapter16, /data-note-filter=/);
});

// 已发布的章节文章地址保留跳转页，避免旧链接在合并后直接失效。
test("redirects the three former chapter records to the unified book record", async () => {
  for (const chapter of [10, 11, 12]) {
    const redirect = await readOutput(
      `software-engineering/learning-domain-driven-design-chapter-${chapter}/index.html`,
    );
    assert.match(redirect, /url=\.\.\/learning-domain-driven-design\//);
    assert.match(redirect, /href="\.\.\/learning-domain-driven-design\/"/);
  }
});

test("exports the component guide deck with a document switch", async () => {
  const deck = await readOutput("slides/component-guide/index.html");

  await assert.rejects(readOutput("slides/index.html"), { code: "ENOENT" });
  await assert.rejects(readOutput("slides/interface-contracts/index.html"), { code: "ENOENT" });
  assert.match(deck, /<main class="rin-slides-shell" lang="zh-CN">/);
  assert.match(deck, /aria-label="Presentation chapters"/);
  assert.match(deck, /内容、编译和播放各自只有一个职责/);
  assert.doesNotMatch(deck, /三层模型怎样协作/);
  assert.doesNotMatch(deck, /这段说明故意作为 detail/);
  assert.match(deck, /公式在文章和 Slides 中使用同一段 LaTeX/);
  assert.match(deck, /指令只描述分页和布局/);
  assert.match(deck, /class="katex"/);
  assert.match(deck, /data-rehype-pretty-code-figure/);
  assert.match(deck, /ONE RIN DOCUMENT \/ ARTICLE \+ SLIDES/);
  assert.match(deck, /ARROW KEYS \/ SWIPE \/ CLICK/);
  assert.match(deck, /Back to Me/);
  assert.match(deck, new RegExp(`href="${basePath}/me/"`));
  assert.match(deck, /View document/);
  assert.match(deck, /DOCUMENT/);
  assert.match(deck, new RegExp(`href="${basePath}/me/component-guide/"`));
});

test("removes Eigenvalues from the mathematics section and static export", async () => {
  const index = await readOutput("mathematics/index.html");

  assert.doesNotMatch(index, /Eigenvalues: Scale Along Stable Directions/);
  await assert.rejects(readOutput("mathematics/eigenvalues/index.html"), { code: "ENOENT" });
});

test("keeps the entrance copy English-only", async () => {
  const html = await readOutput("index.html");
  assert.doesNotMatch(html, /\p{Script=Han}/u);
});
