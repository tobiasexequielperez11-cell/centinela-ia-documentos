import type { IndustryType } from './documentTypes';

// --- Título de grupo del sidebar, por rubro ---
const groupLabelOverrides: Partial<Record<IndustryType, Record<string, string>>> = {
  escribania: { 'Herramientas jurídicas': 'Herramientas notariales' },
};

export function getNavGroupLabel(group: string, industry: IndustryType): string {
  return groupLabelOverrides[industry]?.[group] ?? group;
}

// --- Nombre de ítems del sidebar, por rubro (clave = href) ---
const navLabelOverrides: Partial<Record<IndustryType, Record<string, string>>> = {
  escribania: { '/expedientes': 'Legajos' },
};

export function getNavItemLabel(
  item: { href: string; name: string },
  industry: IndustryType
): string {
  return navLabelOverrides[industry]?.[item.href] ?? item.name;
}

const navDescriptionOverrides: Partial<Record<IndustryType, Record<string, string>>> = {
  escribania: {
    '/expedientes': 'Gestión operativa de legajos vinculados.',
    '/buscar': 'Búsqueda avanzada de legajos y documentos.',
    '/calculadoras': 'Sellos, ITI, honorarios y aportes notariales.',
    '/modelos': 'Escrituras, poderes, actas y autorizaciones notariales.',
  },
};

export function getNavItemDescription(
  item: { href: string; description?: string },
  industry: IndustryType
): string {
  return navDescriptionOverrides[industry]?.[item.href] ?? item.description ?? '';
}

// --- Terminología de entidades, por rubro (para pantallas internas) ---
export type IndustryTerms = {
  expedienteSingular: string;
  expedientePlural: string;
  partes: string;
  listaEyebrow: string;
  listaTitulo: string;
  listaSubtitulo: string;
  nuevoCta: string;
  itemSinTitulo: string;
  vacioSinResultados: string;
  vacioSinDatos: string;
  vacioAyuda: string;
  // --- Detalle ---
  detalleEyebrow: string;
  datosTitulo: string;
  editarDatos: string;
  actualizarCta: string;
  docsTitulo: string;
  docsSubtitulo: string;
  docsVacio: string;
  copilotoTitulo: string;
  copilotoSubtitulo: string;
  resumenVacio: string;
  // --- Dashboard ---
  dashboardSubtitulo: string;
  // --- Radar de plazos / vigencias ---
  radarTitulo: string;
  radarSubtitulo: string;
};

const defaultTerms: IndustryTerms = {
  expedienteSingular: 'Expediente',
  expedientePlural: 'Expedientes',
  partes: 'Partes',
  listaEyebrow: 'EXPEDIENTES',
  listaTitulo: 'Gestión de Casos',
  listaSubtitulo: 'Todos tus casos, clientes, estados y documentación asociada en un único panel.',
  nuevoCta: 'Nuevo expediente',
  itemSinTitulo: 'Expediente sin titulo',
  vacioSinResultados: 'No se encontraron expedientes para',
  vacioSinDatos: 'Todavía no hay expedientes.',
  vacioAyuda: 'Crea el primer expediente para comenzar la gestion documental.',
  detalleEyebrow: 'DETALLE DE EXPEDIENTE',
  datosTitulo: 'Datos del expediente',
  editarDatos: 'Editar datos del expediente',
  actualizarCta: 'Actualizar expediente',
  docsTitulo: 'Documentos del expediente',
  docsSubtitulo: 'Documentos cargados en la bóveda y asociados a este expediente.',
  docsVacio: 'Aún no hay documentos en este expediente.',
  copilotoTitulo: 'Copiloto — Resumen del expediente',
  copilotoSubtitulo: 'Panorama ejecutivo del caso generado por IA a partir de los documentos analizados y las actuaciones.',
  resumenVacio: 'Todavía no hay documentos analizados en este expediente. Analizá al menos un documento con IA para poder generar el resumen.',
  dashboardSubtitulo: 'Tu panel operativo de expedientes, documentos e IA.',
  radarTitulo: 'Radar de plazos',
  radarSubtitulo: 'Plazos vencidos y próximos (hasta 30 días), ordenados por urgencia.',
};

const termsByIndustry: Partial<Record<IndustryType, IndustryTerms>> = {
  escribania: {
    expedienteSingular: 'Legajo',
    expedientePlural: 'Legajos',
    partes: 'Firmantes',
    listaEyebrow: 'LEGAJOS',
    listaTitulo: 'Gestión de Legajos',
    listaSubtitulo: 'Todos tus legajos, firmantes, estados y documentación asociada en un único panel.',
    nuevoCta: 'Nuevo legajo',
    itemSinTitulo: 'Legajo sin título',
    vacioSinResultados: 'No se encontraron legajos para',
    vacioSinDatos: 'Todavía no hay legajos.',
    vacioAyuda: 'Creá el primer legajo para comenzar la gestión documental.',
    detalleEyebrow: 'DETALLE DE LEGAJO',
    datosTitulo: 'Datos del legajo',
    editarDatos: 'Editar datos del legajo',
    actualizarCta: 'Actualizar legajo',
    docsTitulo: 'Documentos del legajo',
    docsSubtitulo: 'Documentos cargados en la bóveda y asociados a este legajo.',
    docsVacio: 'Aún no hay documentos en este legajo.',
    copilotoTitulo: 'Copiloto — Resumen del legajo',
    copilotoSubtitulo: 'Panorama ejecutivo del legajo generado por IA a partir de los documentos analizados y las actuaciones.',
    resumenVacio: 'Todavía no hay documentos analizados en este legajo. Analizá al menos un documento con IA para poder generar el resumen.',
    dashboardSubtitulo: 'Tu panel operativo de legajos, documentos e IA.',
    radarTitulo: 'Radar de vigencias',
    radarSubtitulo: 'Vigencias de certificados y plazos próximos (hasta 30 días), ordenados por urgencia.',
  },
};

export function getIndustryTerms(industry: IndustryType): IndustryTerms {
  return termsByIndustry[industry] ?? defaultTerms;
}
