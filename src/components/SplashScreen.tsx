import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
      setTimeout(() => onComplete(), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: 'hsl(var(--background))' }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: `hsl(var(--primary) / ${0.1 + Math.random() * 0.4})`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 2 + Math.random() * 4, 0],
                  y: [0, -100 - Math.random() * 200],
                  x: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Glowing rings */}
          <motion.div
            className="absolute rounded-full border"
            style={{ borderColor: 'hsl(var(--primary) / 0.1)', width: 300, height: 300 }}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ scale: [0, 1.5, 2], opacity: [0, 0.3, 0], rotate: 180 }}
            transition={{ duration: 3, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full border"
            style={{ borderColor: 'hsl(var(--accent) / 0.15)', width: 200, height: 200 }}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ scale: [0, 2, 3], opacity: [0, 0.2, 0], rotate: -120 }}
            transition={{ duration: 3, delay: 0.3, ease: 'easeOut' }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center">
            {/* Logo icon - glitch effect */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: phase >= 0 ? 1 : 0, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative mb-6"
            >
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow: '0 0 60px hsl(var(--primary) / 0.4), 0 0 120px hsl(var(--primary) / 0.15)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 60px hsl(var(--primary) / 0.4), 0 0 120px hsl(var(--primary) / 0.15)',
                    '0 0 80px hsl(var(--primary) / 0.6), 0 0 160px hsl(var(--primary) / 0.25)',
                    '0 0 60px hsl(var(--primary) / 0.4), 0 0 120px hsl(var(--primary) / 0.15)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-3xl font-black" style={{ color: 'hsl(var(--primary-foreground))' }}>L</span>
              </motion.div>
            </motion.div>

            {/* Title with letter-by-letter animation */}
            <motion.div className="overflow-hidden mb-2">
              <motion.h1
                className="text-5xl md:text-6xl font-black tracking-tight"
                initial={{ y: 80 }}
                animate={{ y: phase >= 1 ? 0 : 80 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                <span className="gradient-text">LifeOS</span>
              </motion.h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div className="overflow-hidden">
              <motion.p
                className="text-sm tracking-[0.3em] uppercase font-medium"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: phase >= 2 ? 0 : 40, opacity: phase >= 2 ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              >
                by <span className="gradient-text font-bold">JBK</span>
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="mt-8 h-0.5 rounded-full overflow-hidden"
              style={{ width: 200, background: 'hsl(var(--border))' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                initial={{ width: '0%' }}
                animate={{ width: phase >= 3 ? '100%' : '0%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="mt-4 text-xs"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              Your life, quantified. ⚡
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
