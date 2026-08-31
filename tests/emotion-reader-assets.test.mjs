import assert from "node:assert/strict";
import test from "node:test";
import { validateEmotionReaders } from "../scripts/check-emotion-readers.mjs";

// 系列九页必须只引用集中存放的规范图片和共享资源，避免保留旧素材或页面级副本。
test("[EMOTION-READER-ASSETS-001] 情绪系列九页复用集中素材与共享样式", async () => {
  assert.deepEqual(await validateEmotionReaders(), []);
});
