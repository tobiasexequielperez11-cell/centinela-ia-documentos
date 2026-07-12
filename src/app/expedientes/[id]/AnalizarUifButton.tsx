'use client';

import { useFormStatus } from 'react-dom';
import { analizarUifExpediente } from '../actions';

function SubmitButton({ yaGenerada }: { yaGenerada: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:opacity-50"
    >
      {pending ? 'Analizando riesgo…' : yaGenerada ? '🛡️ Reanalizar riesgo UIF/PLA' : '🛡️ Analizar riesgo UIF/PLA (IA)'}
    </button>
  );
}

export function AnalizarUifButton({ caseId, yaGenerada }: { caseId: string; yaGenerada: boolean }) {
  return (
    <form action={analizarUifExpediente.bind(null, caseId)}>
      <SubmitButton yaGenerada={yaGenerada} />
    </form>
  );
}
