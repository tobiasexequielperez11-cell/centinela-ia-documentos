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

export function formatPeriodo(period: string): string {
  if (!period) return '';
  const [year, month] = period.split('-');
  if (!year || !month) return period;
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${meses[monthIndex]} ${year}`;
  }
  return period;
}

export function estadoVencimiento(proxAjuste: Date | null, status: string | null): { tipo: 'vencido' | 'proximo' | 'al_dia' | 'sin_dato'; dias: number | null; label: string } {
  if (status !== 'vigente' || !proxAjuste) {
    return { tipo: 'sin_dato', dias: null, label: '' };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const ajusteDate = new Date(proxAjuste);
  ajusteDate.setHours(0, 0, 0, 0);

  const diffTime = ajusteDate.getTime() - hoy.getTime();
  const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return { tipo: 'vencido', dias, label: `Ajuste vencido hace ${Math.abs(dias)} día(s)` };
  } else if (dias >= 0 && dias <= 30) {
    return { tipo: 'proximo', dias, label: dias === 0 ? 'Ajusta hoy' : `Ajusta en ${dias} día(s)` };
  } else {
    return { tipo: 'al_dia', dias, label: `Ajusta en ${dias} días` };
  }
}
