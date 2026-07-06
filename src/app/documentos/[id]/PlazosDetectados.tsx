'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { guardarPlazoDetectado } from '@/app/agenda/actions';

type Plazo = { descripcion: string; fecha: string };

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function PlazosDetectados({
  plazos,
  docNombre,
}: {
  plazos: Plazo[];
  docNombre: string;
}) {
  const [estados, setEstados] = useState<
    Record<number, 'idle' | 'loading' | 'ok' | 'error'>
  >({});

  async function cargar(index: number, plazo: Plazo) {
    setEstados((prev) => ({ ...prev, [index]: 'loading' }));
    try {
      const res = await guardarPlazoDetectado({
        titulo: plazo.descripcion,
        fecha: plazo.fecha,
        detalle: `Detectado por IA en el documento: ${docNombre}`,
      });
      setEstados((prev) => ({ ...prev, [index]: res.ok ? 'ok' : 'error' }));
    } catch {
      setEstados((prev) => ({ ...prev, [index]: 'error' }));
    }
  }

  if (!plazos?.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
      <p className="mb-3 text-sm font-semibold text-violet-900">
        📅 Plazos y fechas detectadas
      </p>
      <ul className="space-y-2">
        {plazos.map((plazo, index) => {
          const estado = estados[index] ?? 'idle';
          return (
            <li
              key={index}
              className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
            >
              <div>
                <span className="font-medium text-slate-800">
                  {formatFecha(plazo.fecha)}
                </span>
                <span className="ml-2 text-slate-600">{plazo.descripcion}</span>
              </div>
              {estado === 'ok' ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-4 w-4" /> Cargado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => cargar(index, plazo)}
                  disabled={estado === 'loading'}
                  className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {estado === 'loading' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-3.5 w-3.5" />
                  )}
                  {estado === 'loading'
                    ? 'Cargando…'
                    : estado === 'error'
                      ? 'Reintentar'
                      : 'Cargar a agenda'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
