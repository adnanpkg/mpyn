'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { haptic } from '@/lib/haptics';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(
    value.padEnd(length, ' ').slice(0, length).split('')
  );

  const updateDigits = (newDigits: string[]) => {
    setDigits(newDigits);
    onChange(newDigits.join('').replace(/\s/g, ''));
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    haptic.tap();
    const next = [...digits];
    next[index] = char;
    updateDigits(next);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    haptic.tap();
    const next = pasted.padEnd(length, ' ').split('').slice(0, length);
    updateDigits(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
