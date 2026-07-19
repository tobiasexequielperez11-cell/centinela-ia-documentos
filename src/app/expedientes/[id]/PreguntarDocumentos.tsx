'use client';

import { useState } from 'react';
import { FileSearch, Loader2, Send } from 'lucide-react';
import { preguntarADocumentosLegajo, type FuenteLegajo } from './ragLegajoActions';

export function PreguntarDocumentos({
  caseId,
  puedeUsarIA,
}: {
  caseId: string;
  puedeUsarIA: boolean;
}) {
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [fuentes, setFuentes] = useState<FuenteLegajo[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!puedeUsarIA) return null;

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    const q = pregunta.trim();
    if (!q || cargando) return;
    setCargando(true);
    setError(null);
    setRespuesta(null);
    setFuentes([]);
    try {
      const r = await preguntarADocumentosLegajo(caseId, q);
      if (r.ok) {
        setRespuesta(r.respuesta ?? '');
        setFuentes(r.fuentes ?? []);
      } else {
        setError(r.error ?? 'No se pudo responder.');
      }
    } catch {
      setError('Hubo un error de conexión. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300">
          <FileSearch className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Preguntá a los documentos</h3>
          <p className="text-xs text-slate-400">
            Respuestas basadas en el contenido real de este legajo, con la fuente citada.
          </p>
        </div>
      </div>

      <form onSubmit={enviar} className="flex items-end gap-2">
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Ej: ¿Quién es el titular del inmueble? ¿Hay hipoteca?"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={cargando || !pregunta.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-60"
        >
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Preguntar
        </button>
      </form>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      {respuesta && (
        <div className="mt-4 space-y-3">
          <div className="whitespace-pre-line rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm leading-relaxed text-slate-200">
            {respuesta}
          </div>

          {fuentes.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                Fuentes
              </p>
              <div className="space-y-1.5">
                {fuentes.map((f, i) => (
                  <details
                    key={`${f.documentId}-${i}`}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-300"
                  >
                    <summary className="cursor-pointer select-none font-medium text-cyan-300">
                      [{i + 1}] {f.fileName}
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-slate-400">{f.fragmento}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
