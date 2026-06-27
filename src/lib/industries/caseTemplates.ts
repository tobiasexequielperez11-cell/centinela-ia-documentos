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
  'Compraventa de inmueble': {
    checklist: [
      'Boleto de compraventa',
      'Título de propiedad',
      'DNI/CUIT de las partes',
      'Libre deuda / impuestos',
      'Tasación',
      'Escritura traslativa de dominio',
    ],
  },
  Alquiler: {
    checklist: [
      'Contrato de alquiler',
      'DNI/CUIT del inquilino',
      'Garantía',
      'Comprobante de ingresos',
      'Inventario del inmueble',
    ],
  },
  Reserva: {
    checklist: [
      'Comprobante de reserva',
      'DNI del interesado',
      'Datos del inmueble',
      'Condiciones de la operación',
    ],
  },
  Escritura: {
    checklist: [
      'Título de propiedad antecedente',
      'DNI/CUIT de las partes',
      'Libre deuda municipal/provincial',
      'Certificado de dominio e inhibición',
      'Plano / mensura',
      'Comprobante de pago de impuestos',
    ],
  },
  Poder: {
    checklist: [
      'DNI del otorgante',
      'Datos del apoderado',
      'Objeto del poder',
      'Minuta / borrador',
    ],
  },
  'Certificación de firmas': {
    checklist: [
      'Documento a certificar',
      'DNI del firmante',
      'Constancia de comparecencia',
    ],
  },
  'Acta notarial': {
    checklist: [
      'Objeto del acta',
      'DNI de los comparecientes',
      'Documentación de respaldo',
    ],
  },
  'Legajo de empleado': {
    checklist: [
      'DNI',
      'CUIL',
      'Contrato de trabajo',
      'Alta temprana (AFIP)',
      'Datos bancarios',
      'Documentación de cargas de familia',
    ],
  },
  'Contrato comercial': {
    checklist: [
      'Borrador del contrato',
      'DNI/CUIT de las partes',
      'Documentación de respaldo',
      'Contrato firmado',
    ],
  },
  Proveedor: {
    checklist: [
      'Constancia de inscripción (AFIP)',
      'Datos bancarios / CBU',
      'Contrato o acuerdo',
      'Facturas / comprobantes',
    ],
  },
  'Documentación societaria': {
    checklist: [
      'Estatuto / contrato social',
      'Acta de designación de autoridades',
      'Inscripción registral',
      'Poderes vigentes',
    ],
  },
  Otro: fallbackTemplate,
};

export function getCaseTemplate(caseType?: string | null): CaseTemplate {
  if (!caseType) return fallbackTemplate;

  return caseTemplatesByType[caseType] ?? fallbackTemplate;
}
