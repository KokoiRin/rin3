// 只描述入口边缘手势的累计规则，不接触 DOM 或 React 状态。
// 首页组件负责采集触摸或滚轮距离，这里负责判断累计、重置和解锁。

export const TOUCH_SWIPE_COUNT = 3;
export const SWIPE_THRESHOLD_PX = 52;
export const WHEEL_GESTURE_COUNT = 3;
export const WHEEL_GESTURE_GAP_MS = 80;

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
 * 桌面触控板的一次滑动会连续发出多个 wheel 事件；只有间隔足够长的新事件流才算下一次滑动。
 * @param {{ count: number; lastEventAt: number | null; eventAt: number; deltaX: number; deltaY: number }} gesture
 */
export function advanceWheelGesture(gesture) {
  if (Math.abs(gesture.deltaX) <= Math.abs(gesture.deltaY)) {
    return {
      count: gesture.count,
      lastEventAt: gesture.lastEventAt,
      shouldReveal: false,
    };
  }

  const isNewGesture = gesture.lastEventAt === null
    || gesture.eventAt - gesture.lastEventAt >= WHEEL_GESTURE_GAP_MS;

  if (gesture.deltaX <= 0) {
    return {
      count: isNewGesture ? 0 : gesture.count,
      lastEventAt: gesture.eventAt,
      shouldReveal: false,
    };
  }

  const count = isNewGesture ? gesture.count + 1 : gesture.count;
  return {
    count,
    lastEventAt: gesture.eventAt,
    shouldReveal: count >= WHEEL_GESTURE_COUNT,
  };
}
