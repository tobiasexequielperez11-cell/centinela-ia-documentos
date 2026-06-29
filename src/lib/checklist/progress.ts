export type ChecklistProgress = {
  total: number;
  fulfilled: number;
  missing: number;
  percent: number;
  isComplete: boolean;
};

export function summarizeChecklistStatuses(statuses: string[]): ChecklistProgress {
  const relevantStatuses = statuses.filter((s) => s !== 'not_required');
  const total = relevantStatuses.length;

  const fulfilled = relevantStatuses.filter((s) => s === 'received' || s === 'reviewed').length;
  const missing = relevantStatuses.filter((s) => s === 'pending' || s === 'rejected').length;

  const percent = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
  const isComplete = total > 0 && missing === 0;

  return { total, fulfilled, missing, percent, isComplete };
}
