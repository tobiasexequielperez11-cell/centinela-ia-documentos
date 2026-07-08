'use client';
import { motion } from 'motion/react';
import { ComponentProps } from 'react';

export function MotionButton({ children, className = '', ...props }: ComponentProps<typeof motion.button>) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative overflow-hidden rounded-xl px-4 py-2 font-medium shadow-lg shadow-cyan-500/20 transition-shadow hover:shadow-cyan-500/40 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
