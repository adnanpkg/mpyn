'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { haptic, pressScale, spring } from '@/lib/haptics';

const SVG_PFPS = [
  'noun-flower-7598241.svg',
  'noun-y2k-sparkle-6513919.svg',
  'noun-y2k-sparkle-6857796.svg',
  'noun-y2k-sparkle-6901104.svg',
  'noun-y2k-sparkle-7113381.svg',
  'noun-y2k-star-7598274.svg',
];

interface Props {
  selected?: string;
  onChange: (svgName: string) => void;
  showInitials?: boolean;
  initials?: string;
}

export default function PFPSelector({ selected, onChange, showInitials = false, initials = '?' }: Props) {
  const [svgs, setSvgs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSvgs = async () => {
      try {
        const svgData: Record<string, string> = {};
        for (const svg of SVG_PFPS) {
          const response = await fetch(`/pfps/${svg}`);
          const text = await response.text();
          svgData[svg] = text;
        }
        setSvgs(svgData);
      } catch (err) {
        console.error('Failed to load SVGs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSvgs();
  }, []);

  return (
    <div className="space-y-4">
      <label className="text-muted text-xs font-mono block">profile picture</label>
      
      {/* Current selection display */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface border-2 border-border flex items-center justify-center flex-shrink-0">
          {selected && svgs[selected] ? (
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: svgs[selected] }}
            />
          ) : showInitials ? (
            <span className="text-lg font-heading font-bold text-text">{initials}</span>
          ) : (
            <span className="text-xs text-muted">none</span>
          )}
        </div>
        <div>
          <p className="text-text text-sm font-body">
            {selected ? selected.replace('noun-', '').replace(/[0-9-]/g, '') : 'no pfp selected'}
          </p>
          <p className="text-dim text-xs font-mono mt-0.5">
            {showInitials ? `(initials: ${initials} as fallback)` : '(no fallback)'}
          </p>
        </div>
      </div>

      {/* SVG grid */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-3 text-center text-muted text-sm">loading pfps...</div>
        ) : (
          SVG_PFPS.map((svg) => (
            <motion.button
              key={svg}
              className={`w-full aspect-square rounded-card border-2 transition-all flex items-center justify-center p-2 ${
                selected === svg
                  ? 'border-text bg-text/10'
                  : 'border-border hover:border-text/50 bg-surface'
              }`}
              onClick={() => {
                haptic.tap();
                onChange(svg);
              }}
              whileTap={{ scale: 0.95 }}
              transition={spring.default}
            >
              {svgs[svg] && (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: svgs[svg] }}
                />
              )}
            </motion.button>
          ))
        )}
      </div>

      <p className="text-dim text-xs font-mono">
        selected: {selected ? selected.replace('noun-', '').replace(/[0-9-]/g, '') : 'initials (default)'}
      </p>
    </div>
  );
}
