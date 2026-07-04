'use client';

import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarClock, Coins, Scale, AlertTriangle, CalendarPlus, Check, Loader2 } from 'lucide-react';
import { guardarPlazoEnAgenda } from './actions';
import { UMA_VALOR, UMA_VIGENCIA, TASA_JUSTICIA_PORCENTAJE } from '@/lib/legal/config';
import { parseISODate, sumarDiasCorridos, sumarDiasHabiles } from '@/lib/legal/plazos';

type Tab = 'plazos' | 'honorarios' | 'tasa';

const currency = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0
  );

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDateLarga = (d: Date) =>
  new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(d);

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
const btnClass =
  'mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function RadioPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function ResultBox({
  label,
  value,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-100 bg-slate-50'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${highlight ? 'text-emerald-700' : 'text-slate-950'}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

function PlazosCalc() {
  const [fecha, setFecha] = useState('');
  const [dias, setDias] = useState('');
  const [tipo, setTipo] = useState<'habiles' | 'corridos'>('habiles');
  const [resultado, setResultado] = useState<{ vencimiento: Date; texto: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [referencia, setReferencia] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState<string | null>(null);

  const calcular = () => {
    setError(null);
    setResultado(null);
    setGuardado(null);
    const inicio = parseISODate(fecha);
    const n = parseInt(dias, 10);
    if (!inicio) return setError('Ingresá una fecha de inicio válida.');
    if (!Number.isFinite(n) || n <= 0) return setError('Ingresá una cantidad de días mayor a cero.');
    const vencimiento = tipo === 'habiles' ? sumarDiasHabiles(inicio, n) : sumarDiasCorridos(inicio, n);
    setResultado({
      vencimiento,
      texto: `${n} día${n > 1 ? 's' : ''} ${tipo === 'habiles' ? 'hábiles judiciales' : 'corridos'}`,
    });
  };

  const cargarAgenda = async () => {
    if (!resultado) return;
    setGuardando(true);
    setGuardado(null);
    const res = await guardarPlazoEnAgenda({
      titulo: referencia.trim() || 'Vencimiento de plazo procesal',
      fecha: toISODate(resultado.vencimiento),
      detalle: resultado.texto,
    });
    setGuardando(false);
    setGuardado(
      res.ok
        ? '✓ Cargado a la agenda'
        : res.motivo === 'no_auth'
          ? 'Iniciá sesión para guardar.'
          : 'No se pudo guardar, intentá de nuevo.'
    );
    if (res.ok) setReferencia('');
  };

  return (
    <Card title="Plazos procesales" subtitle="Calculá la fecha de vencimiento desde una fecha de inicio.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha de inicio (notificación)">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Cantidad de días">
          <input type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} placeholder="Ej: 5" className={inputClass} />
        </Field>
      </div>

      <div className="mt-4 flex gap-2">
        <RadioPill active={tipo === 'habiles'} onClick={() => setTipo('habiles')} label="Días hábiles" />
        <RadioPill active={tipo === 'corridos'} onClick={() => setTipo('corridos')} label="Días corridos" />
      </div>

      <button type="button" onClick={calcular} className={btnClass}>Calcular vencimiento</button>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {resultado && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Vencimiento</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-950">{formatDateLarga(resultado.vencimiento)}</p>
          <p className="mt-1 text-xs text-slate-600">
            Contados {resultado.texto}
            {tipo === 'habiles' ? ' (sin fines de semana, feriados ni feria judicial).' : '.'}
          </p>
          
          <div className="mt-4 border-t border-emerald-100 pt-4">
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Referencia (ej. carátula o trámite)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={cargarAgenda}
              disabled={guardando}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
              Cargar a la agenda
            </button>
            {guardado && (
              <p className={`mt-2 text-center text-[11px] font-medium ${guardado.startsWith('✓') ? 'text-emerald-700' : 'text-amber-700'}`}>
                {guardado}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function HonorariosCalc() {
  const [monto, setMonto] = useState('');
  const [porcentaje, setPorcentaje] = useState('20');
  const [etapas, setEtapas] = useState('3');
  const [res, setRes] = useState<null | { total: number; porEtapa: number; devengado: number; uma: number }>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = () => {
    setError(null);
    setRes(null);
    const m = parseFloat(monto);
    const p = parseFloat(porcentaje);
    const e = parseInt(etapas, 10);
    if (!Number.isFinite(m) || m <= 0) return setError('Ingresá un monto del proceso válido.');
    if (!Number.isFinite(p) || p <= 0) return setError('Ingresá un porcentaje válido.');
    if (![1, 2, 3].includes(e)) return setError('Seleccioná las etapas cumplidas (1 a 3).');
    const total = m * (p / 100);
    const porEtapa = total / 3;
    const devengado = porEtapa * e;
    setRes({ total, porEtapa, devengado, uma: devengado / UMA_VALOR });
  };

  return (
    <Card title="Honorarios (Ley 27.423)" subtitle="Estimación por porcentaje del monto, prorrateado en 3 etapas de primera instancia.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Monto del proceso ($)">
          <input type="number" min={0} value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej: 5000000" className={inputClass} />
        </Field>
        <Field label="Porcentaje (%)">
          <input type="number" min={0} step="0.5" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Etapas cumplidas">
          <select value={etapas} onChange={(e) => setEtapas(e.target.value)} className={inputClass}>
            <option value="1">1 etapa</option>
            <option value="2">2 etapas</option>
            <option value="3">3 etapas (completo)</option>
          </select>
        </Field>
      </div>

      <p className="mt-2 text-xs text-slate-500">Referencia Ley 27.423: en primera instancia el rango habitual va del 20% al 30% del monto.</p>

      <button type="button" onClick={calcular} className={btnClass}>Calcular honorarios</button>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {res && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ResultBox label="Honorario total (3 etapas)" value={currency(res.total)} />
          <ResultBox label="Por etapa" value={currency(res.porEtapa)} />
          <ResultBox label="Devengado (según etapas)" value={currency(res.devengado)} highlight />
          <ResultBox label="Equivalente en UMA" value={`${res.uma.toFixed(2)} UMA`} subtitle={`1 UMA = ${currency(UMA_VALOR)} (${UMA_VIGENCIA})`} />
        </div>
      )}
    </Card>
  );
}

function TasaCalc() {
  const [montoTasa, setMontoTasa] = useState('');
  const [tasaRes, setTasaRes] = useState<number | null>(null);
  const [capital, setCapital] = useState('');
  const [tasaAnual, setTasaAnual] = useState('');
  const [diasInteres, setDiasInteres] = useState('');
  const [intRes, setIntRes] = useState<null | { interes: number; total: number }>(null);
  const [error, setError] = useState<string | null>(null);

  const calcularTasa = () => {
    setError(null);
    setTasaRes(null);
    const m = parseFloat(montoTasa);
    if (!Number.isFinite(m) || m <= 0) return setError('Ingresá un monto válido para la tasa de justicia.');
    setTasaRes(m * (TASA_JUSTICIA_PORCENTAJE / 100));
  };

  const calcularInteres = () => {
    setError(null);
    setIntRes(null);
    const c = parseFloat(capital);
    const t = parseFloat(tasaAnual);
    const d = parseInt(diasInteres, 10);
    if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(t) || t <= 0 || !Number.isFinite(d) || d <= 0)
      return setError('Completá capital, tasa anual y días con valores válidos.');
    const interes = c * (t / 100) * (d / 365);
    setIntRes({ interes, total: c + interes });
  };

  return (
    <div className="space-y-6">
      <Card title="Tasa de justicia" subtitle={`Ley 23.898 — ${TASA_JUSTICIA_PORCENTAJE}% del monto del proceso (Nación).`}>
        <Field label="Monto del proceso ($)">
          <input type="number" min={0} value={montoTasa} onChange={(e) => setMontoTasa(e.target.value)} placeholder="Ej: 5000000" className={inputClass} />
        </Field>
        <button type="button" onClick={calcularTasa} className={btnClass}>Calcular tasa</button>
        {tasaRes !== null && (
          <div className="mt-4">
            <ResultBox label={`Tasa de justicia (${TASA_JUSTICIA_PORCENTAJE}%)`} value={currency(tasaRes)} highlight />
          </div>
        )}
      </Card>

      <Card title="Intereses" subtitle="Interés simple: capital × tasa anual × (días / 365).">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Capital ($)">
            <input type="number" min={0} value={capital} onChange={(e) => setCapital(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tasa anual (%)">
            <input type="number" min={0} step="0.1" value={tasaAnual} onChange={(e) => setTasaAnual(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Días">
            <input type="number" min={0} value={diasInteres} onChange={(e) => setDiasInteres(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <button type="button" onClick={calcularInteres} className={btnClass}>Calcular intereses</button>
        {intRes && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultBox label="Interés" value={currency(intRes.interes)} />
            <ResultBox label="Capital + interés" value={currency(intRes.total)} highlight />
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

export function CalculadorasClient() {
  const [tab, setTab] = useState<Tab>('plazos');
  const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
    { id: 'plazos', label: 'Plazos procesales', icon: CalendarClock },
    { id: 'honorarios', label: 'Honorarios', icon: Coins },
    { id: 'tasa', label: 'Tasa e intereses', icon: Scale },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Herramientas jurídicas</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Calculadoras</h1>
        <p className="mt-1 text-sm text-slate-600">Cálculos orientativos para Justicia Nacional / Federal.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-800">
          Resultados <strong>estimativos y no vinculantes</strong>. Verificá siempre plazos, feriados, valor de la UMA y
          aranceles con las fuentes oficiales antes de presentar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'plazos' && <PlazosCalc />}
      {tab === 'honorarios' && <HonorariosCalc />}
      {tab === 'tasa' && <TasaCalc />}
    </div>
  );
}
