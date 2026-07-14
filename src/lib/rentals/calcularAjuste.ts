export function periodoDeFecha(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  // Extrae YYYY-MM
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export type ResultadoAjuste = {
  ok: boolean;
  montoSugerido?: number;
  coeficiente?: number;
  periodoBase?: string;
  periodoObjetivo?: string;
  motivo?: string;
};

export function calcularAjuste(params: {
  indexType: string | null;
  fixedPct: number | null;
  montoActual: number | null;
  periodoBase: string;
  periodoObjetivo: string;
  valorBase?: number | null;
  valorObjetivo?: number | null;
}): ResultadoAjuste {
  const { indexType, fixedPct, montoActual, periodoBase, periodoObjetivo, valorBase, valorObjetivo } = params;

  if (!montoActual) {
    return { ok: false, motivo: 'Falta cargar el monto actual del contrato.' };
  }

  if (indexType === 'FIJO') {
    const pct = fixedPct || 0;
    const coeficiente = 1 + pct / 100;
    const montoSugerido = Number((montoActual * coeficiente).toFixed(2));
    return { ok: true, montoSugerido, coeficiente, periodoBase, periodoObjetivo };
  }

  if (indexType === 'ICL' || indexType === 'IPC' || indexType === 'CASA_PROPIA') {
    if (valorBase == null) {
      return { ok: false, motivo: `Falta cargar el índice ${indexType} de ${periodoBase}` };
    }
    if (valorObjetivo == null) {
      return { ok: false, motivo: `Falta cargar el índice ${indexType} de ${periodoObjetivo}` };
    }

    const coeficiente = valorObjetivo / valorBase;
    const montoSugerido = Number((montoActual * coeficiente).toFixed(2));

    return { ok: true, montoSugerido, coeficiente, periodoBase, periodoObjetivo };
  }

  return { ok: false, motivo: 'Índice de ajuste desconocido o no configurado.' };
}
