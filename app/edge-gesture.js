// 只描述入口边缘手势的累计规则，不接触 DOM 或 React 状态。
// 首页组件负责采集触摸或滚轮距离，这里负责判断累计、重置和解锁。

export const TOUCH_SWIPE_COUNT = 3;
export const SWIPE_THRESHOLD_PX = 52;
export const DESKTOP_REVEAL_DISTANCE_PX = 480;

/**
 * @param {{ count: number; startedAtEnd: boolean; horizontalDistance: number }} gesture
 */
export function advanceTouchGesture(gesture) {
  const isFullGesture = Math.abs(gesture.horizontalDistance) > SWIPE_THRESHOLD_PX;
  const isForwardSwipe = gesture.horizontalDistance > SWIPE_THRESHOLD_PX;

  if (!gesture.startedAtEnd || !isForwardSwipe) {
    return {
      count: isFullGesture ? 0 : gesture.count,
      shouldReveal: false,
    };
  }

  const count = gesture.count + 1;
  return {
    count,
    shouldReveal: count >= TOUCH_SWIPE_COUNT,
  };
}

/**
 * @param {number} distance
 * @param {number} delta
 */
export function advanceWheelDistance(distance, delta) {
  const nextDistance = Math.max(0, distance + delta);
  return {
    distance: nextDistance,
    shouldReveal: nextDistance >= DESKTOP_REVEAL_DISTANCE_PX,
  };
}
