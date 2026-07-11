'use client';

import { useFormStatus } from 'react-dom';
import { analizarPoderEstatuto } from '../actions';

function Boton({ yaAnalizado }: { yaAnalizado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-50"
    >
      {pending ? 'Analizando…' : yaAnalizado ? 'Volver a analizar' : '⚖️ Analizar poder/estatuto con IA'}
    </button>
  );
}

export function AnalizarPoderButton({
  documentId,
  yaAnalizado,
}: {
  documentId: string;
  yaAnalizado: boolean;
}) {
  return (
    <form action={analizarPoderEstatuto}>
      <input type="hidden" name="document_id" value={documentId} />
      <Boton yaAnalizado={yaAnalizado} />
    </form>
  );
}
