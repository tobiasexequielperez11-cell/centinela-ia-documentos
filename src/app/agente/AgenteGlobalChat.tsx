'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { preguntarAgenteGlobal } from './actions';
import { guardarPlazoDetectado } from '@/app/agenda/actions';
import type { MensajeChat, AccionPropuesta } from '@/lib/ai/agente';

type MensajeUI = MensajeChat & { acciones?: AccionPropuesta[] };
type EstadoAccion = 'idle' | 'loading' | 'ok' | 'error' | 'descartado';

const PRESENTACION: Record<string, { saludo: string; preguntas: string[] }> = {
  legal: {
    saludo: 'Soy tu Agente jurídico. Vigilo tus expedientes, plazos y riesgos las 24 horas.',
    preguntas: [
      '¿Qué vencimientos y plazos tengo esta semana?',
      '¿Qué legajos necesitan atención urgente?',
      '¿Qué me recomendás priorizar hoy?',
    ],
  },
  escribania: {
    saludo: 'Soy tu Agente notarial. Vigilo certificados, vigencias y actos las 24 horas.',
    preguntas: [
      '¿Qué certificados están por vencer?',
      '¿Qué legajos están listos para escriturar?',
      '¿Qué debería revisar hoy?',
    ],
  },
  inmobiliaria: {
    saludo: 'Soy tu Agente inmobiliario. Vigilo operaciones, contratos y vencimientos las 24 horas.',
    preguntas: [
      '¿Qué operaciones tienen vencimientos próximos?',
      '¿Qué contratos requieren atención?',
      '¿En qué conviene que me enfoque hoy?',
    ],
  },
};

function presentacionDe(industry: string) {
  return (
    PRESENTACION[industry] ?? {
      saludo: 'Soy tu Agente de Centinela. Vigilo tus legajos, plazos y documentos.',
      preguntas: [
        '¿Qué vencimientos próximos tengo?',
        '¿Qué necesita mi atención hoy?',
        '¿Qué me recomendás priorizar?',
      ],
    }
  );
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{p}</span>;
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
            <li key={`li-${key}-${i}`} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
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
        <p key={`p-${key++}`} className="my-1">
          {renderInline(t, `p-${key}`)}
        </p>
      );
    }
  }
  flushLista();
  return <div>{bloques}</div>;
}

type Props = { industry: string; puedeUsarIA: boolean };

