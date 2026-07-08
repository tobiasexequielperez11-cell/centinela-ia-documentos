'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { CountUp } from '@/components/ui/CountUp';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  href?: string;
  index?: number;
}

export function MetricCard({ label, value, helper, href, index = 0 }: MetricCardProps) {
  const numeric = /^\d+$/.test(value.trim()) ? parseInt(value.trim(), 10) : null;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.09, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm transition-colors hover:border-accent/40"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: '0 0 34px var(--glow-cian), 0 0 50px var(--glow-violeta)' }}
      />
      <p className="relative text-sm font-medium text-slate-400">{label}</p>
      <p className="relative mt-2 text-3xl font-semibold text-white">
        {numeric !== null ? <CountUp value={numeric} /> : value}
      </p>
      {helper ? <p className="relative mt-1 text-xs text-slate-500">{helper}</p> : null}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
