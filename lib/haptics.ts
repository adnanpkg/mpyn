const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

// iOS Safari doesn't support navigator.vibrate.
// Use AudioContext to trigger the taptic engine via a silent audio impulse.
let iosAudioCtx: AudioContext | null = null;

const iosHapticPulse = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Method 1: AudioContext silent impulse (triggers taptic on iOS 13+)
    if (!iosAudioCtx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) iosAudioCtx = new AudioCtx();
    }

    if (iosAudioCtx) {
      const oscillator = iosAudioCtx.createOscillator();
      const gain = iosAudioCtx.createGain();
      gain.gain.value = 0.01; // near-silent
      oscillator.connect(gain);
      gain.connect(iosAudioCtx.destination);
      oscillator.start();
      oscillator.stop(iosAudioCtx.currentTime + 0.01);
    }

    // Method 2: Hidden selection change (backup for older iOS)
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(document.body);
        range.collapse(true);
        sel.addRange(range);
        sel.removeAllRanges();
      }
    }
  } catch {
    // Silently fail if audio is blocked
  }
};

const vibrate = (pattern: number | number[]): void => {
  // Android: use navigator.vibrate
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
    return;
  }

  // iOS: use audio-based haptic pulse
  if (isIOS()) {
    if (!Array.isArray(pattern)) {
      iosHapticPulse();
      return;
    }
    let delay = 0;
    for (let i = 0; i < pattern.length; i += 2) {
      const pause = pattern[i + 1] ?? 0;
      setTimeout(iosHapticPulse, delay);
      delay += pattern[i] + pause;
    }
  }
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
