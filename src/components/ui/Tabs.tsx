'use client';
import { useState, type ReactNode } from 'react';

type Tab = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs, initial }: { tabs: Tab[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={
              active === t.id
                ? 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                : 'rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06]'
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} className={active === t.id ? 'block' : 'hidden'}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
