'use client';

import { useFormStatus } from 'react-dom';
import { redactarBorradorInmobiliaria } from '../actions';

function SubmitButton({ yaGenerado }: { yaGenerado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-cyan-400 disabled:opacity-60"
    >
      {pending ? 'Redactando borrador…' : yaGenerado ? '✍️ Regenerar borrador' : '✍️ Redactar borrador de reserva/boleto (IA)'}
    </button>
  );
}

export function RedactarBorradorButton({ caseId, yaGenerado }: { caseId: string; yaGenerado: boolean }) {
  return (
    <form action={redactarBorradorInmobiliaria.bind(null, caseId)}>
      <SubmitButton yaGenerado={yaGenerado} />
    </form>
  );
}
