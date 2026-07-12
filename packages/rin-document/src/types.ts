// 这里集中定义独立 deck 与 RIN 派生 deck 共同使用的播放数据契约。
// 类型只描述构建完成后的页面结构，不负责源文档解析、路由或交互状态。
// 保持两种内容来源进入播放器后的语义一致；站点导航由宿主自行扩展。

export type SlideChapter = {
  id: string;
  label: string;
  title: string;
  summary: string;
};

export type SlideItem = {
  label?: string;
  title: string;
  body: string;
};

type SlideBase = {
  chapter: string;
  eyebrow: string;
  title: string;
};

export type SlideContent =
  | (SlideBase & { kind: "cover"; summary: string; tags: string[] })
  | (SlideBase & { kind: "prose"; markdown: string })
  | (SlideBase & { kind: "cards"; intro: string; items: SlideItem[] })
  | (SlideBase & {
      kind: "matrix";
      intro: string;
      columns: [string, string, string];
      rows: Array<[string, string, string]>;
    })
  | (SlideBase & { kind: "flow"; intro: string; items: SlideItem[] })
  | (SlideBase & { kind: "contract"; intro: string; items: SlideItem[] })
  | (SlideBase & { kind: "checklist"; intro: string; items: string[] })
  | (SlideBase & { kind: "formula"; intro: string; formula: string; items: SlideItem[] })
  | (SlideBase & {
      kind: "code";
      intro: string;
      language: string;
      code: string;
      caption?: string;
    })
  | (SlideBase & { kind: "closing"; statement: string; note: string });

type RichSlideContent = Extract<SlideContent, { kind: "formula" | "code" | "prose" }>;

export type RenderedSlideContent =
  | Exclude<SlideContent, RichSlideContent>
  | (RichSlideContent & { html: string });

export type SlideDeckData = {
  slug: string;
  lang: "en" | "zh-CN";
  series: string;
  title: string;
  description: string;
  date: string;
  coverImage: string;
  section: string;
  chapters: SlideChapter[];
  slides: SlideContent[];
};

export type RenderedSlideDeckData<TDeck extends SlideDeckData = SlideDeckData> = Omit<TDeck, "slides"> & {
  slides: RenderedSlideContent[];
};
