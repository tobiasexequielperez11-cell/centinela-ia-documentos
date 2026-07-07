'use client';

import { useState } from 'react';
import Link from 'next/link';
import { preguntarADocumentos, type FuenteBusqueda } from './actions';

export function BuscarClient() {
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [fuentes, setFuentes] = useState<FuenteBusqueda[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pregunta.trim() || cargando) return;
    setCargando(true);
    setError(null);
    setRespuesta(null);
    setFuentes([]);
    try {
      const r = await preguntarADocumentos(pregunta);
      if (!r.ok) setError(r.error ?? 'Ocurrió un error.');
      else {
        setRespuesta(r.respuesta ?? '');
        setFuentes(r.fuentes ?? []);
      }
    } catch {
      setError('No se pudo completar la búsqueda.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Ej: ¿Qué plazo tiene la notificación de Tiendas Tech?"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        <button
          type="submit"
          disabled={cargando || !pregunta.trim()}
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? 'Buscando…' : 'Preguntar'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {respuesta && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Respuesta
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {respuesta}
          </p>
        </div>
      )}

      {fuentes.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Fuentes
          </h3>
          <ol className="space-y-2">
            {fuentes.map((f, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-700">
                    [{i + 1}] {f.fileName}
                  </span>
                  <Link
                    href={`/documentos/${f.documentId}`}
                    className="shrink-0 text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Ver documento →
                  </Link>
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-slate-500">{f.fragmento}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
