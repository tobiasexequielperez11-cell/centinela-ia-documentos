export function getClientStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'activo':
      return 'Activo';
    case 'en_seguimiento':
      return 'En seguimiento';
    case 'cerrado':
      return 'Cerrado';
    case 'descartado':
      return 'Descartado';
    default:
      return status || 'Sin definir';
  }
}

export function getClientTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'comprador':
      return 'Comprador';
    case 'inquilino':
      return 'Inquilino';
    case 'vendedor':
      return 'Vendedor';
    case 'propietario':
      return 'Propietario';
    case 'otro':
      return 'Otro';
    default:
      return type || 'Sin definir';
  }
}

export function getOperationInterestLabel(interest: string | null | undefined): string {
  switch (interest) {
    case 'compra':
      return 'Compra';
    case 'alquiler':
      return 'Alquiler';
    default:
      return interest || 'Sin definir';
  }
}

export function getDesiredPropertyTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'casa':
      return 'Casa';
    case 'departamento':
      return 'Departamento';
    case 'lote':
      return 'Lote/Terreno';
    case 'local':
      return 'Local';
    case 'oficina':
      return 'Oficina';
    case 'cochera':
      return 'Cochera';
    case 'cualquiera':
      return 'Cualquiera';
    default:
      return type || 'Sin definir';
  }
}
