'use client';

import { useState } from 'react';
import { indexarDocumentosExistentes, type BackfillResult } from './actions';

export function BackfillDocs() {
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState<BackfillResult | null>(null);

  async function run() {
    setCargando(true);
    setRes(null);
    try {
      setRes(await indexarDocumentosExistentes());
    } catch {
      setRes({ ok: false, error: 'No se pudo completar.' });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-700">
        Indexar documentos existentes <span className="font-normal text-slate-400">(admin)</span>
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Los documentos analizados antes de activar el buscador todavía no están indexados.
        Ejecutá esto una vez para que también aparezcan en las búsquedas.
      </p>
      <button
        onClick={run}
        disabled={cargando}
        className="mt-3 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cargando ? 'Indexando…' : 'Indexar ahora'}
      </button>
      {res && (
        <div className="mt-3 text-xs">
          {res.ok ? (
            <p className="text-emerald-700">
              ✅ Listo: {res.indexados} indexados · {res.yaIndexados} ya estaban · {res.sinTexto} sin
              texto · {res.errores} con error (de {res.total} analizados).
            </p>
          ) : (
            <p className="text-red-700">{res.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
