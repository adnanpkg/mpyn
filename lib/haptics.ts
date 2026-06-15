const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

const iosPulse = (): void => {
  if (typeof document === 'undefined') return;

  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  label.appendChild(input);
  document.body.appendChild(label);
  label.click();
  document.body.removeChild(label);
};

const vibrate = (pattern: number | number[]): void => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && !isIOS()) {
    navigator.vibrate(pattern);
    return;
  }

  if (!isIOS()) return;

  if (!Array.isArray(pattern)) {
    iosPulse();
    return;
  }

  let delay = 0;
  for (let i = 0; i < pattern.length; i += 2) {
    const pause = pattern[i + 1] ?? 0;
    setTimeout(iosPulse, delay);
    delay += pattern[i] + pause;
  }
};

export const haptic = {
  tap: () => vibrate(8),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([30, 20, 30]),
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
