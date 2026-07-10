// Utilidades para clasificar las fechas detectadas por la IA.
// Objetivo: distinguir plazos accionables (vencimientos, emisiones) de
// fechas meramente informativas (ej. fechas de nacimiento).

const PATRONES_FECHA_INFORMATIVA = [
  /nacimiento/i,
  /nacid[oa]s?/i,
  /fecha\s+de\s+nac/i,
  /f\.?\s*nac\b/i,
];

/** Devuelve true si la descripción corresponde a una fecha de nacimiento. */
export function esFechaNacimiento(descripcion?: string | null): boolean {
  if (!descripcion) return false;
  return PATRONES_FECHA_INFORMATIVA.some((re) => re.test(descripcion));
}

/** Un plazo es "accionable" si NO es una fecha meramente informativa. */
export function esPlazoAccionable(plazo?: {
  descripcion?: string | null;
  fecha?: string | null;
}): boolean {
  return !esFechaNacimiento(plazo?.descripcion);
}
