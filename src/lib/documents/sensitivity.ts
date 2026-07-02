export function sensitivityLabel(value?: string | null) {
  const labels: Record<string, string> = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    critical: 'Crítico',
    bajo: 'Bajo',
    medio: 'Medio',
    alto: 'Alto',
    critico: 'Crítico',
    crítico: 'Crítico',
  };

  return labels[String(value ?? '').toLowerCase()] ?? value ?? 'Sin clasificar';
}

export function isSensitiveDocument(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();
  return ['high', 'critical', 'alto', 'alta', 'critico', 'crítico', 'critica', 'crítica'].includes(
    normalized
  );
}
