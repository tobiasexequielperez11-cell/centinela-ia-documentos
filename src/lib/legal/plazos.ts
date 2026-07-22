import { FERIADOS, FERIAS_JUDICIALES } from './config';

const feriadosSet = new Set(FERIADOS);

export function toISODate(d: Date): string {
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

// ── Art. 158 CPCCN — ampliación de plazos por distancia ──
// "Un día por cada 200 km, o fracción que no baje de 100 km."
export function diasAmpliacionPorDistancia(km: number): number {
  if (!Number.isFinite(km) || km <= 0) return 0;
  const enteros = Math.floor(km / 200);
  const resto = km % 200;
  return enteros + (resto >= 100 ? 1 : 0);
}

export type ResultadoVencimiento = {
  ok: boolean;
  motivo?: string;
  diasHabiles?: number;
  diasAmpliacion?: number;
  diasTotales?: number;
  cuentaDesde?: string;   // primer día hábil computado (AAAA-MM-DD)
  vencimiento?: string;   // AAAA-MM-DD
  pasos?: string[];
};

// Calcula el vencimiento de un plazo procesal en días hábiles judiciales.
// El plazo corre desde el día hábil siguiente a la notificación (art. 156 CPCCN)
// y salta fines de semana, feriados y feria judicial (motor existente).
export function calcularVencimientoProcesal(args: {
  fechaNotificacion: string; // AAAA-MM-DD
  diasHabiles: number;
  kmDistancia?: number;
}): ResultadoVencimiento {
  const inicio = parseISODate(args.fechaNotificacion);
  if (!inicio) {
    return { ok: false, motivo: 'Fecha de notificación inválida (usar AAAA-MM-DD).' };
  }
  if (!Number.isFinite(args.diasHabiles) || args.diasHabiles <= 0) {
    return { ok: false, motivo: 'La cantidad de días hábiles debe ser mayor a 0.' };
  }

  const ampliacion = diasAmpliacionPorDistancia(args.kmDistancia ?? 0);
  const total = args.diasHabiles + ampliacion;

  const primerDia = sumarDiasHabiles(inicio, 1);
  const vencimiento = sumarDiasHabiles(inicio, total);

  const pasos: string[] = [];
  pasos.push(`Notificación: ${toISODate(inicio)}.`);
  pasos.push(`El plazo empieza a correr el día hábil siguiente: ${toISODate(primerDia)} (art. 156 CPCCN).`);
  pasos.push(`Plazo legal: ${args.diasHabiles} días hábiles.`);
  if (ampliacion > 0) {
    pasos.push(`Ampliación por distancia (${args.kmDistancia} km): +${ampliacion} día(s) (art. 158 CPCCN).`);
  }
  pasos.push(`Se cuentan ${total} días hábiles salteando fines de semana, feriados y feria judicial.`);
  pasos.push(`Vencimiento: ${toISODate(vencimiento)}.`);

  return {
    ok: true,
    diasHabiles: args.diasHabiles,
    diasAmpliacion: ampliacion,
    diasTotales: total,
    cuentaDesde: toISODate(primerDia),
    vencimiento: toISODate(vencimiento),
    pasos,
  };
}
