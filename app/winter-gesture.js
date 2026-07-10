// 只描述末端滑动的计数规则，不接触 DOM 或 React 状态。
// 首页组件负责采集触摸距离，这里负责判断计数、重置和解锁。

export const WINTER_SWIPE_COUNT = 3;
export const SWIPE_THRESHOLD_PX = 52;

/**
 * @param {{ count: number; startedAtEnd: boolean; horizontalDistance: number }} gesture
 */
export function advanceWinterSwipe(gesture) {
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
    shouldReveal: count >= WINTER_SWIPE_COUNT,
  };
}
