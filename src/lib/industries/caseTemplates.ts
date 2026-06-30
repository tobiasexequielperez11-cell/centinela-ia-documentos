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
      'DNI / CUIT del cliente',
      'Constancia de mediación previa',
      'Liquidación / detalle del monto reclamado',
      'Prueba documental',
      'Escrito de demanda',
      'Comprobante de tasa de justicia',
      'Bono / derecho fijo (Colegio de Abogados)',
      'Cédula de notificación',
    ],
  },
  Sucesión: {
    checklist: [
      'Partida de defunción',
      'Partidas de vínculo (nacimiento / matrimonio)',
      'DNI de los herederos',
      'Títulos de propiedad de los bienes',
      'Denuncia de bienes / inventario',
      'Avalúo fiscal de inmuebles',
      'Publicación de edictos',
      'Declaratoria de herederos',
    ],
  },
  'Contrato / Asesoramiento': {
    checklist: [
      'DNI / CUIT de las partes',
      'Poderes / personería (si hay representantes)',
      'Borrador del contrato',
      'Documentación de respaldo (antecedentes)',
      'Informe de dominio (si hay inmuebles)',
      'Contrato firmado',
    ],
  },
  Reclamo: {
    checklist: [
      'DNI / CUIT del reclamante',
      'Documentación del reclamo',
      'Intercambio epistolar (cartas documento / telegramas)',
      'Constancia de notificación / recepción',
      'Prueba documental (facturas, fotos, presupuestos)',
      'Respuesta de la contraparte',
    ],
  },
  'Caso jurídico': {
    checklist: [
      'Poder / carta poder',
      'DNI del cliente',
      'Constancia de domicilio',
      'Prueba documental',
      'Escrito principal',
      'Bono / derecho fijo (Colegio de Abogados)',
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
