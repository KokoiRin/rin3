import assert from "node:assert/strict";
import test from "node:test";
import { advanceWinterSwipe } from "../app/winter-gesture.js";

// 到达末端后，连续三次向后浏览才展开额外分区，前两次仅保留计数。
test("reveals the extra section after three end swipes", () => {
  let state = { count: 0, shouldReveal: false };

  for (let index = 0; index < 3; index += 1) {
    state = advanceWinterSwipe({
      count: state.count,
      startedAtEnd: true,
      horizontalDistance: 120,
    });
  }

  assert.deepEqual(state, { count: 3, shouldReveal: true });
});

// 未到末端或反向的大幅滑动会清空进度，轻微手指移动则不应误伤已有计数。
test("resets only for a full invalid swipe", () => {
  assert.deepEqual(
    advanceWinterSwipe({ count: 2, startedAtEnd: false, horizontalDistance: 120 }),
    { count: 0, shouldReveal: false },
  );
  assert.deepEqual(
    advanceWinterSwipe({ count: 2, startedAtEnd: true, horizontalDistance: -120 }),
    { count: 0, shouldReveal: false },
  );
  assert.deepEqual(
    advanceWinterSwipe({ count: 2, startedAtEnd: true, horizontalDistance: 20 }),
    { count: 2, shouldReveal: false },
  );
});
