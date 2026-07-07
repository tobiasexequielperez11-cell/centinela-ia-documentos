import { formatPlazoDate } from '@/lib/format/date';

export type ItemCronologia = {
  fecha: string;
  titulo: string;
  detalle?: string | null;
  origen: 'actuacion' | 'detectada' | 'documento';
  etiquetaOrigen: string;
  esFuturo: boolean;
};

const ORIGEN_STYLE: Record<string, { dot: string; badge: string; icon: string }> = {
  actuacion: { dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700', icon: '⚖️' },
  detectada: { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', icon: '🤖' },
  documento: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', icon: '📄' },
};

export function CronologiaExpediente({ items }: { items: ItemCronologia[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">🕒 Cronología del caso</h2>
        <p className="mt-2 text-sm text-slate-500">
          Todavía no hay fechas para mostrar. Se irá armando sola con las actuaciones, las fechas detectadas por la IA en los documentos y las cargas de archivos.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">🕒 Cronología del caso</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{items.length} hitos</span>
      </div>
      <p className="mb-5 text-sm text-slate-500">
        Todas las fechas del expediente unificadas y ordenadas: actuaciones, fechas detectadas por la IA y cargas de documentos.
      </p>

      <ol className="relative space-y-5 border-l border-slate-200 pl-6">
        {items.map((it, i) => {
          const style = ORIGEN_STYLE[it.origen] ?? ORIGEN_STYLE.documento;
          return (
            <li key={i} className="relative">
              <span className={`absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full ring-4 ring-white ${style.dot}`} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{formatPlazoDate(it.fecha)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${style.badge}`}>{style.icon} {it.etiquetaOrigen}</span>
                {it.esFuturo && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Próxima</span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-700">{it.titulo}</p>
              {it.detalle && <p className="mt-0.5 text-sm text-slate-500">{it.detalle}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
