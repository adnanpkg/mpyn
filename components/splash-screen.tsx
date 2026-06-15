'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    const completeTimer = setTimeout(onComplete, 2800);
    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-bg z-50"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LottiePlayer
          autoplay
          loop={false}
          keepLastFrame
          style={{ width: '100%', height: '100%' }}
          src={splashAnimation}
        />
      </motion.div>
    </AnimatePresence>
  );
}
