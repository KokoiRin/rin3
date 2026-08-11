import assert from "node:assert/strict";
import test from "node:test";
import { advanceTouchGesture, advanceWheelGesture } from "../app/edge-gesture.js";

// 到达末端后，连续三次向后浏览才展开额外分区，前两次仅保留计数。
test("[HOME-GATE-001] 手机端只有到达末端并连续三次向后滑动才显示第四入口", () => {
  let state = { count: 0, shouldReveal: false };

  for (let index = 0; index < 3; index += 1) {
    state = advanceTouchGesture({
      count: state.count,
      startedAtEnd: true,
      horizontalDistance: 120,
    });
  }

  assert.deepEqual(state, { count: 3, shouldReveal: true });
});

// 未到末端或反向的大幅滑动会清空进度，轻微手指移动则不应误伤已有计数。
test("[HOME-GATE-001] 无效手机滑动清空进度而轻微移动保留进度", () => {
  assert.deepEqual(
    advanceTouchGesture({ count: 2, startedAtEnd: false, horizontalDistance: 120 }),
    { count: 0, shouldReveal: false },
  );
  assert.deepEqual(
    advanceTouchGesture({ count: 2, startedAtEnd: true, horizontalDistance: -120 }),
    { count: 0, shouldReveal: false },
  );
  assert.deepEqual(
    advanceTouchGesture({ count: 2, startedAtEnd: true, horizontalDistance: 20 }),
    { count: 2, shouldReveal: false },
  );
});

// 桌面端一次滑动产生的连续滚轮事件只计一次，第三次独立前进滑动才展开额外分区。
test("[HOME-GATE-001] 桌面连续滚轮事件只计一次且第三次独立横滑显示第四入口", () => {
  let state = { count: 0, lastEventAt: null, shouldReveal: false };

  for (const eventAt of [0, 20, 40]) {
    state = advanceWheelGesture({
      count: state.count,
      lastEventAt: state.lastEventAt,
      eventAt,
      deltaX: 120,
      deltaY: 0,
    });
  }
  assert.deepEqual(state, { count: 1, lastEventAt: 40, shouldReveal: false });

  for (const eventAt of [400, 420]) {
    state = advanceWheelGesture({
      count: state.count,
      lastEventAt: state.lastEventAt,
      eventAt,
      deltaX: 120,
      deltaY: 0,
    });
  }
  assert.deepEqual(state, { count: 2, lastEventAt: 420, shouldReveal: false });

  state = advanceWheelGesture({
    count: state.count,
    lastEventAt: state.lastEventAt,
    eventAt: 800,
    deltaX: 120,
    deltaY: 0,
  });

  assert.deepEqual(state, { count: 3, lastEventAt: 800, shouldReveal: true });
});

// 用户快速连续完成三次独立横向滑动也必须被逐次识别，不能被过长的事件合并窗口吞成一次。
test("[HOME-GATE-001] 快速完成的三次独立横滑也能显示第四入口", () => {
  let state = { count: 0, lastEventAt: null, shouldReveal: false };

  for (const eventAt of [0, 100, 200]) {
    state = advanceWheelGesture({
      count: state.count,
      lastEventAt: state.lastEventAt,
      eventAt,
      deltaX: 120,
      deltaY: 0,
    });
  }

  assert.deepEqual(state, { count: 3, lastEventAt: 200, shouldReveal: true });
});

// PC 上普通的纵向滚动不是“继续向左浏览”，因此不能推进隐藏入口的解锁进度。
test("[HOME-GATE-001] 桌面纵向滚动不推进第四入口的解锁进度", () => {
  assert.deepEqual(
    advanceWheelGesture({
      count: 1,
      lastEventAt: 100,
      eventAt: 500,
      deltaX: 20,
      deltaY: 120,
    }),
    { count: 1, lastEventAt: 100, shouldReveal: false },
  );
});
