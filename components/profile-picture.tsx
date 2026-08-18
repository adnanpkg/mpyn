'use client';

import { useEffect, useState } from 'react';

interface Props {
  pfpSvg?: string; // SVG filename like 'noun-flower-7598241.svg'
  initials?: string; // Fallback initials like 'JD'
  size?: 'sm' | 'md' | 'lg' | 'xl'; // small, medium, large, extra-large
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-2xl',
  xl: 'text-5xl',
};

export default function ProfilePicture({ pfpSvg, initials = '?', size = 'md', className = '' }: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!pfpSvg);

  useEffect(() => {
    if (!pfpSvg) {
      setLoading(false);
      return;
    }

    const loadSvg = async () => {
      try {
        const response = await fetch(`/pfps/${pfpSvg}`);
        const text = await response.text();
        setSvgContent(text);
      } catch (err) {
        console.error(`Failed to load SVG: ${pfpSvg}`, err);
        setSvgContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadSvg();
  }, [pfpSvg]);

  const sizeClass = sizeClasses[size];
  const textSize = textSizes[size];

  return (
    <div
      className={`${sizeClass} rounded-full bg-elevated flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
    >
      {loading ? (
        <div className={`${textSize} font-heading font-bold text-text/30 animate-pulse`}>
          {initials.slice(0, 2).toUpperCase()}
        </div>
      ) : svgContent ? (
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className={`${textSize} font-heading font-bold text-text`}>
          {initials.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