export function AgenteGlobalChat({ industry, puedeUsarIA }: Props) {
  const { saludo, preguntas } = presentacionDe(industry);
  const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accEstados, setAccEstados] = useState<Record<string, EstadoAccion>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando]);

  async function enviar(texto: string) {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;
    setError(null);
    const historialPrevio = mensajes.map((m) => ({ rol: m.rol, texto: m.texto }));
    setMensajes((prev) => [...prev, { rol: 'user', texto: pregunta }]);
    setInput('');
    setCargando(true);
    try {
      const res = await preguntarAgenteGlobal({ historial: historialPrevio, pregunta });
      if (res.ok) {
        setMensajes((prev) => [
          ...prev,
          { rol: 'model', texto: res.respuesta, acciones: res.acciones },
        ]);
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
        detalle: accion.motivo || 'Propuesto por el Agente IA',
      });
      setAccEstados((p) => ({ ...p, [clave]: r.ok ? 'ok' : 'error' }));
    } catch {
      setAccEstados((p) => ({ ...p, [clave]: 'error' }));
    }
  }

  function descartar(clave: string) {
    setAccEstados((p) => ({ ...p, [clave]: 'descartado' }));
  }

  if (!puedeUsarIA) return null;

  const iniciado = mensajes.length > 0;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/50 p-4">
      <style>{`
        @keyframes botFlota { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes botAura { 0%,100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.18); opacity: .12; } }
        @keyframes botParpadeo { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        @keyframes botAntena { 0%,100% { opacity: .4; box-shadow: 0 0 4px rgba(34,211,238,.6); } 50% { opacity: 1; box-shadow: 0 0 12px rgba(34,211,238,1); } }
        @keyframes botOnda { 0%,100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
        .bot-flota { animation: botFlota 3.5s ease-in-out infinite; }
        .bot-aura { animation: botAura 3.5s ease-in-out infinite; }
        .bot-ojo { animation: botParpadeo 4s ease-in-out infinite; transform-origin: center; }
        .bot-antena { animation: botAntena 2s ease-in-out infinite; }
        .bot-onda { animation: botOnda 1s ease-in-out infinite; }
      `}</style>

      {/* Avatar animado + saludo */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3 h-24 w-24">
          <div className="bot-aura absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600" />
          <div className="bot-flota relative flex h-24 w-24 items-center justify-center">
            <span className="bot-antena absolute -top-1 h-2 w-2 rounded-full bg-cyan-400" />
            <span className="absolute top-1 h-3 w-0.5 bg-slate-500" />
            <div className="relative flex h-16 w-[4.5rem] items-center justify-center gap-2 rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-cyan-900/40">
              <span className="bot-ojo h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              <span
                className="bot-ojo h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                style={{ animationDelay: '0.15s' }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Agente IA de Centinela</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> En línea
          </span>
        </div>
        <p className="mt-1 max-w-md text-sm text-slate-300">{saludo}</p>
      </div>

      {/* Preguntas sugeridas (solo antes de empezar) */}
      {!iniciado && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {preguntas.map((q, i) => (
            <button
              key={i}
              onClick={() => enviar(q)}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-300"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Conversación */}
      {iniciado && (
        <div ref={scrollRef} className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
          {mensajes.map((m, i) => (
            <div key={i} className={m.rol === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              {m.rol === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-cyan-600/20 px-3 py-2 text-sm text-cyan-50">
                  {m.texto}
                </div>
              ) : (
                <div className="max-w-[90%]">
                  <div className="rounded-2xl rounded-bl-sm bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
                    <MensajeTexto texto={m.texto} />
                  </div>
                  {m.acciones && m.acciones.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                        💡 La IA sugiere una acción
                      </div>
                      {m.acciones.filter((a) => a.tipo === 'agendar_plazo').map((accion, ai) => {
                        const clave = `${i}-${ai}`;
                        const estado = accEstados[clave] ?? 'idle';
                        if (estado === 'descartado') {
                          return (
                            <div
                              key={clave}
                              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-500"
                            >
                              <span>🚫</span>
                              <span className="line-through">{accion.titulo}</span>
                              <button
                                onClick={() => setAccEstados((p) => ({ ...p, [clave]: 'idle' }))}
                                className="ml-auto underline-offset-2 hover:text-cyan-300 hover:underline"
                              >
                                Deshacer
                              </button>
                            </div>
                          );
                        }
                        const agendado = estado === 'ok';
                        return (
                          <div
                            key={clave}
                            className={`overflow-hidden rounded-xl border p-3 ${
                              agendado
                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                : 'border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-slate-900/40 to-cyan-500/10'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                                  agendado ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                }`}
                              >
                                {agendado ? '✅' : '📅'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                      agendado
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-violet-500/20 text-violet-200'
                                    }`}
                                  >
                                    {formatFecha(accion.fecha)}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-100">
                                    {accion.titulo}
                                  </span>
                                </div>
                                {accion.motivo && (
                                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                                    {accion.motivo}
                                  </p>
                                )}
                                {agendado ? (
                                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
                                    <span>✓</span> Agendado en tu calendario
                                  </div>
                                ) : (
                                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={() => agendar(clave, accion)}
                                      disabled={estado === 'loading'}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
                                    >
                                      {estado === 'loading'
                                        ? '⏳ Agendando…'
                                        : estado === 'error'
                                        ? '↻ Reintentar'
                                        : '✅ Aprobar y agendar'}
                                    </button>
                                    <button
                                      onClick={() => descartar(clave)}
                                      disabled={estado === 'loading'}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-60"
                                    >
                                      ✕ Descartar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
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
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="bot-onda inline-block h-3 w-1 rounded-full bg-cyan-400" />
              <span
                className="bot-onda inline-block h-3 w-1 rounded-full bg-cyan-400"
                style={{ animationDelay: '0.15s' }}
              />
              <span
                className="bot-onda inline-block h-3 w-1 rounded-full bg-cyan-400"
                style={{ animationDelay: '0.3s' }}
              />
              <span className="ml-1 text-xs">Pensando…</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

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
          placeholder="Escribile a tu agente…"
          className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={cargando || !input.trim()}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
