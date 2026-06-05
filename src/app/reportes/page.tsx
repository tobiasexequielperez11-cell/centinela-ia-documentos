import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/auth/getUserProfile';
import { analyzeDocument } from '../documentos/actions';

type ReportView =
  | 'general'
  | 'documentos'
  | 'ia'
  | 'sensibilidad'
  | 'auditoria'
  | 'invitaciones';

type AuditFilter = 'todos' | 'documentos' | 'ia' | 'expedientes' | 'invitaciones';

interface ReportsPageProps {
  searchParams: Promise<{ vista?: string; tipo?: string }>;
}

interface CaseRecord {
  id: string;
  title: string;
  client_name?: string | null;
  case_type?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface DocumentRecordForReport {
  id: string;
  file_name: string;
  document_type?: string | null;
  sensitivity_level: string;
  file_size?: number | null;
  file_mime_type?: string | null;
  created_at?: string | null;
}

interface AiOutputRecordForReport {
  id: string;
  document_id?: string | null;
  output_type: string;
  model_name?: string | null;
  created_at?: string | null;
  result_json?: {
    resumen?: string;
    tipo_documental_detectado?: string;
    sensibilidad_detectada?: string;
    caracteres_extraidos?: number;
  } | null;
}

interface AuditLogRecordForReport {
  id: string;
  organization_id?: string | null;
  user_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface ProfileRecordForReport {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface InvitationMetricsRecord {
  total_invitations?: number | null;
  pending_invitations?: number | null;
  accepted_invitations?: number | null;
  cancelled_invitations?: number | null;
  expired_invitations?: number | null;
  last_invitation_created_at?: string | null;
}

interface InvitationReportRecord {
  id: string;
  organization_id?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  invited_by?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  cancelled_at?: string | null;
  operational_status?: string | null;
  is_expired?: boolean | null;
  requires_attention?: boolean | null;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatSize(size?: number | null) {
  if (!size) return '-';

  const mb = size / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function sensitivityLabel(value?: string | null) {
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

  return labels[String(value ?? '').toLowerCase()] ?? value ?? 'No definida';
}

function sensitivityRank(value?: string | null) {
  const normalized = String(value ?? '').toLowerCase();

  if (normalized === 'critical' || normalized === 'critico' || normalized === 'crítico') {
    return 4;
  }

  if (normalized === 'high' || normalized === 'alto') return 3;
  if (normalized === 'medium' || normalized === 'medio') return 2;
  if (normalized === 'low' || normalized === 'bajo') return 1;

  return 0;
}

function statusLabel(value?: string | null) {
  const labels: Record<string, string> = {
    new: 'Nuevo',
    incomplete: 'Incompleto',
    waiting_client: 'Esperando cliente',
    in_review: 'En revisión',
    completed: 'Completo',
    archived: 'Archivado',
  };

  return labels[value ?? ''] ?? value ?? 'Sin estado';
}

function invitationStatusLabel(value?: string | null) {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    cancelled: 'Cancelada',
    expired: 'Vencida',
  };

  return labels[value ?? ''] ?? value ?? 'Sin estado';
}

function invitationStatusTone(value?: string | null, isExpired?: boolean | null) {
  if (isExpired || value === 'expired') return 'bg-amber-50 text-amber-700';
  if (value === 'accepted') return 'bg-emerald-50 text-emerald-700';
  if (value === 'cancelled') return 'bg-rose-50 text-rose-700';
  if (value === 'pending') return 'bg-sky-50 text-sky-700';

  return 'bg-slate-100 text-slate-600';
}

function invitationRoleLabel(value?: string | null) {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    employee: 'Operador',
    auditor: 'Auditor',
    client: 'Cliente',
  };

  return labels[value ?? ''] ?? value ?? 'Sin rol';
}

function actionLabel(value: string) {
  const labels: Record<string, string> = {
    organization_created: 'Organización creada',
    case_created: 'Expediente creado',
    case_status_updated: 'Estado de expediente actualizado',
    document_uploaded: 'Documento cargado',
    document_viewed: 'Documento visualizado',
    document_analyzed_simulated: 'Documento analizado con IA simulada',
    user_access_updated: 'Acceso de usuario actualizado',
    user_invitation_created: 'Invitación de usuario creada',
    user_invitation_cancelled: 'Invitación de usuario cancelada',
    user_invitation_accepted: 'Invitación de usuario aceptada',
    user_invitation_status_updated: 'Estado de invitación actualizado',
    invitation_created: 'Invitación creada',
    invitation_cancelled: 'Invitación cancelada',
    invitation_accepted: 'Invitación aceptada',
  };

  return labels[value] ?? value;
}

function actionTone(value: string) {
  if (value.includes('invitation') || value.includes('invitacion')) {
    return 'bg-indigo-50 text-indigo-700';
  }

  if (value.includes('analyzed')) {
    return 'bg-sky-50 text-sky-700';
  }

  if (value.includes('uploaded')) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (value.includes('status')) {
    return 'bg-amber-50 text-amber-700';
  }

  if (value.includes('viewed')) {
    return 'bg-slate-100 text-slate-600';
  }

  if (value.includes('created')) {
    return 'bg-violet-50 text-violet-700';
  }

  return 'bg-slate-100 text-slate-600';
}

function getPercentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getMetricValue(value?: number | null) {
  return value ?? 0;
}

function getAnalysisCountByDocument(aiOutputs: AiOutputRecordForReport[]) {
  const map = new Map<string, number>();

  for (const item of aiOutputs) {
    const documentId = String(item.document_id || '');
    if (!documentId) continue;

    map.set(documentId, (map.get(documentId) ?? 0) + 1);
  }

  return map;
}

function getDocumentAiLabel(count: number) {
  if (count <= 0) return 'Pendiente';
  if (count === 1) return 'Analizado IA';
  return `Reanalizado x${count}`;
}

function getDocumentAiClass(count: number) {
  if (count <= 0) return 'bg-slate-100 text-slate-600';
  if (count === 1) return 'bg-sky-50 text-sky-700';
  return 'bg-emerald-50 text-emerald-700';
}

function isValidView(value?: string): value is ReportView {
  return (
    value === 'general' ||
    value === 'documentos' ||
    value === 'ia' ||
    value === 'sensibilidad' ||
    value === 'auditoria' ||
    value === 'invitaciones'
  );
}

function isValidAuditFilter(value?: string): value is AuditFilter {
  return (
    value === 'todos' ||
    value === 'documentos' ||
    value === 'ia' ||
    value === 'expedientes' ||
    value === 'invitaciones'
  );
}

function uniqueDocuments(documents: DocumentRecordForReport[]) {
  const map = new Map<string, DocumentRecordForReport>();

  for (const document of documents) {
    map.set(document.id, document);
  }

  return Array.from(map.values());
}

function metadataText(
  metadata: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = metadata?.[key];

  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';

  return null;
}

function getActorLabel(
  log: AuditLogRecordForReport,
  profilesById: Map<string, ProfileRecordForReport>
) {
  if (!log.user_id) return 'Sistema';

  const profile = profilesById.get(log.user_id);

  if (profile?.full_name) return profile.full_name;
  if (profile?.email) return profile.email;

  return `Usuario ${log.user_id.slice(0, 8)}...`;
}

function getActorRole(
  log: AuditLogRecordForReport,
  profilesById: Map<string, ProfileRecordForReport>
) {
  if (!log.user_id) return 'Automático';

  const profile = profilesById.get(log.user_id);

  if (profile?.role) return profile.role;

  return 'Usuario';
}

function getResourceLabel(
  log: AuditLogRecordForReport,
  documentsById: Map<string, DocumentRecordForReport>,
  casesById: Map<string, CaseRecord>
) {
  const metadataFileName = metadataText(log.metadata, 'file_name');
  const metadataCaseTitle = metadataText(log.metadata, 'case_title');
  const metadataTitle = metadataText(log.metadata, 'title');
  const metadataEmail =
    metadataText(log.metadata, 'email') ??
    metadataText(log.metadata, 'invitation_email') ??
    metadataText(log.metadata, 'invited_email');

  if (metadataFileName) return metadataFileName;
  if (metadataCaseTitle) return metadataCaseTitle;
  if (metadataTitle) return metadataTitle;

  if (
    log.resource_type === 'user_invitation' ||
    log.resource_type === 'invitation' ||
    log.action.includes('invitation') ||
    log.action.includes('invitacion')
  ) {
    return metadataEmail ?? 'Invitación de usuario';
  }

  if (log.resource_type === 'document' && log.resource_id) {
    return (
      documentsById.get(log.resource_id)?.file_name ??
      `Documento ${log.resource_id.slice(0, 8)}...`
    );
  }

  if (log.resource_type === 'case' && log.resource_id) {
    return (
      casesById.get(log.resource_id)?.title ??
      `Expediente ${log.resource_id.slice(0, 8)}...`
    );
  }

  if (log.resource_type === 'organization') return 'Organización';

  return log.resource_type ?? 'Recurso no definido';
}

function getAuditDetail(log: AuditLogRecordForReport) {
  const details: string[] = [];

  const model = metadataText(log.metadata, 'model');
  const outputType = metadataText(log.metadata, 'output_type');
  const statusFrom = metadataText(log.metadata, 'from');
  const statusTo = metadataText(log.metadata, 'to');
  const documentType = metadataText(log.metadata, 'document_type');
  const sensitivity = metadataText(log.metadata, 'sensitivity');
  const fileName = metadataText(log.metadata, 'file_name');
  const invitedEmail =
    metadataText(log.metadata, 'email') ??
    metadataText(log.metadata, 'invitation_email') ??
    metadataText(log.metadata, 'invited_email');
  const invitedRole = metadataText(log.metadata, 'role');
  const invitationStatus = metadataText(log.metadata, 'status');

  if (model) details.push(`Modelo: ${model}`);
  if (outputType) details.push(`Salida: ${outputType}`);
  if (statusFrom || statusTo) details.push(`Estado: ${statusFrom ?? '-'} → ${statusTo ?? '-'}`);
  if (documentType) details.push(`Tipo: ${documentType}`);
  if (sensitivity) details.push(`Sensibilidad: ${sensitivityLabel(sensitivity)}`);
  if (fileName && !details.some((item) => item.includes(fileName))) {
    details.push(`Archivo: ${fileName}`);
  }
  if (invitedEmail) details.push(`Invitado: ${invitedEmail}`);
  if (invitedRole) details.push(`Rol: ${invitationRoleLabel(invitedRole)}`);
  if (invitationStatus) details.push(`Estado: ${invitationStatusLabel(invitationStatus)}`);

  if (details.length === 0) return 'Sin detalle adicional registrado.';

  return details.slice(0, 3).join(' · ');
}

function isDocumentAudit(log: AuditLogRecordForReport) {
  return log.resource_type === 'document' || log.action.startsWith('document_');
}

function isAiAudit(log: AuditLogRecordForReport) {
  return (
    log.action.includes('analyzed') ||
    metadataText(log.metadata, 'output_type') === 'document_analysis'
  );
}

function isCaseAudit(log: AuditLogRecordForReport) {
  return log.resource_type === 'case' || log.action.startsWith('case_');
}

function isInvitationAudit(log: AuditLogRecordForReport) {
  return (
    log.resource_type === 'user_invitation' ||
    log.resource_type === 'invitation' ||
    log.action.includes('invitation') ||
    log.action.includes('invitacion')
  );
}

function filterAuditLogs(logs: AuditLogRecordForReport[], filter: AuditFilter) {
  if (filter === 'documentos') return logs.filter(isDocumentAudit);
  if (filter === 'ia') return logs.filter(isAiAudit);
  if (filter === 'expedientes') return logs.filter(isCaseAudit);
  if (filter === 'invitaciones') return logs.filter(isInvitationAudit);

  return logs;
}

function isInvitationExpired(invitation: InvitationReportRecord) {
  return (
    invitation.is_expired === true ||
    invitation.status === 'expired' ||
    invitation.operational_status === 'Vencida'
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const query = await searchParams;
  const activeView: ReportView = isValidView(query.vista) ? query.vista : 'general';
  const activeAuditFilter: AuditFilter = isValidAuditFilter(query.tipo)
    ? query.tipo
    : 'todos';

const { user, profile } = await getUserProfile();

if (!user) redirect("/login");
if (!profile) redirect("/onboarding");

if (activeView === "invitaciones" && profile.role !== "admin") {
  redirect("/acceso-denegado");
}

if (
  activeView === "auditoria" &&
  profile.role !== "admin" &&
  profile.role !== "auditor"
) {
  redirect("/acceso-denegado");
}
  const supabase = await createClient();

  const [
    casesResult,
    documentsResult,
    aiOutputsResult,
    auditLogsResult,
    profilesResult,
    invitationMetricsResult,
    invitationsResult,
  ] = await Promise.all([
    supabase
      .from('cases')
      .select('id, title, client_name, case_type, status, created_at')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false }),

    supabase
      .from('documents')
      .select(
        'id, file_name, document_type, sensitivity_level, file_size, file_mime_type, created_at'
      )
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false }),

    supabase
      .from('ai_outputs')
      .select('id, document_id, output_type, model_name, result_json, created_at')
      .eq('organization_id', profile.organization_id)
      .eq('output_type', 'document_analysis')
      .order('created_at', { ascending: false }),

    supabase
      .from('audit_logs')
      .select(
        'id, organization_id, user_id, action, resource_type, resource_id, metadata, created_at'
      )
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(80),

    supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('organization_id', profile.organization_id),

    supabase
      .from('invitation_operational_metrics')
      .select(
        'total_invitations, pending_invitations, accepted_invitations, cancelled_invitations, expired_invitations, last_invitation_created_at'
      )
      .maybeSingle(),

    supabase
      .from('invitation_operational_report')
      .select(
        'id, organization_id, email, role, status, invited_by, created_at, expires_at, accepted_at, cancelled_at, operational_status, is_expired, requires_attention'
      )
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  const cases = (casesResult.data ?? []) as CaseRecord[];
  const documents = (documentsResult.data ?? []) as DocumentRecordForReport[];
  const aiOutputs = (aiOutputsResult.data ?? []) as AiOutputRecordForReport[];
  const auditLogs = (auditLogsResult.data ?? []) as AuditLogRecordForReport[];
  const profiles = (profilesResult.data ?? []) as ProfileRecordForReport[];
  const invitationMetrics =
    (invitationMetricsResult.data as InvitationMetricsRecord | null) ?? null;
  const invitations = (invitationsResult.data ?? []) as InvitationReportRecord[];

  const documentsById = new Map(documents.map((document) => [document.id, document]));
  const casesById = new Map(cases.map((caseItem) => [caseItem.id, caseItem]));
  const profilesById = new Map(
    profiles.map((profileItem) => [profileItem.id, profileItem])
  );

  const analysisCountByDocument = getAnalysisCountByDocument(aiOutputs);

  const totalCases = cases.length;
  const activeCases = cases.filter((item) => item.status !== 'archived').length;

  const totalDocuments = documents.length;

  const analyzedDocumentsList = documents.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) > 0
  );

