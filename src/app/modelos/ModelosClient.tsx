'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Check, Download, FileSignature, Search, FolderKanban } from 'lucide-react';
import { MODELOS, type ModeloEscrito } from '@/lib/legal/modelos';

export type ExpedienteLite = {
  id: string;
  title: string;
  client_name: string | null;
  case_type: string | null;
  metadata: Record<string, string> | null;
};

function datosDeExpediente(exp: ExpedienteLite): Record<string, string> {
  const meta = exp.metadata ?? {};
  const posibles: Record<string, string | null | undefined> = {
    caratula: exp.title,
    nombre_parte: exp.client_name,
    parte: exp.client_name,
    destinatario: exp.client_name,
    numero_expediente: meta.numero_expediente ?? meta.expediente,
    domicilio_destinatario: meta.domicilio,
    domicilio_fisico: meta.domicilio,
  };
  return Object.fromEntries(
    Object.entries(posibles).filter(([, v]) => typeof v === 'string' && v.trim() !== '')
  ) as Record<string, string>;
}

function humanize(key: string): string {
  const s = key.replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractVars(cuerpo: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*([\w-]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cuerpo)) !== null) set.add(m[1]);
  return Array.from(set);
}

function fillTemplate(cuerpo: string, values: Record<string, string>): string {
  return cuerpo.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_match, k: string) => {
    const v = values[k]?.trim();
    return v ? v : `[${humanize(k)}]`;
  });
}

export function ModelosClient({ expedientes }: { expedientes: ExpedienteLite[] }) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const [expedienteId, setExpedienteId] = useState('');

  const seleccionado = MODELOS.find((m) => m.id === seleccionadoId) ?? null;

  const categorias = useMemo(() => {
    const filtro = busqueda.trim().toLowerCase();
    const filtrados = MODELOS.filter(
      (m) =>
        !filtro ||
        m.titulo.toLowerCase().includes(filtro) ||
        m.descripcion.toLowerCase().includes(filtro) ||
        m.categoria.toLowerCase().includes(filtro)
    );
    const grupos = new Map<string, ModeloEscrito[]>();
    for (const m of filtrados) {
      const arr = grupos.get(m.categoria) ?? [];
      arr.push(m);
      grupos.set(m.categoria, arr);
    }
    return Array.from(grupos.entries());
  }, [busqueda]);

  const variables = seleccionado ? extractVars(seleccionado.cuerpo) : [];
  const textoFinal = seleccionado ? fillTemplate(seleccionado.cuerpo, valores) : '';

  const abrir = (m: ModeloEscrito) => {
    setSeleccionadoId(m.id);
    const exp = expedientes.find((e) => e.id === expedienteId);
    setValores(exp ? datosDeExpediente(exp) : {});
    setCopiado(false);
  };

  const aplicarExpediente = (id: string) => {
    setExpedienteId(id);
    const exp = expedientes.find((e) => e.id === id);
    setValores((prev) => (exp ? { ...prev, ...datosDeExpediente(exp) } : prev));
  };

  const volver = () => {
    setSeleccionadoId(null);
    setValores({});
    setCopiado(false);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoFinal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const descargar = () => {
    if (!seleccionado) return;
    const blob = new Blob([textoFinal], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${seleccionado.titulo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Herramientas jurídicas</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Modelos de escritos</h1>
        <p className="mt-1 text-sm text-slate-600">Elegí un modelo, completá los datos y copialo o descargalo.</p>
      </div>

      {!seleccionado && (
        <>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar modelo…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {categorias.length === 0 && <p className="text-sm text-slate-500">No encontramos modelos para “{busqueda}”.</p>}

          <div className="space-y-6">
            {categorias.map(([categoria, modelos]) => (
              <div key={categoria}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{categoria}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {modelos.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => abrir(m)}
                      className="group flex flex-col items-start rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-sky-200 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <FileSignature className="h-5 w-5" />
                      </span>
                      <span className="mt-3 text-sm font-semibold text-slate-950">{m.titulo}</span>
                      <span className="mt-1 text-xs text-slate-500">{m.descripcion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {seleccionado && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={volver}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al catálogo
          </button>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">{seleccionado.titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{seleccionado.descripcion}</p>
              <div className="mt-4 space-y-3">
                {expedientes.length > 0 && (
                  <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                      <FolderKanban className="h-3.5 w-3.5" />
                      Prellenar desde un expediente
                    </label>
                    <select
                      value={expedienteId}
                      onChange={(e) => aplicarExpediente(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">— Sin expediente (completar a mano) —</option>
                      {expedientes.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.title || 'Expediente sin título'}{exp.client_name ? ` — ${exp.client_name}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Completa carátula, parte y datos disponibles automáticamente. Podés editar todo abajo.
                    </p>
                  </div>
                )}
                {variables.length === 0 && <p className="text-sm text-slate-500">Este modelo no tiene campos para completar.</p>}
                {variables.map((key) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">{humanize(key)}</span>
                    <input
                      value={valores[key] ?? ''}
                      onChange={(e) => setValores((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Completar ${humanize(key).toLowerCase()}`}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-950">Vista previa</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copiar}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={descargar}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Descargar
                  </button>
                </div>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">{textoFinal}</pre>
            </section>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-800">
              ⚠️ Modelos <strong>orientativos y editables</strong>. Revisá y adaptá cada escrito a tu jurisdicción, fuero y caso antes de presentarlo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
