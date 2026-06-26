export type IndustryType =
  | 'general'
  | 'legal'
  | 'escribania'
  | 'gestoria'
  | 'inmobiliaria'
  | 'empresa'
  | 'contable'
  | 'drogueria'
  | 'farma'
  | 'industria'
  | 'compliance'
  | 'seguridad_documental';

export const INDUSTRY_TYPES: IndustryType[] = [
  'general',
  'legal',
  'escribania',
  'gestoria',
  'inmobiliaria',
  'empresa',
  'contable',
  'drogueria',
  'farma',
  'industria',
  'compliance',
  'seguridad_documental',
];

export const industryLabels: Record<IndustryType, string> = {
  general: 'General',
  legal: 'Jurídico',
  escribania: 'Escribanía',
  gestoria: 'Gestoría',
  inmobiliaria: 'Inmobiliaria',
  empresa: 'Empresa',
  contable: 'Contable',
  drogueria: 'Droguería',
  farma: 'Farma',
  industria: 'Industria',
  compliance: 'Compliance',
  seguridad_documental: 'Seguridad documental',
};

export const documentTypesByIndustry: Record<IndustryType, string[]> = {
  general: ['DNI', 'Contrato', 'Factura', 'Recibo', 'Escritura', 'Constancia fiscal', 'Otro'],
  legal: [
    'Demanda',
    'Escrito',
    'Poder',
    'Contrato',
    'Certificado',
    'Prueba documental',
    'Resolución',
    'Sentencia',
    'Cédula',
    'Acta',
  ],
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

export function isIndustryType(value: unknown): value is IndustryType {
  return typeof value === 'string' && INDUSTRY_TYPES.includes(value as IndustryType);
}

export function normalizeIndustryType(value: unknown): IndustryType {
  return isIndustryType(value) ? value : 'general';
}

export function getDocumentTypes(industry: IndustryType): string[] {
  const types = documentTypesByIndustry[industry];
  return types && types.length ? types : documentTypesByIndustry.general;
}

export function getDocumentTypeLabel(value?: string | null) {
  if (!value) return 'Sin clasificar';

  const labels: Record<string, string> = {
    dni: 'DNI',
    contrato: 'Contrato',
    factura: 'Factura',
    recibo: 'Recibo',
    escritura: 'Escritura',
    constancia_fiscal: 'Constancia fiscal',
    demanda: 'Demanda',
    escrito: 'Escrito',
    boleto_compraventa: 'Boleto de compraventa',
    certificado: 'Certificado',
    poder: 'Poder',
    garantia: 'Garantía',
    reserva: 'Reserva',
    general: 'General',
    rental: 'Contrato de alquiler',
    real_estate_purchase: 'Compraventa inmobiliaria',
    otro: 'Otro',
  };

  return labels[value] ?? value;
}
