export function getPropertyStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Sin definir';

  const labels: Record<string, string> = {
    disponible: 'Disponible',
    reservada: 'Reservada',
    vendida: 'Vendida',
    alquilada: 'Alquilada',
    no_disponible: 'No disponible',
  };

  return labels[status.toLowerCase()] ?? status;
}

export function getPropertyTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Sin definir';

  const labels: Record<string, string> = {
    casa: 'Casa',
    departamento: 'Departamento',
    'lote/terreno': 'Lote/Terreno',
    lote: 'Lote/Terreno',
    terreno: 'Lote/Terreno',
    local: 'Local',
    oficina: 'Oficina',
    cochera: 'Cochera',
    otro: 'Otro',
  };

  return labels[type.toLowerCase()] ?? type;
}
