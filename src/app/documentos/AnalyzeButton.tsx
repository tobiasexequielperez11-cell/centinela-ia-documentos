'use client';

import { useFormStatus } from 'react-dom';
import { Loader2, Sparkles } from 'lucide-react';

export function AnalyzeButton({
  label = 'Analizar IA',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} ${pending ? 'opacity-70 cursor-wait' : ''} inline-flex items-center justify-center gap-2`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analizando…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
