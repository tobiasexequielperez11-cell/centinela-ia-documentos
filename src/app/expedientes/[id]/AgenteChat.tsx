'use client';

import { useState, useRef, useEffect } from 'react';
import { preguntarAgente } from './agenteActions';
import type { MensajeChat } from '@/lib/ai/agente';

const SUGERENCIAS: Record<string, string[]> = {
  legal: [
    '¿Cuáles son los plazos o vencimientos críticos de este expediente?',
    '¿Detectás alguna inconsistencia o riesgo procesal en los documentos?',
    '¿Qué próximos pasos me recomendás?',
  ],
  escribania: [
    '¿Están vigentes todos los certificados del legajo?',
    '¿Hay gravámenes, embargos o inhibiciones sobre el inmueble?',
    '¿Qué documentación falta para poder escriturar?',
  ],
  inmobiliaria: [
    '¿Qué vencimientos tiene la operación o el contrato?',
    '¿Los datos de la reserva, el boleto y el título coinciden?',
    '¿Qué conviene hacer para avanzar con esta operación?',
  ],
};

type Props = {
  caseId: string;
  industry: string;
  puedeUsarIA: boolean;
};

export function AgenteChat({ caseId, industry, puedeUsarIA }: Props) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  const sugerencias = SUGERENCIAS[industry] ?? SUGERENCIAS.legal;

  async function enviar(texto: string) {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;
    setError(null);
    const historialPrevio = mensajes;
    setMensajes((prev) => [...prev, { rol: 'user', texto: pregunta }]);
    setInput('');
    setCargando(true);
    try {
      const res = await preguntarAgente({ caseId, historial: historialPrevio, pregunta });
      if (res.ok) {
        setMensajes((prev) => [...prev, { rol: 'model', texto: res.respuesta }]);
      } else {
        setError(res.motivo);
      }
    } catch {
      setError('Hubo un error de conexión. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  if (!puedeUsarIA) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Agente IA del legajo</h3>
          <p className="text-xs text-slate-400">Conversá sobre este legajo. La IA propone, vos decidís.</p>
        </div>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {mensajes.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Probá preguntando:</p>
            {sugerencias.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => enviar(s)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={m.rol === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.rol === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-cyan-500/20 px-3 py-2 text-sm text-cyan-50'
                  : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-slate-800/60 px-3 py-2 text-sm text-slate-200'
              }
            >
              {m.texto}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-slate-800/60 px-3 py-2 text-sm text-slate-400">
              Pensando…
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(input);
        }}
        className="mt-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar(input);
            }
          }}
          rows={1}
          placeholder="Escribí tu consulta sobre el legajo…"
          className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={cargando || !input.trim()}
          className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
