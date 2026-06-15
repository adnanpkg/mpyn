'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import splashAnimation from './splash.json';

const LottiePlayer = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 600);
    const completeTimer = setTimeout(onComplete, 2800);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-bg flex flex-col items-center justify-center z-50"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-32 h-32 flex items-center justify-center">
          <LottiePlayer
            autoplay
            loop={false}
            keepLastFrame
            style={{ width: '128px', height: '128px' }}
            src={splashAnimation}
          />
        </div>

        <motion.p
          className="font-heading font-bold text-2xl text-text mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          multiply.
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
