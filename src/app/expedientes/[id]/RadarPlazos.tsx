'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { guardarPlazoDetectado } from '@/app/agenda/actions';
import type { ItemCronologia } from './CronologiaExpediente';

function diasDesdeHoy(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return NaN;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(y, m - 1, d);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}

function textoDias(n: number): string {
  if (n < 0) return `hace ${Math.abs(n)} día${Math.abs(n) === 1 ? '' : 's'}`;
  if (n === 0) return 'vence hoy';
  if (n === 1) return 'vence mañana';
  return `en ${n} días`;
}

type Nivel = {
  id: string;
  label: string;
  test: (n: number) => boolean;
  dot: string;
  chip: string;
  icon: string;
};

const NIVELES: Nivel[] = [
  { id: 'vencido', label: 'Vencido', test: (n) => n < 0, dot: 'bg-red-500', chip: 'bg-red-100 text-red-700', icon: '🔴' },
  { id: 'urgente', label: '≤ 7 días', test: (n) => n >= 0 && n <= 7, dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700', icon: '🟠' },
  { id: 'proximo', label: '≤ 15 días', test: (n) => n > 7 && n <= 15, dot: 'bg-amber-400', chip: 'bg-amber-100 text-amber-700', icon: '🟡' },
  { id: 'agenda', label: '≤ 30 días', test: (n) => n > 15 && n <= 30, dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
];

function nivelDe(n: number): Nivel | null {
  return NIVELES.find((x) => x.test(n)) ?? null;
}

type PlazoRadar = { item: ItemCronologia; dias: number; nivel: Nivel };

export function RadarPlazos({ items }: { items: ItemCronologia[] }) {
  const [estados, setEstados] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({});

  const plazos: PlazoRadar[] = items
    .filter((it) => it.origen !== 'documento')
    .map((it) => ({ item: it, dias: diasDesdeHoy(it.fecha), nivel: nivelDe(diasDesdeHoy(it.fecha)) }))
    .filter((p): p is PlazoRadar => !Number.isNaN(p.dias) && p.nivel !== null)
    .sort((a, b) => a.dias - b.dias);

  async function cargar(key: string, p: PlazoRadar) {
    setEstados((prev) => ({ ...prev, [key]: 'loading' }));
    try {
      const res = await guardarPlazoDetectado({
        titulo: p.item.titulo,
        fecha: p.item.fecha,
        detalle: `Plazo del expediente · ${p.item.etiquetaOrigen}`,
      });
      setEstados((prev) => ({ ...prev, [key]: res?.ok ? 'ok' : 'error' }));
    } catch {
      setEstados((prev) => ({ ...prev, [key]: 'error' }));
    }
  }

  if (plazos.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">🚦 Radar de plazos</h2>
        <p className="mt-2 text-sm text-slate-500">
          No hay plazos vencidos ni próximos (30 días). Se alimenta de las actuaciones futuras y de las fechas detectadas por la IA en los documentos.
        </p>
      </section>
    );
  }

  const conteo = NIVELES
    .map((nv) => ({ nivel: nv, n: plazos.filter((p) => p.nivel.id === nv.id).length }))
    .filter((c) => c.n > 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-slate-800">🚦 Radar de plazos</h2>
        {conteo.map((c) => (
          <span key={c.nivel.id} className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.nivel.chip}`}>
            {c.nivel.icon} {c.n} {c.nivel.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Plazos vencidos y próximos (hasta 30 días), ordenados por urgencia.
      </p>

      <ul className="mt-4 space-y-2">
        {plazos.map((p, i) => {
          const key = `${p.item.fecha}-${i}`;
          const estado = estados[key] ?? 'idle';
          return (
            <li key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.nivel.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.nivel.chip}`}>
                    {textoDias(p.dias)}
                  </span>
                  <span className="text-xs text-slate-500">{p.item.etiquetaOrigen}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-slate-800">{p.item.titulo}</p>
              </div>
              {estado === 'ok' ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
                  <Check className="h-4 w-4" /> En agenda
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => cargar(key, p)}
                  disabled={estado === 'loading'}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {estado === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                  {estado === 'loading' ? 'Cargando…' : estado === 'error' ? 'Reintentar' : 'Cargar a agenda'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
