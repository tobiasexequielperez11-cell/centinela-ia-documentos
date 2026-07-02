export const roleOptions = [
  { value: 'employee', label: 'Operador' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'client', label: 'Cliente' },
];

export function roleLabel(role?: string | null) {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    employee: 'Operador',
    auditor: 'Auditor',
    client: 'Cliente',
  };
  return labels[role ?? ''] ?? role ?? 'Sin rol';
}

export function roleDescription(role?: string | null) {
  const descriptions: Record<string, string> = {
    admin: 'Puede administrar usuarios, accesos y operación general.',
    employee: 'Puede operar expedientes, documentos y análisis.',
    auditor: 'Puede revisar trazabilidad, actividad y documentación.',
    client: 'Perfil pensado para acceso limitado del cliente.',
  };
  return descriptions[role ?? ''] ?? 'Rol pendiente de definición.';
}

export function roleTone(role?: string | null) {
  if (role === 'admin') return 'bg-slate-950 text-white';
  if (role === 'auditor') return 'bg-violet-50 text-violet-700';
  if (role === 'client') return 'bg-amber-50 text-amber-700';
  return 'bg-sky-50 text-sky-700';
}
