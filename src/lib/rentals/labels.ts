export function getIndexTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'ICL':
      return 'ICL (Contratos de Locación · BCRA)';
    case 'IPC':
      return 'IPC (INDEC)';
    case 'CASA_PROPIA':
      return 'Casa Propia';
    case 'FIJO':
      return 'Porcentaje fijo';
    default:
      return type || 'No definido';
  }
}

export function getRentalStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'vigente':
      return 'Vigente';
    case 'finalizado':
      return 'Finalizado';
    default:
      return status || 'Desconocido';
  }
}

export function calcularProximoAjuste(
  startDate: string | null,
  lastAdjustmentDate: string | null,
  periodMonths: number | null
): Date | null {
  if (!startDate || !periodMonths) return null;
  
  const baseDateStr = lastAdjustmentDate || startDate;
  const baseDate = new Date(baseDateStr);
  
  if (isNaN(baseDate.getTime())) return null;
  
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + periodMonths);
  
  return nextDate;
}
