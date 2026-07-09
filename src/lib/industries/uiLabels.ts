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
  gestionTitulo: string;
};

const defaultTerms: IndustryTerms = {
  expedienteSingular: 'Expediente',
  expedientePlural: 'Expedientes',
  partes: 'Partes',
  gestionTitulo: 'Gestión de Expedientes',
};

const termsByIndustry: Partial<Record<IndustryType, IndustryTerms>> = {
  escribania: {
    expedienteSingular: 'Legajo',
    expedientePlural: 'Legajos',
    partes: 'Firmantes',
    gestionTitulo: 'Gestión de Legajos',
  },
};

export function getIndustryTerms(industry: IndustryType): IndustryTerms {
  return termsByIndustry[industry] ?? defaultTerms;
}
