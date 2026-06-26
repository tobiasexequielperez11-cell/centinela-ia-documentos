export type CaseTemplate = {
  checklist: string[];
  defaultStatus?: string;
};

const fallbackTemplate: CaseTemplate = {
  checklist: ['Documento principal', 'Documentación de respaldo'],
};

export const caseTemplatesByType: Record<string, CaseTemplate> = {
  Demanda: {
    checklist: [
      'Poder / autorización',
      'DNI del cliente',
      'Prueba documental',
      'Escrito de demanda',
      'Cédula de notificación',
      'Comprobante de tasa de justicia',
    ],
  },
  Sucesión: {
    checklist: [
      'Partida de defunción',
      'Partidas de vínculo (nacimiento/matrimonio)',
      'Títulos de propiedad',
      'DNI de herederos',
      'Declaratoria de herederos',
    ],
  },
  'Contrato / Asesoramiento': {
    checklist: [
      'Borrador del contrato',
      'DNI/CUIT de las partes',
      'Documentación de respaldo',
      'Contrato firmado',
    ],
  },
  Reclamo: {
    checklist: [
      'Documentación del reclamo',
      'Prueba documental',
      'Carta documento / nota',
      'Respuesta de la contraparte',
    ],
  },
  'Caso jurídico': {
    checklist: [
      'Poder',
      'DNI del cliente',
      'Prueba documental',
      'Escrito principal',
    ],
  },
  Otro: fallbackTemplate,
};

export function getCaseTemplate(caseType?: string | null): CaseTemplate {
  if (!caseType) return fallbackTemplate;

  return caseTemplatesByType[caseType] ?? fallbackTemplate;
}
