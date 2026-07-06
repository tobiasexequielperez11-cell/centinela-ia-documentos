'use client';

import { useMemo, useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ArrowLeft, Copy, Check, Download, FileSignature, Search, FolderKanban, FileDown, Sparkles, Loader2 } from 'lucide-react';
import { MODELOS, type ModeloEscrito } from '@/lib/legal/modelos';
import { redactarEscritoIA } from './actions';

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

export function ModelosClient({
  expedientes,
  modeloInicialId = null,
}: {
  expedientes: ExpedienteLite[];
  modeloInicialId?: string | null;
}) {
  const idInicial =
    modeloInicialId && MODELOS.some((m) => m.id === modeloInicialId)
      ? modeloInicialId
      : null;
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(idInicial);
  const [busqueda, setBusqueda] = useState('');
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);
  const [expedienteId, setExpedienteId] = useState('');
  const [instruccion, setInstruccion] = useState('');
  const [textoIA, setTextoIA] = useState<string | null>(null);
  const [redactando, setRedactando] = useState(false);
  const [avisoIA, setAvisoIA] = useState<string | null>(null);

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
  const textoParaMostrar = textoIA ?? textoFinal;

  const redactarIA = async () => {
    if (!seleccionado) return;
    setRedactando(true);
    setAvisoIA(null);
    try {
      const r = await redactarEscritoIA({
        titulo: seleccionado.titulo,
        cuerpo: seleccionado.cuerpo,
        valores,
        instruccion,
      });
      if (r.ok) {
        setTextoIA(r.texto);
      } else if (r.motivo === 'sin_key') {
        setAvisoIA('La redacción con IA todavía no está activada en este entorno. Podés seguir usando el relleno manual; se activa cargando la clave cuando quieras.');
      } else if (r.motivo === 'sin_permiso') {
        setAvisoIA('Tu rol no tiene acceso a la redacción con IA.');
      } else {
        setAvisoIA('No se pudo generar el borrador. Probá de nuevo en unos segundos.');
      }
    } catch {
      setAvisoIA('No se pudo generar el borrador. Probá de nuevo en unos segundos.');
    } finally {
      setRedactando(false);
    }
  };

  const abrir = (m: ModeloEscrito) => {
    setSeleccionadoId(m.id);
    const exp = expedientes.find((e) => e.id === expedienteId);
    setValores(exp ? datosDeExpediente(exp) : {});
    setCopiado(false);
    setTextoIA(null);
    setInstruccion('');
    setAvisoIA(null);
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
    setTextoIA(null);
    setInstruccion('');
    setAvisoIA(null);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoParaMostrar);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const descargar = () => {
    if (!seleccionado) return;
    const blob = new Blob([textoParaMostrar], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${seleccionado.titulo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const descargarDocx = async () => {
    if (!seleccionado) return;
    const parrafos = textoParaMostrar.split('\n').map(
      (linea) =>
        new Paragraph({
          children: [new TextRun({ text: linea, font: 'Times New Roman', size: 24 })],
        })
    );
    const doc = new Document({ sections: [{ children: parrafos }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${seleccionado.titulo}.docx`;
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

                <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Redactar con IA (opcional)
                  </label>
                  <textarea
                    value={instruccion}
                    onChange={(e) => setInstruccion(e.target.value)}
                    rows={3}
                    placeholder="Contale a la IA qué necesitás. Ej: demanda por despido sin causa, reclama indemnización art. 245 LCT; ingresó el 01/2020, categoría vendedor…"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={redactarIA}
                    disabled={redactando}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                  >
                    {redactando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {redactando ? 'Redactando…' : 'Redactar con IA'}
                  </button>
                  {avisoIA && <p className="mt-2 text-[11px] text-amber-700">{avisoIA}</p>}
                  {textoIA && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-violet-700">✨ Borrador generado con IA — revisalo antes de presentar.</span>
                      <button type="button" onClick={() => setTextoIA(null)} className="shrink-0 text-[11px] font-semibold text-slate-500 underline">
                        Volver al relleno manual
                      </button>
                    </div>
                  )}
                </div>
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
                    <Download className="h-3.5 w-3.5" /> Descargar .txt
                  </button>
                  <button
                    type="button"
                    onClick={descargarDocx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Word (.docx)
                  </button>
                </div>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">{textoParaMostrar}</pre>
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