  const pendingDocumentsList = documents.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) === 0
  );

  const reanalyzedDocumentsList = documents.filter(
    (item) => (analysisCountByDocument.get(item.id) ?? 0) > 1
  );

  const sensitiveDocumentsList = documents
    .filter((item) => sensitivityRank(item.sensitivity_level) >= 3)
    .sort(
      (a, b) => sensitivityRank(b.sensitivity_level) - sensitivityRank(a.sensitivity_level)
    );

  const analyzedDocuments = analyzedDocumentsList.length;
  const pendingDocuments = pendingDocumentsList.length;
  const reanalyzedDocuments = reanalyzedDocumentsList.length;

  const coverage = getPercentage(analyzedDocuments, totalDocuments);

  const iaFocusDocuments = uniqueDocuments([
    ...pendingDocumentsList,
    ...reanalyzedDocumentsList,
    ...analyzedDocumentsList,
  ]);

  const focusDocuments =
    activeView === 'ia'
      ? iaFocusDocuments
      : activeView === 'sensibilidad'
        ? sensitiveDocumentsList
        : documents;

  const documentAuditLogs = auditLogs.filter(isDocumentAudit);
  const iaAuditLogs = auditLogs.filter(isAiAudit);
  const caseAuditLogs = auditLogs.filter(isCaseAudit);
  const invitationAuditLogs = auditLogs.filter(isInvitationAudit);
  const filteredAuditLogs = filterAuditLogs(auditLogs, activeAuditFilter);

  const auditedUsers = new Set(auditLogs.map((log) => log.user_id).filter(Boolean)).size;

  const pendingInvitationsFromRows = invitations.filter(
    (item) => item.status === 'pending' && !isInvitationExpired(item)
  );
  const acceptedInvitationsFromRows = invitations.filter(
    (item) => item.status === 'accepted' || item.operational_status === 'Aceptada'
  );
  const cancelledInvitationsFromRows = invitations.filter(
    (item) => item.status === 'cancelled' || item.operational_status === 'Cancelada'
  );
  const expiredInvitationsFromRows = invitations.filter(isInvitationExpired);
  const attentionInvitationsFromRows = invitations.filter(
    (item) => item.requires_attention === true
  );

  const hasInvitationRows = invitations.length > 0;

  const totalInvitations = hasInvitationRows
    ? invitations.length
    : getMetricValue(invitationMetrics?.total_invitations);

  const pendingInvitations = hasInvitationRows
    ? pendingInvitationsFromRows.length
    : getMetricValue(invitationMetrics?.pending_invitations);

  const acceptedInvitations = hasInvitationRows
    ? acceptedInvitationsFromRows.length
    : getMetricValue(invitationMetrics?.accepted_invitations);

  const cancelledInvitations = hasInvitationRows
    ? cancelledInvitationsFromRows.length
    : getMetricValue(invitationMetrics?.cancelled_invitations);

  const expiredInvitations = hasInvitationRows
    ? expiredInvitationsFromRows.length
    : getMetricValue(invitationMetrics?.expired_invitations);

  const attentionInvitations = hasInvitationRows
    ? attentionInvitationsFromRows.length
    : pendingInvitations;

  const lastInvitationCreatedAt =
    invitations[0]?.created_at ?? invitationMetrics?.last_invitation_created_at ?? null;

  const hasInvitationReadError = Boolean(
    invitationMetricsResult.error || invitationsResult.error
  );

  const hasPendingExpiredInvitations = expiredInvitations > 0;
  const invitationsToDisplay =
    activeView === 'invitaciones' ? invitations : invitations.slice(0, 5);

  const sensitivityStats = [
    {
      key: 'low',
      label: 'Bajo',
      value: documents.filter((item) => sensitivityRank(item.sensitivity_level) === 1).length,
      className: 'bg-emerald-500',
    },
    {
      key: 'medium',
      label: 'Medio',
      value: documents.filter((item) => sensitivityRank(item.sensitivity_level) === 2)
        .length,
      className: 'bg-sky-500',
    },
    {
      key: 'high',
      label: 'Alto',
      value: documents.filter((item) => sensitivityRank(item.sensitivity_level) === 3)
        .length,
      className: 'bg-amber-500',
    },
    {
      key: 'critical',
      label: 'Crítico',
      value: documents.filter((item) => sensitivityRank(item.sensitivity_level) === 4)
        .length,
      className: 'bg-rose-500',
    },
  ];

  const metrics = [
    {
      label: 'Expedientes totales',
      value: totalCases,
      helper: `${activeCases} activos`,
    },
    {
      label: 'Documentos cargados',
      value: totalDocuments,
      helper: 'Bóveda privada',
    },
    {
      label: 'Análisis IA',
      value: aiOutputs.length,
      helper: 'Ejecuciones simuladas',
    },
    {
      label: 'Cobertura IA',
      value: `${coverage}%`,
      helper: `${analyzedDocuments}/${totalDocuments} documentos`,
    },
    {
      label: 'Pendientes IA',
      value: pendingDocuments,
      helper: 'Requieren análisis',
    },
    {
      label: 'Reanalizados',
      value: reanalyzedDocuments,
      helper: 'Con más de una versión',
    },
  ];

  const invitationCards = [
    {
      label: 'Invitaciones totales',
      value: totalInvitations,
      helper: 'Altas operativas registradas',
    },
    {
      label: 'Pendientes',
      value: pendingInvitations,
      helper: 'Esperando activación',
    },
    {
      label: 'Aceptadas',
      value: acceptedInvitations,
      helper: 'Completadas o validadas',
    },
    {
      label: 'Canceladas',
      value: cancelledInvitations,
      helper: 'Sin continuidad operativa',
    },
    {
      label: 'Vencidas',
      value: expiredInvitations,
      helper: 'Fuera de plazo',
    },
  ];

  const views: Array<{ label: string; value: ReportView; href: string }> = [
    { label: 'General', value: 'general', href: '/reportes' },
    { label: 'Documentos', value: 'documentos', href: '/reportes?vista=documentos' },
    { label: 'IA documental', value: 'ia', href: '/reportes?vista=ia' },
    { label: 'Sensibilidad', value: 'sensibilidad', href: '/reportes?vista=sensibilidad' },
    { label: 'Invitaciones', value: 'invitaciones', href: '/reportes?vista=invitaciones' },
    { label: 'Auditoría', value: 'auditoria', href: '/reportes?vista=auditoria' },
  ];

  const auditFilters: Array<{
    label: string;
    value: AuditFilter;
    href: string;
    count: number;
  }> = [
    {
      label: 'Todos',
      value: 'todos',
      href: '/reportes?vista=auditoria',
      count: auditLogs.length,
    },
    {
      label: 'Documentos',
      value: 'documentos',
      href: '/reportes?vista=auditoria&tipo=documentos',
      count: documentAuditLogs.length,
    },
    {
      label: 'IA',
      value: 'ia',
      href: '/reportes?vista=auditoria&tipo=ia',
      count: iaAuditLogs.length,
    },
    {
      label: 'Expedientes',
      value: 'expedientes',
      href: '/reportes?vista=auditoria&tipo=expedientes',
      count: caseAuditLogs.length,
    },
    {
      label: 'Invitaciones',
      value: 'invitaciones',
      href: '/reportes?vista=auditoria&tipo=invitaciones',
      count: invitationAuditLogs.length,
    },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Reportes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Reporte operativo del sistema
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Vista general de expedientes, documentos, análisis IA, invitaciones y
            actividad auditada.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/usuarios/invitaciones"
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700"
          >
            Gestionar invitaciones
          </Link>

          <Link
            href="/documentos"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Ver documentos
          </Link>

          <Link
            href="/documentos?ia=pendientes"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Ver pendientes IA
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {views.map((view) => (
          <Link
            key={view.value}
            href={view.href}
            className={`rounded-2xl px-4 py-2 text-sm font-bold ${
              activeView === view.value
                ? 'bg-slate-950 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {view.label}
          </Link>
        ))}
      </div>

      {hasInvitationReadError ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          No se pudieron leer completamente las vistas operativas de invitaciones.
          Verificá que existan public.invitation_operational_metrics y
          public.invitation_operational_report.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p>

            <p className="mt-3 text-xs text-slate-500">{metric.helper}</p>
          </div>
        ))}
      </div>

      {activeView === 'general' || activeView === 'invitaciones' ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Invitaciones
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Control operativo de altas
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Seguimiento de invitaciones creadas en modo controlado. Este módulo no
                activa todavía altas automáticas con Supabase Auth.
              </p>
            </div>

            <Link
              href="/usuarios/invitaciones"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Abrir bandeja
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {invitationCards.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm font-semibold text-slate-500">{metric.label}</p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {metric.value}
                </p>

                <p className="mt-3 text-xs text-slate-500">{metric.helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div
              className={`rounded-2xl border p-5 ${
                hasPendingExpiredInvitations
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50'
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  hasPendingExpiredInvitations ? 'text-amber-950' : 'text-emerald-950'
                }`}
              >
                Estado operativo
              </p>

              <p
                className={`mt-2 text-sm leading-6 ${
                  hasPendingExpiredInvitations ? 'text-amber-800' : 'text-emerald-800'
                }`}
              >
                {hasPendingExpiredInvitations
                  ? 'Hay invitaciones vencidas. Conviene cancelarlas o recrearlas para mantener limpio el control de accesos.'
                  : 'No se detectan invitaciones vencidas. El control operativo de altas se mantiene estable.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
                  {attentionInvitations} requieren atención
                </span>

                <span className="rounded-full bg-white/70 px-3 py-1 text-slate-700">
                  Última: {formatDate(lastInvitationCreatedAt)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-950">
                Uso recomendado para beta cerrada
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Las invitaciones funcionan como registro operativo previo al alta real. Para
                una beta cerrada online, el usuario tester puede crearse manualmente en
                Supabase Auth y quedar documentado en esta bandeja como control interno.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/usuarios"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ver usuarios
                </Link>

                <Link
                  href="/reportes?vista=auditoria&tipo=invitaciones"
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Ver auditoría de invitaciones
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Invitado</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Atención</th>
                  <th className="px-4 py-3">Fechas</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {invitationsToDisplay.map((invitation) => (
                  <tr key={invitation.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">
                        {invitation.email ?? 'Sin email'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ID: {invitation.id.slice(0, 8)}...
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {invitationRoleLabel(invitation.role)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${invitationStatusTone(
                          invitation.status,
                          invitation.is_expired
                        )}`}
                      >
                        {invitation.operational_status ??
                          invitationStatusLabel(invitation.status)}
                      </span>

                      <p className="mt-2 text-xs text-slate-500">
                        Estado técnico: {invitation.status ?? 'sin_estado'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {invitation.requires_attention ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          Requiere seguimiento
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          Sin alerta
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs leading-5 text-slate-500">
                      <p>Creada: {formatDate(invitation.created_at)}</p>
                      <p>Vence: {formatDate(invitation.expires_at)}</p>
                      <p>Aceptada: {formatDate(invitation.accepted_at)}</p>
                      <p>Cancelada: {formatDate(invitation.cancelled_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invitationsToDisplay.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Todavía no hay invitaciones registradas para esta organización.
              </div>
            ) : null}
          </div>

          {activeView === 'general' && invitations.length > 5 ? (
            <div className="mt-5 flex justify-end">
              <Link
                href="/reportes?vista=invitaciones"
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver todas las invitaciones
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeView === 'general' || activeView === 'ia' ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                  Cobertura IA
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-950">
                  Estado del análisis documental
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Medición de documentos analizados, pendientes y reanalizados.
                </p>
              </div>

              <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
                {coverage}%
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-600">
                  Progreso de cobertura
                </span>
                <span className="font-bold text-slate-950">
                  {analyzedDocuments}/{totalDocuments}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${coverage}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Analizados
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {analyzedDocuments}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Pendientes
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {pendingDocuments}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Reanalizados
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {reanalyzedDocuments}
                </p>
              </div>
            </div>

            {pendingDocuments > 0 ? (
              <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-amber-950">
                    Hay documentos pendientes de análisis.
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Conviene completar la cobertura IA para mantener el control documental.
                  </p>
                </div>

                <Link
                  href="/documentos?ia=pendientes"
                  className="rounded-2xl bg-amber-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-950"
                >
                  Revisar pendientes
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">
                  Cobertura IA completa.
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Todos los documentos cargados tienen al menos un análisis IA simulado.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Acciones rápidas
            </p>

            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              Control operativo
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Accesos directos para continuar el flujo de revisión documental.
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href="/documentos/subir"
                className="rounded-2xl bg-sky-500 px-5 py-4 text-sm font-bold text-white hover:bg-sky-600"
              >
                Subir nuevo documento
              </Link>

              <Link
                href="/documentos?ia=pendientes"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver documentos pendientes IA
              </Link>

              <Link
                href="/reportes?vista=invitaciones"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver invitaciones operativas
              </Link>

              <Link
                href="/reportes?vista=sensibilidad"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver sensibilidad documental
              </Link>

              <Link
                href="/reportes?vista=auditoria"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ver auditoría reciente
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {activeView === 'general' || activeView === 'sensibilidad' ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Sensibilidad
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-950">
            Distribución documental
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Clasificación de documentos según sensibilidad asignada.
          </p>

          <div className="mt-6 grid gap-5 xl:grid-cols-4">
            {sensitivityStats.map((item) => {
              const percentage = getPercentage(item.value, totalDocuments);

              return (
                <div key={item.key} className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-950">
                      {item.value} · {percentage}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.className}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {sensitiveDocumentsList.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-950">
                Hay documentos de sensibilidad alta o crítica.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Conviene revisarlos periódicamente y mantener controlados los accesos.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-900">
                No hay documentos marcados como alta sensibilidad.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {activeView === 'documentos' ||
      activeView === 'ia' ||
      activeView === 'sensibilidad' ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-950">
                {activeView === 'ia'
                  ? 'Control de análisis IA por documento'
                  : activeView === 'sensibilidad'
                    ? 'Documentos sensibles'
                    : 'Inventario documental'}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {activeView === 'ia'
                  ? 'Listado operativo para revisar documentos pendientes, analizados y reanalizados.'
                  : activeView === 'sensibilidad'
                    ? 'Documentos con sensibilidad alta o crítica.'
                    : 'Listado general de documentos cargados en la bóveda.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/documentos"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Ir a bóveda
              </Link>

              <Link
                href="/documentos/subir"
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
              >
                Subir documento
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Archivo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Sensibilidad</th>
                  <th className="px-4 py-3">IA</th>
                  <th className="px-4 py-3">Tamaño</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {focusDocuments.map((document) => {
                  const analysisCount = analysisCountByDocument.get(document.id) ?? 0;

                  return (
                    <tr key={document.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/documentos/${document.id}`}>
                          <p className="font-bold text-slate-950 hover:text-sky-700">
                            {document.file_name}
                          </p>
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(document.created_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {document.document_type ?? 'No definido'}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {sensitivityLabel(document.sensitivity_level)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getDocumentAiClass(
                            analysisCount
                          )}`}
                        >
                          {getDocumentAiLabel(analysisCount)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatSize(document.file_size)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/documentos/${document.id}`}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white"
                          >
                            Ver
                          </Link>

                          {analysisCount === 0 ? (
                            <form action={analyzeDocument}>
                              <input
                                type="hidden"
                                name="document_id"
                                value={document.id}
                              />

                              <button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                                Analizar
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {focusDocuments.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No hay documentos para esta vista.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeView === 'auditoria' ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Trazabilidad
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-950">
                Centro de auditoría operativa
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Control de acciones registradas por usuario, recurso, evento y fecha.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              {auditLogs.length} eventos totales
            </span>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Eventos auditados
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {auditLogs.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Eventos documentales
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {documentAuditLogs.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Eventos IA
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {iaAuditLogs.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Invitaciones
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {invitationAuditLogs.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Usuarios detectados
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {auditedUsers}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {auditFilters.map((filter) => (
              <Link
                key={filter.value}
                href={filter.href}
                className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                  activeAuditFilter === filter.value
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {filter.label} · {filter.count}
              </Link>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Recurso</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="align-top hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${actionTone(
                          log.action
                        )}`}
                      >
                        {actionLabel(log.action)}
                      </span>

                      <p className="mt-2 text-xs text-slate-500">
                        Acción técnica: {log.action}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">
                        {getActorLabel(log, profilesById)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {getActorRole(log, profilesById)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">
                        {getResourceLabel(log, documentsById, casesById)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {log.resource_type ?? 'sin_tipo'}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {getAuditDetail(log)}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAuditLogs.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No hay eventos para este filtro de auditoría.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeView === 'general' ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Documentos recientes
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Últimos archivos cargados en la bóveda documental.
                </p>
              </div>

              <Link
                href="/reportes?vista=documentos"
                className="text-sm font-bold text-sky-600 hover:text-sky-700"
              >
                Ver inventario
              </Link>
            </div>

            <div className="space-y-3">
              {documents.slice(0, 6).map((document) => {
                const analysisCount = analysisCountByDocument.get(document.id) ?? 0;

                return (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <Link href={`/documentos/${document.id}`}>
                          <p className="font-bold text-slate-950 hover:text-sky-700">
                            {document.file_name}
                          </p>
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(document.created_at)} ·{' '}
                          {formatSize(document.file_size)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getDocumentAiClass(
                          analysisCount
                        )}`}
                      >
                        {getDocumentAiLabel(analysisCount)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      Tipo: {document.document_type ?? 'No definido'} · Sensibilidad:{' '}
                      {sensitivityLabel(document.sensitivity_level)}
                    </p>
                  </div>
                );
              })}

              {documents.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Todavía no hay documentos cargados.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Últimos análisis IA
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Historial reciente de análisis simulados.
                </p>
              </div>

              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                {aiOutputs.length} registros
              </span>
            </div>

            <div className="space-y-3">
              {aiOutputs.slice(0, 6).map((output) => {
                const relatedDocument = output.document_id
                  ? documentsById.get(output.document_id)
                  : null;

                return (
                  <div
                    key={output.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {output.result_json?.tipo_documental_detectado ??
                            relatedDocument?.file_name ??
                            'Análisis documental'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(output.created_at)}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                        {output.model_name ?? 'simulated-local-v1'}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {output.result_json?.resumen ??
                        'Análisis guardado sin resumen disponible.'}
                    </p>
                  </div>
                );
              })}

              {aiOutputs.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Todavía no hay análisis IA guardados.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {activeView === 'general' ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">
              Expedientes recientes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Últimos expedientes registrados en la organización.
            </p>

            <div className="mt-5 space-y-3">
              {cases.slice(0, 5).map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Link href={`/expedientes/${caseItem.id}`}>
                    <p className="font-bold text-slate-950 hover:text-sky-700">
                      {caseItem.title}
                    </p>
                  </Link>

                  <p className="mt-1 text-sm text-slate-600">
                    Cliente: {caseItem.client_name ?? 'Sin cliente'}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Estado: {statusLabel(caseItem.status)} ·{' '}
                    {formatDate(caseItem.created_at)}
                  </p>
                </div>
              ))}

              {cases.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Todavía no hay expedientes registrados.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Actividad auditada reciente
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Últimos eventos registrados en la tabla de auditoría.
                </p>
              </div>

              <Link
                href="/reportes?vista=auditoria"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                Ver {auditLogs.length} eventos
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Recurso</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${actionTone(
                            log.action
                          )}`}
                        >
                          {actionLabel(log.action)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {getActorLabel(log, profilesById)}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {getResourceLabel(log, documentsById, casesById)}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {auditLogs.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  Todavía no hay eventos auditados.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
