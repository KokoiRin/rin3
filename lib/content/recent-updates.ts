// 首页更新列表由已发布文章的显式元数据生成，独立阅读器保留自己的公开 URL。
import { getAllArticles, getArticlePrimaryHref } from "./catalog.ts";
import { buildRecentUpdates } from "./recent-update-data.js";

export type RecentUpdate = ReturnType<typeof buildRecentUpdates>[number];

export function getRecentUpdates(limit = 12): RecentUpdate[] {
  return buildRecentUpdates(
    getAllArticles().map((article) => ({
      ...article,
      href: getArticlePrimaryHref(article),
    })),
    limit,
  );
}
