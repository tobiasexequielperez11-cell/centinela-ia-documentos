'use client';

import { useFormStatus } from 'react-dom';
import { calificarInquilinoExpediente } from '../actions';

function SubmitButton({ yaGenerada }: { yaGenerada: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#29C5FF]/30 bg-gradient-to-r from-[#1E9BF0]/10 to-[#8B5CF6]/10 px-3 py-2 text-sm font-medium text-white transition hover:from-[#1E9BF0]/20 hover:to-[#8B5CF6]/20 disabled:opacity-50"
    >
      {pending ? 'Calificando…' : yaGenerada ? '✨ Recalificar inquilino y garantía' : '✨ Calificar inquilino y garantía (IA)'}
    </button>
  );
}

export function CalificarInquilinoButton({ caseId, yaGenerada }: { caseId: string; yaGenerada: boolean }) {
  return (
    <form action={calificarInquilinoExpediente} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="caseId" value={caseId} />
      <input 
        name="alquiler" 
        type="text" 
        inputMode="decimal" 
        placeholder="Ej: 1.250.000" 
        className="w-32 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#29C5FF] focus:outline-none focus:ring-1 focus:ring-[#29C5FF]"
      />
      <select 
        name="moneda" 
        className="rounded-xl border border-white/10 bg-[#0C2340] px-3 py-2 text-sm text-white focus:border-[#29C5FF] focus:outline-none focus:ring-1 focus:ring-[#29C5FF]"
      >
        <option value="ARS">ARS</option>
        <option value="USD">USD</option>
      </select>
      <SubmitButton yaGenerada={yaGenerada} />
    </form>
  );
}
