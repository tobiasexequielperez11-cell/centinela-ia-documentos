import { FERIADOS, FERIAS_JUDICIALES } from './config';

const feriadosSet = new Set(FERIADOS);

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function estaEnFeria(iso: string): boolean {
  return FERIAS_JUDICIALES.some((f) => iso >= f.desde && iso <= f.hasta);
}

export function esDiaHabilJudicial(d: Date): boolean {
  const dow = d.getDay(); // 0 domingo, 6 sábado
  if (dow === 0 || dow === 6) return false;
  const iso = toISODate(d);
  if (feriadosSet.has(iso)) return false;
  if (estaEnFeria(iso)) return false;
  return true;
}

// Parsea 'YYYY-MM-DD' como fecha local (evita desfase de zona horaria)
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Días corridos (calendario)
export function sumarDiasCorridos(inicio: Date, dias: number): Date {
  const r = new Date(inicio);
  r.setDate(r.getDate() + dias);
  return r;
}

// Días hábiles judiciales (no cuenta el día de inicio; salta fines de semana, feriados y feria)
export function sumarDiasHabiles(inicio: Date, dias: number): Date {
  const r = new Date(inicio);
  let contados = 0;
  while (contados < dias) {
    r.setDate(r.getDate() + 1);
    if (esDiaHabilJudicial(r)) contados++;
  }
  return r;
}
