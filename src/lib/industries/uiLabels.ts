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
  },
};

export function getIndustryTerms(industry: IndustryType): IndustryTerms {
  return termsByIndustry[industry] ?? defaultTerms;
}
