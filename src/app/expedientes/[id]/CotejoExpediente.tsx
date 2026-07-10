'use client';

import { useFormStatus } from 'react-dom';
import { cotejarExpediente } from '../actions';

type CotejoNotarial = {
  veredicto: string;
  coincidencias: string[];
  discrepancias: string[];
  faltantes: string[];
  alertas_vigencia: string[];
};

function BotonCotejar({ tieneCotejo }: { tieneCotejo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
    >
      {pending ? 'Cotejando…' : tieneCotejo ? 'Volver a cotejar' : 'Cotejar documentos con IA'}
    </button>
  );
}

function Bloque({
  titulo,
  items,
  tono = 'slate',
}: {
  titulo: string;
  items: string[];
  tono?: 'slate' | 'amber' | 'rose' | 'emerald';
}) {
  const tonos: Record<string, string> = {
    slate: 'border-white/10 bg-white/[0.04]',
    amber: 'border-amber-400/25 bg-amber-400/[0.06]',
    rose: 'border-rose-400/25 bg-rose-400/[0.06]',
    emerald: 'border-emerald-400/25 bg-emerald-400/[0.06]',
  };
  if (items.length === 0) return null;
  return (
    <div className={`rounded-2xl border p-4 ${tonos[tono]}`}>
      <p className="text-sm font-semibold text-white">{titulo}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-slate-300">• {it}</li>
        ))}
      </ul>
    </div>
  );
}

export function CotejoExpediente({
  caseId,
  cotejo,
  generadoEl,
  documentosAnalizados,
  puedeUsarIA,
}: {
  caseId: string;
  cotejo: CotejoNotarial | null;
  generadoEl: string | null;
  documentosAnalizados: number;
  puedeUsarIA: boolean;
}) {
  const cotejar = cotejarExpediente.bind(null, caseId);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">🔍 Cotejo notarial con IA</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cruza los documentos del legajo (boleto, título, certificados) y marca coincidencias, discrepancias, faltantes y vigencias.
          </p>
        </div>
        {puedeUsarIA && (
          <form action={cotejar}>
            <BotonCotejar tieneCotejo={!!cotejo} />
          </form>
        )}
      </div>

      {documentosAnalizados < 2 && !cotejo && (
        <p className="mt-4 text-sm text-slate-400">
          Necesitás al menos 2 documentos analizados en este legajo para poder cotejarlos.
        </p>
      )}

      {documentosAnalizados >= 2 && !cotejo && (
        <p className="mt-4 text-sm text-slate-400">
          Hay {documentosAnalizados} documentos analizados. Tocá “Cotejar documentos con IA” para cruzarlos.
        </p>
      )}

      {cotejo && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-200">{cotejo.veredicto}</p>
          <Bloque titulo="✅ Coincidencias" items={cotejo.coincidencias} tono="emerald" />
          <Bloque titulo="⚠️ Discrepancias" items={cotejo.discrepancias} tono="rose" />
          <Bloque titulo="📋 Faltantes" items={cotejo.faltantes} tono="slate" />
          <Bloque titulo="⏳ Vigencias" items={cotejo.alertas_vigencia} tono="amber" />
          {generadoEl && (
            <p className="text-xs text-slate-500">
              Cotejo generado el {new Date(generadoEl).toLocaleString('es-AR')} · Borrador orientativo, revisá antes de otorgar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
