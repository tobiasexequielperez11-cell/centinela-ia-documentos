'use client';

import { motion } from 'motion/react';
import type { ComponentProps } from 'react';

export function MotionTableRow({
  children,
  index = 0,
  className = '',
  ...props
}: ComponentProps<typeof motion.tr> & { index?: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 24,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  );
}
