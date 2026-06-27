const auditActionLabels: Record<string, string> = {
  organization_created: 'Organización creada',
  organization_industry_updated: 'Rubro de organización actualizado',
  case_created: 'Expediente creado',
  case_updated: 'Expediente actualizado',
  case_status_updated: 'Estado de expediente actualizado',
  case_checklist_created: 'Checklist documental creado',
  checklist_item_toggled: 'Ítem de checklist actualizado',
  checklist_item_linked: 'Documento vinculado al checklist',
  checklist_item_unlinked: 'Documento desvinculado del checklist',
  document_uploaded: 'Documento cargado',
  document_viewed: 'Documento visualizado',
  document_analyzed: 'Análisis documental',
  document_analyzed_beta: 'Análisis documental beta',
  user_access_updated: 'Acceso de usuario actualizado',
  user_invitation_created: 'Invitación creada',
  user_invitation_cancelled: 'Invitación cancelada',
  user_invitation_accepted: 'Invitación aceptada',
  user_invitation_status_updated: 'Estado de invitación actualizado',
  invitation_created: 'Invitación creada',
  invitation_cancelled: 'Invitación cancelada',
  invitation_accepted: 'Invitación aceptada',
  user_role_updated: 'Rol actualizado',
};

export function formatAuditActionLabel(action?: string | null): string {
  if (!action) return 'Evento sin acción';

  const label = auditActionLabels[action];
  if (label) return label;

  return action
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
