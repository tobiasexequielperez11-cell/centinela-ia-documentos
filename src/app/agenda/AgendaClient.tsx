'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileText, FolderKanban, CalendarClock, CalendarPlus, Plus, X } from 'lucide-react';
import { guardarEventoManual } from './actions';
import { FERIADOS, FERIAS_JUDICIALES } from '@/lib/legal/config';

export type AgendaEvento = {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  titulo: string;
  tipo: 'documento' | 'expediente' | 'plazo' | 'evento';
  href: string;
};

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const feriadosSet = new Set(FERIADOS);

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function feriaDe(fecha: string): string | null {
  const f = FERIAS_JUDICIALES.find((x) => fecha >= x.desde && fecha <= x.hasta);
  return f ? f.nombre : null;
}

export function AgendaClient({ eventos }: { eventos: AgendaEvento[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevoDetalle, setNuevoDetalle] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');

  const crearEvento = async () => {
    if (!nuevoTitulo.trim() || !nuevaFecha) {
      setAviso('Completá título y fecha.');
      return;
    }
    setGuardando(true);
    setAviso('');
    const res = await guardarEventoManual({ titulo: nuevoTitulo, fecha: nuevaFecha, detalle: nuevoDetalle });
    setGuardando(false);
    if (res.ok) {
      setNuevoTitulo(''); setNuevaFecha(''); setNuevoDetalle('');
      setShowForm(false);
      router.refresh();
    } else {
      setAviso(res.motivo === 'no_auth' ? 'Iniciá sesión para guardar.' : (res.mensaje || 'No se pudo guardar.'));
    }
  };

  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, AgendaEvento[]>();
    for (const ev of eventos) {
      const arr = map.get(ev.fecha) ?? [];
      arr.push(ev);
      map.set(ev.fecha, arr);
    }
    return map;
  }, [eventos]);

  const primerDia = new Date(year, month, 1);
  const offset = (primerDia.getDay() + 6) % 7; // lunes primero
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const hoyIso = iso(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const celdas: Array<number | null> = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const irMes = (delta: number) => {
    const nuevo = new Date(year, month + delta, 1);
    setYear(nuevo.getFullYear());
    setMonth(nuevo.getMonth());
  };
  const irHoy = () => {
    setYear(hoy.getFullYear());
    setMonth(hoy.getMonth());
  };

  const eventosMes = eventos
    .filter((ev) => ev.fecha.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Herramientas jurídicas</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Agenda</h1>
          <p className="mt-1 text-sm text-slate-600">Feriados, feria judicial y vencimientos de tus documentos y expedientes.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Nuevo evento
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-950">Cargar evento manual</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Fecha</span>
              <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Título</span>
              <input type="text" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} placeholder="Ej: Presentar escrito - Pérez c/ García" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Detalle (opcional)</span>
              <input type="text" value={nuevoDetalle} onChange={(e) => setNuevoDetalle(e.target.value)} placeholder="Descripción adicional" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <button
              type="button"
              onClick={crearEvento}
              disabled={guardando}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            {aviso && <p className="text-center text-[11px] font-medium text-amber-700">{aviso}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Feriado</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Feria judicial</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Vencimiento documento</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Fecha de expediente</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Plazo procesal</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Recordatorio</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold capitalize text-slate-950">{MESES[month]} {year}</h2>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => irMes(-1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={irHoy} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Hoy</button>
              <button type="button" onClick={() => irMes(1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {DIAS.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {celdas.map((dia, idx) => {
              if (dia === null) return <div key={`e-${idx}`} className="min-h-[76px] rounded-lg" />;
              const fechaIso = iso(year, month, dia);
              const esFeriado = feriadosSet.has(fechaIso);
              const feria = feriaDe(fechaIso);
              const evs = eventosPorDia.get(fechaIso) ?? [];
              const esHoy = fechaIso === hoyIso;
              const bg = esFeriado ? 'bg-amber-50 border-amber-200' : feria ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100';

              return (
                <div key={fechaIso} className={`min-h-[76px] rounded-lg border p-1.5 text-left ${bg}`}>
                  <span className={`text-xs font-semibold ${esHoy ? 'flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white' : 'text-slate-600'}`}>{dia}</span>
                  {esFeriado && <p className="mt-0.5 truncate text-[10px] font-medium text-amber-700">Feriado</p>}
                  {!esFeriado && feria && <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">Feria</p>}
                  <div className="mt-0.5 space-y-0.5">
                    {evs.slice(0, 3).map((ev) => {
                      const bgColor = ev.tipo === 'documento' ? 'bg-sky-500' : ev.tipo === 'evento' ? 'bg-emerald-500' : 'bg-violet-500';
                      const content = ev.titulo;
                      const className = `block truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${bgColor}`;
                      if (ev.tipo === 'plazo' || ev.tipo === 'evento') {
                        return <div key={ev.id} title={ev.titulo} className={className}>{content}</div>;
                      }
                      return (
                        <Link key={ev.id} href={ev.href} title={ev.titulo} className={className}>
                          {content}
                        </Link>
                      );
                    })}
                    {evs.length > 3 && <span className="block text-[10px] text-slate-400">+{evs.length - 3} más</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold capitalize text-slate-950">Eventos de {MESES[month]}</h2>
          <div className="mt-3 space-y-2">
            {eventosMes.length === 0 && <p className="text-sm text-slate-500">No hay vencimientos ni fechas cargadas este mes.</p>}
            {eventosMes.map((ev) => {
              const iconBg = ev.tipo === 'documento' ? 'bg-sky-50 text-sky-600' : ev.tipo === 'evento' ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600';
              const Icon = ev.tipo === 'documento' ? FileText : ev.tipo === 'plazo' ? CalendarClock : ev.tipo === 'evento' ? CalendarPlus : FolderKanban;
              const typeLabel = ev.tipo === 'documento' ? 'Vence documento' : ev.tipo === 'plazo' ? 'Plazo procesal' : ev.tipo === 'evento' ? 'Recordatorio' : 'Expediente';
              const content = (
                <>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{ev.titulo}</span>
                    <span className="block text-xs text-slate-500">{ev.fecha.split('-').reverse().join('/')} · {typeLabel}</span>
                  </span>
                </>
              );
              const className = "flex items-start gap-2 rounded-lg border border-slate-100 p-2.5 transition hover:bg-slate-50";
              if (ev.tipo === 'plazo' || ev.tipo === 'evento') {
                return <div key={ev.id} className={className}>{content}</div>;
              }
              return (
                <Link key={ev.id} href={ev.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
