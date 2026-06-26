import type { IndustryType } from './documentTypes';

export type CaseFieldType = 'text' | 'select' | 'date';

export type CaseFieldDef = {
  key: string;
  label: string;
  type: CaseFieldType;
  options?: string[];
  sensitive?: boolean;
};

export const caseFieldsByIndustry: Record<IndustryType, CaseFieldDef[]> = {
  legal: [
    { key: 'parte_contraria', label: 'Parte contraria', type: 'text' },
    { key: 'tipo_causa', label: 'Tipo de causa', type: 'text' },
    { key: 'estado_procesal', label: 'Estado procesal', type: 'text' },
    { key: 'fecha_relevante', label: 'Fecha relevante', type: 'date' },
    {
      key: 'sensibilidad',
      label: 'Nivel de sensibilidad',
      type: 'select',
      options: ['Baja', 'Media', 'Alta'],
      sensitive: true,
    },
  ],
  general: [],
  escribania: [],
  gestoria: [],
  inmobiliaria: [],
  empresa: [],
  contable: [],
  drogueria: [],
  farma: [],
  industria: [],
  compliance: [],
  seguridad_documental: [],
};

export const caseTypesByIndustry: Record<IndustryType, string[]> = {
  legal: [
    'Caso jurídico',
    'Demanda',
    'Sucesión',
    'Contrato / Asesoramiento',
    'Reclamo',
    'Otro',
  ],
  general: ['General', 'Otro'],
  inmobiliaria: [
    'Compraventa de inmueble',
    'Alquiler',
    'Reserva',
    'Otro',
  ],
  contable: ['Carpeta contable mensual', 'Cliente', 'Proveedor', 'Otro'],
  escribania: ['Escritura', 'Poder', 'Sucesión', 'Otro'],
  gestoria: [],
  empresa: [],
  drogueria: [],
  farma: [],
  industria: [],
  compliance: [],
  seguridad_documental: [],
};

export type DashboardCardKey =
  | 'expedientes_activos'
  | 'documentos_cargados'
  | 'analisis_pendientes'
  | 'documentos_sensibles'
  | 'actividad_reciente';

export const dashboardCardsByIndustry: Record<IndustryType, DashboardCardKey[]> = {
  legal: [
    'expedientes_activos',
    'documentos_cargados',
    'analisis_pendientes',
    'documentos_sensibles',
    'actividad_reciente',
  ],
  general: ['documentos_cargados', 'analisis_pendientes', 'actividad_reciente'],
  escribania: [],
  gestoria: [],
  inmobiliaria: [],
  empresa: [],
  contable: [],
  drogueria: [],
  farma: [],
  industria: [],
  compliance: [],
  seguridad_documental: [],
};

export const caseStatusesByIndustry: Record<IndustryType, string[]> = {
  legal: ['Activo', 'En trámite', 'Con observaciones', 'Archivado'],
  general: ['Activo', 'Archivado'],
  escribania: [],
  gestoria: [],
  inmobiliaria: [],
  empresa: [],
  contable: [],
  drogueria: [],
  farma: [],
  industria: [],
  compliance: [],
  seguridad_documental: [],
};

export const legacyCaseStatusLabels: Record<string, string> = {
  new: 'Nuevo',
  in_review: 'En revisión',
  incomplete: 'Incompleto',
  waiting_client: 'Esperando cliente',
  complete: 'Completo',
  completed: 'Completo',
  archived: 'Archivado',
};

export function getCaseFields(industry: IndustryType): CaseFieldDef[] {
  return caseFieldsByIndustry[industry] ?? [];
}

export function getCaseStatuses(industry: IndustryType): string[] {
  const statuses = caseStatusesByIndustry[industry];
  return statuses && statuses.length ? statuses : caseStatusesByIndustry.general;
}

export function getCaseTypes(industry: IndustryType): string[] {
  const types = caseTypesByIndustry[industry];
  return types && types.length ? types : caseTypesByIndustry.general;
}

export function getDashboardCards(industry: IndustryType): DashboardCardKey[] {
  const cards = dashboardCardsByIndustry[industry];
  return cards && cards.length ? cards : dashboardCardsByIndustry.general;
}

export function getCaseStatusLabel(status?: string | null) {
  if (!status) return 'Sin estado';
  return legacyCaseStatusLabels[status] ?? status;
}

export function getAllowedCaseStatuses(industry: IndustryType): string[] {
  return [
    ...getCaseStatuses(industry),
    ...Object.keys(legacyCaseStatusLabels),
  ];
}
