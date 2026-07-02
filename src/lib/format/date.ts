export function formatPlazoDate(value?: string | null) {
  if (!value) return '—';
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return value;
}
