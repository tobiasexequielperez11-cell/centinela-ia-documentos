'use client';

import { useFormStatus } from 'react-dom';

export function FormSubmitButton({ label, loadingLabel }: { label: string; loadingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (loadingLabel ?? 'Cargando...') : label}
    </button>
  );
}
