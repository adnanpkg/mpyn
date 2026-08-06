// Haptic feedback utility
// - Android: navigator.vibrate() (real hardware vibration)
// - iOS: Visual micro-pulse fallback (iOS Safari blocks all haptic APIs)

const vibrate = (pattern: number | number[]): void => {
  // Android: real haptic vibration
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // silently fail
    }
  }
  // iOS: no haptic API available in Safari, visual feedback handled by pressScale
};

export const haptic = {
  tap: () => vibrate(8),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([30, 20, 30]),
  heavy: () => vibrate([20, 30, 20, 30, 20]),
};

export const spring = {
  default: { type: 'spring' as const, stiffness: 400, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 300, damping: 25 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
};

export const pressScale = {
  whileTap: { scale: 0.96 },
  transition: spring.default,
};
