'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { preguntarAgente } from './agenteActions';
import { guardarPlazoDetectado } from '@/app/agenda/actions';
import type { MensajeChat, AccionPropuesta } from '@/lib/ai/agente';

type MensajeUI = MensajeChat & { acciones?: AccionPropuesta[] };

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

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-slate-50">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{p}</span>;
  });
}

function MensajeTexto({ texto }: { texto: string }) {
  const lineas = texto.split('\n');
  const bloques: ReactNode[] = [];
  let lista: string[] = [];
  let key = 0;

  const flushLista = () => {
    if (lista.length) {
      const items = [...lista];
      bloques.push(
        <ul key={`ul-${key++}`} className="my-1 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
              <span>{renderInline(item, `li-${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
      lista = [];
    }
  };

  for (const linea of lineas) {
    const t = linea.trim();
    if (!t) {
      flushLista();
      continue;
    }
    const bullet = t.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      lista.push(bullet[1]);
    } else {
      flushLista();
      bloques.push(
        <p key={`p-${key++}`} className="my-1 leading-relaxed">
          {renderInline(t, `p-${key}`)}
        </p>
      );
    }
  }
  flushLista();
  return <div className="space-y-1">{bloques}</div>;
}

type Props = {
  caseId: string;
  industry: string;
  puedeUsarIA: boolean;
};

export function AgenteChat({ caseId, industry, puedeUsarIA }: Props) {
  const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accEstados, setAccEstados] = useState<Record<string, 'idle' | 'loading' | 'ok' | 'error'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando]);

  const sugerencias = SUGERENCIAS[industry] ?? SUGERENCIAS.legal;

  async function enviar(texto: string) {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;
    setError(null);
    const historialPrevio = mensajes.map((m) => ({ rol: m.rol, texto: m.texto }));
    setMensajes((prev) => [...prev, { rol: 'user', texto: pregunta }]);
    setInput('');
    setCargando(true);
    try {
      const res = await preguntarAgente({ caseId, historial: historialPrevio, pregunta });
      if (res.ok) {
        setMensajes((prev) => [...prev, { rol: 'model', texto: res.respuesta, acciones: res.acciones }]);
      } else {
        setError(res.motivo);
      }
    } catch {
      setError('Hubo un error de conexión. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  async function agendar(clave: string, accion: AccionPropuesta) {
    setAccEstados((p) => ({ ...p, [clave]: 'loading' }));
    try {
      const r = await guardarPlazoDetectado({
        titulo: accion.titulo,
        fecha: accion.fecha,
        detalle: accion.motivo || 'Propuesto por el Agente IA del legajo',
        caseId,
      });
      setAccEstados((p) => ({ ...p, [clave]: r.ok ? 'ok' : 'error' }));
    } catch {
      setAccEstados((p) => ({ ...p, [clave]: 'error' }));
    }
  }

  if (!puedeUsarIA) return null;

  return (
    <div className="agente-borde-vivo relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5">
      <style>{`
        @keyframes agenteShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes agenteBrilloBorde {
          0%, 100% { border-color: rgba(34,211,238,0.25); box-shadow: 0 0 18px rgba(34,211,238,0.06); }
          50% { border-color: rgba(34,211,238,0.55); box-shadow: 0 0 26px rgba(34,211,238,0.16); }
        }
        .agente-borde-vivo { animation: agenteBrilloBorde 3.2s ease-in-out infinite; }
        .agente-shimmer {
          background-image: linear-gradient(90deg, transparent, rgba(34,211,238,0.9), rgba(139,92,246,0.9), transparent);
          background-size: 200% 100%;
          animation: agenteShimmer 3s linear infinite;
        }
      `}</style>

      <span className="agente-shimmer pointer-events-none absolute inset-x-0 top-0 h-0.5" />

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-xl">
          🤖
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-50">Agente IA del legajo</h3>
            <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              En línea
            </span>
          </div>
          <p className="text-xs text-slate-400">Conversá sobre este legajo. La IA propone, vos decidís.</p>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-96 space-y-3 overflow-y-auto pr-1">
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
            {m.rol === 'user' ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-cyan-500/20 px-3 py-2 text-sm text-cyan-50">
                {m.texto}
              </div>
            ) : (
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-800/60 px-4 py-3 text-sm text-slate-200">
                <MensajeTexto texto={m.texto} />

                {m.acciones && m.acciones.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-cyan-300">
                      Acciones sugeridas
                    </p>
                    {m.acciones.map((accion, ai) => {
                      const clave = `${i}-${ai}`;
                      const estado = accEstados[clave] ?? 'idle';
                      return (
                        <div key={ai} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                          <div className="flex items-center gap-2 text-xs text-cyan-200">
                            <span>📅</span>
                            <span className="font-medium">{formatFecha(accion.fecha)}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-200">{accion.titulo}</p>
                          {accion.motivo && <p className="mt-0.5 text-xs text-slate-400">{accion.motivo}</p>}
                          {estado === 'ok' ? (
                            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                              ✓ Agendado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => agendar(clave, accion)}
                              disabled={estado === 'loading'}
                              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
                            >
                              {estado === 'loading'
                                ? 'Agendando…'
                                : estado === 'error'
                                ? '↻ Reintentar'
                                : '✅ Aprobar y agendar'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-800/60 px-3 py-2 text-sm text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Pensando…
            </div>
          </div>
        )}
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
