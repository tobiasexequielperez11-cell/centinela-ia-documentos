import { TASA_JUSTICIA_PORCENTAJE } from './config';

export type ResultadoTasaJusticia =
  | { ok: true; base: number; porcentaje: number; tasa: number }
  | { ok: false; motivo: string };

/**
 * Tasa de justicia (Ley 23.898) — general: % del monto del proceso.
 * Usa el porcentaje de config.ts (3%) salvo que se pase uno explícito.
 */
export function calcularTasaJusticia(input: {
  monto: number;
  porcentaje?: number;
}): ResultadoTasaJusticia {
  const base = Number(input.monto);
  if (!Number.isFinite(base) || base <= 0) {
    return { ok: false, motivo: 'El monto del proceso debe ser un número mayor a cero.' };
  }
  const porcentaje =
    Number.isFinite(input.porcentaje) && (input.porcentaje as number) > 0
      ? (input.porcentaje as number)
      : TASA_JUSTICIA_PORCENTAJE;
  const tasa = Math.round(base * (porcentaje / 100));
  return { ok: true, base, porcentaje, tasa };
}
